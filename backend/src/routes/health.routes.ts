/**
 * Health Routes
 * Route definitions for health check endpoints
 */

import { healthController } from '../controllers/health.controller.js'
import type { HttpHandler } from '../types/common.types.js'

export const healthRoutes: Record<string, HttpHandler> = {
  '/api/health': (req, res) => healthController.checkHealth(req, res),
}
