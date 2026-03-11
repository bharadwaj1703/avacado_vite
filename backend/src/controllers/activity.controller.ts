/**
 * Activity Controller
 * Handles HTTP requests for activity tracking
 */

import type { IncomingMessage, ServerResponse } from 'node:http'
import { requireClerkUserId } from '../_lib/auth.js'
import { methodNotAllowed, sendJson, readBodyJson } from '../_lib/http.js'
import { activityService } from '../services/activity.service.js'
import type { RecordActivityRequest } from '../types/activity.types.js'

export class ActivityController {
  /**
   * POST /api/activities
   * Record user activity
   */
  async recordActivity(
    req: IncomingMessage & { body?: unknown },
    res: ServerResponse
  ): Promise<void> {
    if (req.method !== 'POST') {
      methodNotAllowed(res, 'POST')
      return
    }

    try {
      const clerkUserId = await requireClerkUserId(req)
      const input = await readBodyJson<RecordActivityRequest>(req)

      const result = await activityService.recordActivity(clerkUserId, input)
      sendJson(res, 200, result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      const statusCode = message.includes('bearer token') ? 401 : 500
      sendJson(res, statusCode, { error: message })
    }
  }
}

// Singleton instance
export const activityController = new ActivityController()
