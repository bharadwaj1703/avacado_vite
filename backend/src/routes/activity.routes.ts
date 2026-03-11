/**
 * Activity Routes
 * Route definitions for activity tracking endpoints
 */

import { activityController } from '../controllers/activity.controller.js'
import type { HttpHandler } from '../types/common.types.js'

export const activityRoutes: Record<string, HttpHandler> = {
  '/api/activities': (req, res) => activityController.recordActivity(req, res),
}
