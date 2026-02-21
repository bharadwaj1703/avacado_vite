import type { IncomingMessage, ServerResponse } from 'node:http'
import { getDb } from './_lib/db/adapter'
import { methodNotAllowed, readBodyJson, sendJson } from './_lib/http'
import { requireClerkUserId } from './_lib/auth'
import type { RecordActivityInput } from './_lib/types'

const VALID_ACTIONS = new Set([
  'lesson_watched',
  'quiz_answered_correctly',
  'quiz_answered_incorrectly',
])

const VALID_ENTITIES = new Set(['lesson', 'quiz'])

export default async function handler(req: IncomingMessage & { body?: unknown }, res: ServerResponse) {
  if (req.method !== 'POST') {
    methodNotAllowed(res, 'POST')
    return
  }

  try {
    const clerkUserId = await requireClerkUserId(req)
    const input = await readBodyJson<RecordActivityInput>(req)

    if (!VALID_ACTIONS.has(input.actionKind) || !VALID_ENTITIES.has(input.entity) || !input.slug) {
      sendJson(res, 400, { error: 'Invalid activity payload.' })
      return
    }

    const db = await getDb()
    await db.migrate()

    const activityId = await db.insertActivity({ clerkUserId, input })
    sendJson(res, 200, { activityId })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    sendJson(res, 401, { error: message })
  }
}
