import type { IncomingMessage, ServerResponse } from 'node:http'
import { getDb } from '../_lib/db/adapter.js'
import { methodNotAllowed, sendJson } from '../_lib/http.js'
import { requireClerkUserId } from '../_lib/auth.js'

export default async function handler(req: IncomingMessage & { body?: unknown }, res: ServerResponse) {
  console.log('[users/me] Request received:', req.method)
  
  if (req.method !== 'GET') {
    methodNotAllowed(res, 'GET')
    return
  }

  let clerkUserId: string
  try {
    clerkUserId = await requireClerkUserId(req)
    console.log('[users/me] Clerk user ID:', clerkUserId)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[users/me] Auth error:', message, error)
    sendJson(res, 401, { error: message })
    return
  }

  try {
    console.log('[users/me] Getting database connection...')
    const db = await getDb()

    // Read first to avoid write-lock churn on every /me request.
    console.log('[users/me] Finding user by Clerk ID...')
    let user = await db.findUserByClerkId(clerkUserId)
    if (!user) {
      console.log('[users/me] User not found, upserting...')
      await db.upsertUserFromClerk({ clerkUserId })
      user = await db.findUserByClerkId(clerkUserId)
    }

    if (!user) {
      console.error('[users/me] Failed to retrieve user after upsert')
      sendJson(res, 500, { error: 'Failed to retrieve user after upsert.' })
      return
    }

    console.log('[users/me] Success:', { id: user.id, displayName: user.display_name })
    sendJson(res, 200, {
      id: user.id,
      clerkUserId: user.clerk_user_id,
      displayName: user.display_name,
      onboardingCompletedAt: user.onboarding_completed_at,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[users/me] Error:', message, error)
    const statusCode = message.toLowerCase().includes('database is locked') ? 503 : 500
    sendJson(res, statusCode, { error: message })
  }
}
