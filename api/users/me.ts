import type { IncomingMessage, ServerResponse } from 'node:http'
import { getDb } from '../_lib/db/adapter'
import { methodNotAllowed, sendJson } from '../_lib/http'
import { requireClerkUserId } from '../_lib/auth'

export default async function handler(req: IncomingMessage & { body?: unknown }, res: ServerResponse) {
  if (req.method !== 'GET') {
    methodNotAllowed(res, 'GET')
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
    const db = await getDb()

    // Read first to avoid write-lock churn on every /me request.
    let user = await db.findUserByClerkId(clerkUserId)
    if (!user) {
      await db.upsertUserFromClerk({ clerkUserId })
      user = await db.findUserByClerkId(clerkUserId)
    }

    if (!user) {
      sendJson(res, 500, { error: 'Failed to retrieve user after upsert.' })
      return
    }

    sendJson(res, 200, {
      id: user.id,
      clerkUserId: user.clerk_user_id,
      displayName: user.display_name,
      onboardingCompletedAt: user.onboarding_completed_at,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    const statusCode = message.toLowerCase().includes('database is locked') ? 503 : 500
    sendJson(res, statusCode, { error: message })
  }
}
