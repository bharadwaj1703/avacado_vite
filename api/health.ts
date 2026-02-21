import type { IncomingMessage, ServerResponse } from 'node:http'
import { getDb } from './_lib/db/adapter'
import { methodNotAllowed, sendJson } from './_lib/http'

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'GET') {
    methodNotAllowed(res, 'GET')
    return
  }

  try {
    const db = await getDb()
    await db.migrate()
    const health = await db.health()
    sendJson(res, 200, health)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    sendJson(res, 500, { error: message })
  }
}
