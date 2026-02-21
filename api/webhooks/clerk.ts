import type { IncomingMessage, ServerResponse } from 'node:http'
import { getDb } from '../_lib/db/adapter'
import { methodNotAllowed, sendJson } from '../_lib/http'
import { verifyClerkWebhook } from '../_lib/auth'

type ClerkWebhookEvent = {
  type: string
  data?: {
    id?: string
    first_name?: string | null
    last_name?: string | null
    username?: string | null
  }
}

function extractDisplayName(event: ClerkWebhookEvent): string | undefined {
  const first = event.data?.first_name?.trim()
  const last = event.data?.last_name?.trim()
  const joined = [first, last].filter(Boolean).join(' ').trim()
  if (joined) return joined
  const username = event.data?.username?.trim()
  return username || undefined
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: IncomingMessage & { body?: unknown }, res: ServerResponse) {
  if (req.method !== 'POST') {
    methodNotAllowed(res, 'POST')
    return
  }

  try {
    const rawBody = await verifyClerkWebhook(req)
    const event = JSON.parse(rawBody) as ClerkWebhookEvent

    if (event.type !== 'user.created' && event.type !== 'user.updated') {
      sendJson(res, 200, { ok: true })
      return
    }

    const clerkUserId = event.data?.id
    if (!clerkUserId) {
      sendJson(res, 400, { error: 'Missing user id in webhook payload.' })
      return
    }

    const db = await getDb()
    await db.migrate()

    await db.upsertUserFromClerk({
      clerkUserId,
      displayName: extractDisplayName(event),
    })

    sendJson(res, 200, { ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    sendJson(res, 401, { error: message })
  }
}
