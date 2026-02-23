import type { IncomingMessage, ServerResponse } from 'node:http'
import { getDb } from '../_lib/db/adapter'
import { methodNotAllowed, sendJson } from '../_lib/http'
import { requireClerkUserId } from '../_lib/auth'

function getPathParamId(req: IncomingMessage): string | null {
  const url = req.url ?? ''
  const path = url.split('?')[0]
  const segments = path.split('/').filter(Boolean)
  const chatsIndex = segments.indexOf('chats')
  if (chatsIndex === -1 || chatsIndex === segments.length - 1) return null
  return segments[chatsIndex + 1] ?? null
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'GET' && req.method !== 'DELETE') {
    methodNotAllowed(res, 'GET, DELETE')
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

  const chatId = getPathParamId(req)
  if (!chatId) {
    sendJson(res, 404, { error: 'Not found.' })
    return
  }

  const db = await getDb()
  const user = await db.findUserByClerkId(clerkUserId)
  if (!user) {
    sendJson(res, 401, { error: 'User not found.' })
    return
  }

  const chat = await db.getChatById(chatId)
  if (!chat) {
    sendJson(res, 404, { error: 'Not found.' })
    return
  }
  if (chat.user_id !== user.id) {
    sendJson(res, 404, { error: 'Not found.' })
    return
  }

  if (req.method === 'DELETE') {
    await db.softDeleteChat(chatId)
    sendJson(res, 200, { ok: true })
    return
  }

  const messages = await db.listMessagesByChatId(chatId)
  sendJson(res, 200, { chat, messages })
}
