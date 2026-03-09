import type { IncomingMessage, ServerResponse } from 'node:http'
import { getDb } from '../_lib/db/adapter.js'
import { methodNotAllowed, readBodyJson, sendJson } from '../_lib/http.js'
import { requireClerkUserId } from '../_lib/auth.js'
import type { OnboardingInput } from '../_lib/types'

export default async function handler(req: IncomingMessage & { body?: unknown }, res: ServerResponse) {
  console.log('[onboarding] Request received:', req.method)
  
  if (req.method !== 'POST') {
    methodNotAllowed(res, 'POST')
    return
  }

  try {
    const clerkUserId = await requireClerkUserId(req)
    console.log('[onboarding] Clerk user ID:', clerkUserId)
    
    const input = await readBodyJson<OnboardingInput>(req)
    console.log('[onboarding] Input received:', input)

    if (typeof input.completed !== 'boolean') {
      console.log('[onboarding] Invalid payload: completed is required')
      sendJson(res, 400, { error: 'Invalid payload: completed is required.' })
      return
    }

    const db = await getDb()
    const result = await db.updateOnboarding({ clerkUserId, input })
    console.log('[onboarding] Update successful:', result)
    sendJson(res, 200, result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[onboarding] Error:', message, error)
    sendJson(res, 401, { error: message })
  }
}
