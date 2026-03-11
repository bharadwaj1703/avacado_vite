/**
 * Health Controller
 * Handles health check requests
 */

import type { IncomingMessage, ServerResponse } from 'node:http'
import { getDb } from '../_lib/db/adapter.js'
import { methodNotAllowed, sendJson } from '../_lib/http.js'

export class HealthController {
  /**
   * GET /api/health
   * Health check endpoint
   */
  async checkHealth(
    req: IncomingMessage & { body?: unknown },
    res: ServerResponse
  ): Promise<void> {
    if (req.method !== 'GET') {
      methodNotAllowed(res, 'GET')
      return
    }

    try {
      const db = await getDb()
      const health = await db.health()
      sendJson(res, 200, health)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      sendJson(res, 500, { error: message })
    }
  }
}

// Singleton instance
export const healthController = new HealthController()
