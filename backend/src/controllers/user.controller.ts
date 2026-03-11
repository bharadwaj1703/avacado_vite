/**
 * User Controller
 * Handles HTTP requests for user endpoints
 */

import type { IncomingMessage, ServerResponse } from 'node:http'
import { requireClerkUserId } from '../_lib/auth.js'
import { methodNotAllowed, sendJson, readBodyJson } from '../_lib/http.js'
import { userService } from '../services/user.service.js'
import type { UserSyncRequest, OnboardingInput } from '../types/user.types.js'

export class UserController {
  /**
   * GET /api/users/me
   * Get current user profile
   */
  async getProfile(
    req: IncomingMessage & { body?: unknown },
    res: ServerResponse
  ): Promise<void> {
    if (req.method !== 'GET') {
      methodNotAllowed(res, 'GET')
      return
    }

    try {
      const clerkUserId = await requireClerkUserId(req)
      const profile = await userService.getUserProfile(clerkUserId)
      sendJson(res, 200, profile)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      const statusCode = message.includes('bearer token') ? 401 : 500
      sendJson(res, statusCode, { error: message })
    }
  }

  /**
   * POST /api/users/sync
   * Sync user data from Clerk
   */
  async syncUser(
    req: IncomingMessage & { body?: unknown },
    res: ServerResponse
  ): Promise<void> {
    if (req.method !== 'POST') {
      methodNotAllowed(res, 'POST')
      return
    }

    try {
      const clerkUserId = await requireClerkUserId(req)
      const body = await readBodyJson<UserSyncRequest>(req)
      const result = await userService.syncUser(clerkUserId, body)
      sendJson(res, 200, result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      const statusCode = message.includes('bearer token') ? 401 : 500
      sendJson(res, statusCode, { error: message })
    }
  }

  /**
   * POST /api/users/onboarding
   * Update user onboarding data
   */
  async updateOnboarding(
    req: IncomingMessage & { body?: unknown },
    res: ServerResponse
  ): Promise<void> {
    if (req.method !== 'POST') {
      methodNotAllowed(res, 'POST')
      return
    }

    try {
      const clerkUserId = await requireClerkUserId(req)
      const input = await readBodyJson<OnboardingInput>(req)

      if (typeof input.completed !== 'boolean') {
        sendJson(res, 400, { error: 'Invalid payload: completed is required' })
        return
      }

      const result = await userService.updateOnboarding(clerkUserId, input)
      sendJson(res, 200, result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      const statusCode = message.includes('bearer token') ? 401 : 500
      sendJson(res, statusCode, { error: message })
    }
  }
}

// Singleton instance
export const userController = new UserController()
