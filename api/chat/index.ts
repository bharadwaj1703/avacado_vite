import { randomUUID } from 'node:crypto'
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
    sendJson(res, 404, { error: 'User not found.' })
    return
  }
  const userId = user.id

  let body: { id: string; message: UIMessage }
  try {
    body = await readBodyJson<{ id: string; message: UIMessage }>(req)
  } catch {
    sendJson(res, 400, { error: 'Invalid JSON body.' })
    return
  }

  const { id: chatId, message: incomingMessage } = body
  if (!chatId || !incomingMessage) {
    sendJson(res, 400, { error: 'Missing id or message.' })
    return
  }

  if (incomingMessage.role !== 'user') {
    sendJson(res, 400, { error: 'Only user messages can be sent.' })
    return
  }

  const chat = await db.getChatById(chatId)
  if (!chat || chat.user_id !== userId) {
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

  const userCharCount = userMessageTextLength(incomingMessage)
  if (userCharCount > MAX_USER_MESSAGE_CHARS) {
    sendJson(res, 400, { error: `Message too long. Maximum ${MAX_USER_MESSAGE_CHARS} characters for user messages.` })
    return
  }

  const env = getEnv()
  assertOpenRouterApiKey(env)
  const allowedModels = await fetchAllowedModels(env)
  const defaultModelId = allowedModels[0]?.id
  const requestedModelId = chat.model_id?.trim() || defaultModelId

  if (!requestedModelId) {
    sendJson(res, 400, { error: 'No allowed model available.' })
    return
  }

  if (!isModelAllowed(requestedModelId, allowedModels)) {
    sendJson(res, 400, { error: 'The model configured for this chat is not allowed.' })
    return
  }

  let messageRows = await db.listMessagesByChatId(chatId)
  const hasSystemMessage = messageRows.some((row) => row.role === 'system')

  if (!hasSystemMessage) {
    const systemPrompt = loadChatSystemPrompt()
    const systemMessage: UIMessage = {
      id: `sys_${randomUUID()}`,
      role: 'system',
      parts: [{ type: 'text', text: systemPrompt }],
    }
    await db.insertMessage(chatId, 'system', JSON.stringify(systemMessage))
    messageRows = await db.listMessagesByChatId(chatId)
  }

  const nonSystemCount = messageRows.filter((row) => row.role !== 'system').length
  if (nonSystemCount > MAX_MESSAGES_BEFORE_SEND) {
    sendJson(res, 400, { error: 'Maximum 10 messages per chat. Start a new chat.' })
    return
  }

  await db.updateChatStatus(chatId, 'awaiting_llm')
  await db.insertMessage(chatId, 'user', JSON.stringify(incomingMessage))

  messageRows = await db.listMessagesByChatId(chatId)
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

  const openrouter = createOpenRouter({ apiKey: env.openrouterApiKey })
  const model = openrouter.chat(requestedModelId)

  let lastUsage: LanguageModelUsage | null = null
  let lastFinishReason: string | undefined

  const generateMessageId = createIdGenerator({ prefix: 'msg', size: 16 })

  try {
    const result = streamText({
      model,
      messages: await convertToModelMessages(uiMessages),
    })

    await db.updateChatStatus(chatId, 'streaming')

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
      onFinish: async ({ responseMessage, isAborted }) => {
        try {
          const status = isAborted ? 'errored' : 'ready'
          await db.updateChatStatus(chatId, status)

          if (!isAborted && responseMessage) {
            const usageJson = lastUsage
              ? JSON.stringify({
                  promptTokens: lastUsage.inputTokens,
                  completionTokens: lastUsage.outputTokens,
                  totalTokens: lastUsage.totalTokens,
                })
              : undefined

            await db.insertMessage(chatId, 'assistant', JSON.stringify(responseMessage), {
              usage: usageJson,
              stopReason: lastFinishReason ?? null,
            })
          }
        } catch (err) {
          console.error('onFinish failed:', err)
          try {
            await db.updateChatStatus(chatId, 'errored')
          } catch {
            // best-effort
          }
        }
      },
      onError: () => 'An error occurred.',
    })
  } catch (err) {
    await db.updateChatStatus(chatId, 'errored')
    const message = err instanceof Error ? err.message : 'Unknown error'
    sendJson(res, 500, { error: message })
  }
}
