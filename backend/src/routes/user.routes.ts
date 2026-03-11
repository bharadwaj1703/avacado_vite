/**
 * User Routes
 * Route definitions for user endpoints
 */

import { userController } from '../controllers/user.controller.js'
import type { HttpHandler } from '../types/common.types.js'

export const userRoutes: Record<string, HttpHandler> = {
  '/api/users/me': (req, res) => userController.getProfile(req, res),
  '/api/users/sync': (req, res) => userController.syncUser(req, res),
  '/api/users/onboarding': (req, res) => userController.updateOnboarding(req, res),
}
