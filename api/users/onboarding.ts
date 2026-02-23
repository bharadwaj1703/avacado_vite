import type { IncomingMessage, ServerResponse } from 'node:http'
import { getDb } from '../_lib/db/adapter'
import { methodNotAllowed, readBodyJson, sendJson } from '../_lib/http'
import { requireClerkUserId } from '../_lib/auth'
import type { OnboardingInput } from '../_lib/types'

export default async function handler(req: IncomingMessage & { body?: unknown }, res: ServerResponse) {
  if (req.method !== 'POST') {
    methodNotAllowed(res, 'POST')
    return
  }

  try {
    const clerkUserId = await requireClerkUserId(req)
    const input = await readBodyJson<OnboardingInput>(req)

    if (typeof input.completed !== 'boolean') {
      sendJson(res, 400, { error: 'Invalid payload: completed is required.' })
      return
    }

    const db = await getDb()
    const result = await db.updateOnboarding({ clerkUserId, input })
    sendJson(res, 200, result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    sendJson(res, 401, { error: message })
  }
}
