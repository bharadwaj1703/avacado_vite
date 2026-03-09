import type { IncomingMessage, ServerResponse } from 'node:http'
import { getDb } from '../_lib/db/adapter.js'
import { methodNotAllowed, readBodyJson, sendJson } from '../_lib/http.js'
import { requireClerkUserId } from '../_lib/auth.js'

type SyncBody = {
  leadId?: string
  displayName?: string
}

export default async function handler(req: IncomingMessage & { body?: unknown }, res: ServerResponse) {
  if (req.method !== 'POST') {
    methodNotAllowed(res, 'POST')
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

  try {
    const body = await readBodyJson<SyncBody>(req)
    const db = await getDb()
    const userId = await db.upsertUserFromClerk({
      clerkUserId,
      leadId: body.leadId,
      displayName: body.displayName,
    })

    sendJson(res, 200, { userId })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    const statusCode = message.toLowerCase().includes('database is locked') ? 503 : 500
    sendJson(res, statusCode, { error: message })
  }
}
