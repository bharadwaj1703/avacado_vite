import type { IncomingMessage, ServerResponse } from 'node:http'
import { getDb } from '../_lib/db/adapter.js'
import { methodNotAllowed, readBodyJson, sendJson } from '../_lib/http.js'
import { requireClerkUserId } from '../_lib/auth.js'
import { getEnv } from '../_lib/env.js'
import { fetchAllowedModels, isModelAllowed } from '../_lib/openrouter-models.js'

const MAX_CHATS = 50

export default async function handler(req: IncomingMessage & { body?: unknown }, res: ServerResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    methodNotAllowed(res, 'GET, POST')
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

  if (req.method === 'GET') {
    const limit = MAX_CHATS
    const chats = await db.listChatsByUserId(userId, limit)
    sendJson(res, 200, { data: chats })
    return
  }

  if (req.method === 'POST') {
    const hasActive = await db.hasUserActiveChat(userId)
    if (hasActive) {
      sendJson(res, 409, {
        error: 'Another chat is still generating a response. Wait for it to finish before starting a new chat.',
      })
      return
    }
    const count = await db.countChatsByUserId(userId)
    if (count >= MAX_CHATS) {
      sendJson(res, 400, { error: 'Maximum 50 chats per user. Delete an old chat to create a new one.' })
      return
    }
    const body = await readBodyJson<{ title?: string | null; modelId?: string }>(req)
    const title = typeof body.title === 'string' ? body.title : undefined
    const modelId = typeof body.modelId === 'string' ? body.modelId.trim() : ''
    if (!modelId) {
      sendJson(res, 400, { error: 'Missing modelId.' })
      return
    }

    const env = getEnv()
    const allowedModels = await fetchAllowedModels(env)
    if (!isModelAllowed(modelId, allowedModels)) {
      sendJson(res, 400, { error: 'Selected model is not allowed.' })
      return
    }

    const id = await db.createChat(userId, modelId, title ?? null)
    const chat = await db.getChatById(id)
    sendJson(res, 200, chat!)
    return
  }
}
