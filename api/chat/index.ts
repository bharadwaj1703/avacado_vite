import type { IncomingMessage, ServerResponse } from 'node:http'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import {
  convertToModelMessages,
  createIdGenerator,
  streamText,
  type LanguageModelUsage,
  type UIMessage,
} from 'ai'
import { getEnv } from '../_lib/env'
import { assertOpenRouterApiKey } from '../_lib/env'
import { getDb } from '../_lib/db/adapter'
import { readBodyJson, sendJson } from '../_lib/http'
import { requireClerkUserId } from '../_lib/auth'
import { fetchAllowedModels, isModelAllowed } from '../_lib/openrouter-models'
import { loadChatSystemPrompt } from '../_lib/chat-system-prompt'

const MAX_USER_MESSAGE_CHARS = 15_000
const MAX_MESSAGES_BEFORE_SEND = 8

function userMessageTextLength(message: UIMessage): number {
  if (message.role !== 'user') return 0
  let len = 0
  for (const part of message.parts ?? []) {
    if (part.type === 'text' && part.text) len += String(part.text).length
  }
  return len
}

function parseStoredContent(content: string): { id: string; role: string; parts: UIMessage['parts'] } | null {
  try {
    const o = JSON.parse(content) as unknown
    if (o && typeof o === 'object' && 'role' in o && 'parts' in o) {
      return {
        id: (o as { id?: string }).id ?? '',
        role: (o as { role: string }).role,
        parts: (o as { parts: UIMessage['parts'] }).parts,
      }
    }
  } catch {
    // ignore
  }
  return null
}

export default async function handler(req: IncomingMessage & { body?: unknown }, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Method not allowed. Use POST.' }))
    return
  }

  let clerkUserId: string
  try {
    clerkUserId = await requireClerkUserId(req)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    sendJson(res, 401, { error: message })
    return
  }

  const db = await getDb()
  const user = await db.findUserByClerkId(clerkUserId)
  if (!user) {
    sendJson(res, 401, { error: 'User not found.' })
    return
  }
  const userId = user.id

  let body: { id: string; message: UIMessage; model?: string }
  try {
    body = await readBodyJson<{ id: string; message: UIMessage; model?: string }>(req)
  } catch {
    sendJson(res, 400, { error: 'Invalid JSON body.' })
    return
  }
  const { id: chatId, message: incomingMessage, model: requestedModel } = body
  if (!chatId || !incomingMessage) {
    sendJson(res, 400, { error: 'Missing id or message.' })
    return
  }

  const chat = await db.getChatById(chatId)
  if (!chat) {
    sendJson(res, 404, { error: 'Not found.' })
    return
  }
  if (chat.user_id !== userId) {
    sendJson(res, 404, { error: 'Not found.' })
    return
  }

  const hasActive = await db.hasUserActiveChat(userId)
  if (hasActive) {
    sendJson(res, 409, {
      error: 'Another chat is still generating a response. Wait for it to finish before sending a new message.',
    })
    return
  }

  const messageRows = await db.listMessagesByChatId(chatId)
  if (messageRows.length > MAX_MESSAGES_BEFORE_SEND) {
    sendJson(res, 400, { error: 'Maximum 10 messages per chat. Start a new chat.' })
    return
  }

  const userCharCount = userMessageTextLength(incomingMessage)
  if (userCharCount > MAX_USER_MESSAGE_CHARS) {
    sendJson(res, 400, { error: `Message too long. Maximum ${MAX_USER_MESSAGE_CHARS} characters for user messages.` })
    return
  }

  const env = getEnv()
  assertOpenRouterApiKey(env)
  const allowedModels = await fetchAllowedModels(env)
  const defaultModelId = allowedModels[0]?.id
  const modelId = requestedModel && isModelAllowed(requestedModel, allowedModels) ? requestedModel : defaultModelId
  if (!modelId) {
    sendJson(res, 400, { error: 'No allowed model available.' })
    return
  }

  const systemPrompt = loadChatSystemPrompt()

  const uiMessages: UIMessage[] = []
  for (const row of messageRows) {
    const parsed = parseStoredContent(row.content)
    if (parsed) {
      uiMessages.push({
        id: parsed.id || row.id,
        role: parsed.role as UIMessage['role'],
        parts: parsed.parts ?? [],
      })
    }
  }
  uiMessages.push(incomingMessage)

  await db.updateChatStatus(chatId, 'streaming')

  const openrouter = createOpenRouter({ apiKey: env.openrouterApiKey! })
  const model = openrouter.chat(modelId)

  let lastUsage: LanguageModelUsage | null = null
  let lastFinishReason: string | undefined

  const generateMessageId = createIdGenerator({ prefix: 'msg', size: 16 })

  try {
    const result = streamText({
      model,
      system: systemPrompt,
      messages: await convertToModelMessages(uiMessages),
    })

    result.pipeUIMessageStreamToResponse(res, {
      originalMessages: uiMessages,
      generateMessageId,
      messageMetadata: ({ part }) => {
        if (part.type === 'finish') {
          lastUsage = part.totalUsage
          lastFinishReason = part.finishReason ?? part.rawFinishReason
        }
        return undefined
      },
      onFinish: async ({ messages, responseMessage, isAborted }) => {
        const status = isAborted ? 'errored' : 'ready'
        await db.updateChatStatus(chatId, status)
        const userMsg = messages[messages.length - 2]
        const assistantMsg = responseMessage
        if (userMsg) {
          await db.insertMessage(chatId, 'user', JSON.stringify(userMsg))
        }
        const usageJson = lastUsage
          ? JSON.stringify({
              promptTokens: lastUsage.inputTokens,
              completionTokens: lastUsage.outputTokens,
              totalTokens: lastUsage.totalTokens,
            })
          : undefined
        await db.insertMessage(chatId, 'assistant', JSON.stringify(assistantMsg), {
          usage: usageJson,
          stopReason: lastFinishReason ?? null,
        })
      },
      onError: () => 'An error occurred.',
    })
  } catch (err) {
    await db.updateChatStatus(chatId, 'errored')
    const message = err instanceof Error ? err.message : 'Unknown error'
    sendJson(res, 500, { error: message })
  }
}
