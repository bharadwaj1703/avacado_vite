/**
 * Webhook Controller
 * Handles webhook requests from external services
 */

import type { IncomingMessage, ServerResponse } from 'node:http'
import { verifyClerkWebhook } from '../_lib/auth.js'
import { methodNotAllowed, sendJson } from '../_lib/http.js'
import { userService } from '../services/user.service.js'
import type { ClerkWebhookEvent } from '../types/common.types.js'

export class WebhookController {
  /**
   * Extract display name from Clerk webhook event
   */
  private extractDisplayName(event: ClerkWebhookEvent): string | undefined {
    const first = event.data?.first_name?.trim()
    const last = event.data?.last_name?.trim()
    const joined = [first, last].filter(Boolean).join(' ').trim()
    if (joined) return joined
    const username = event.data?.username?.trim()
    return username || undefined
  }

  /**
   * POST /api/webhooks/clerk
   * Handle Clerk webhook events
   */
  async handleClerkWebhook(
    req: IncomingMessage & { body?: unknown },
    res: ServerResponse
  ): Promise<void> {
    if (req.method !== 'POST') {
      methodNotAllowed(res, 'POST')
      return
    }

    try {
      const rawBody = await verifyClerkWebhook(req)
      const event = JSON.parse(rawBody) as ClerkWebhookEvent

      // Only handle user.created and user.updated events
      if (event.type !== 'user.created' && event.type !== 'user.updated') {
        sendJson(res, 200, { ok: true })
        return
      }

      const clerkUserId = event.data?.id
      if (!clerkUserId) {
        sendJson(res, 400, { error: 'Missing user id in webhook payload' })
        return
      }

      await userService.upsertUserFromWebhook(
        clerkUserId,
        this.extractDisplayName(event)
      )

      sendJson(res, 200, { ok: true })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      sendJson(res, 401, { error: message })
    }
  }
}

// Singleton instance
export const webhookController = new WebhookController()
