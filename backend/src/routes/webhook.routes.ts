/**
 * Webhook Routes
 * Route definitions for webhook endpoints
 */

import { webhookController } from '../controllers/webhook.controller.js'
import type { HttpHandler } from '../types/common.types.js'

export const webhookRoutes: Record<string, HttpHandler> = {
  '/api/webhooks/clerk': (req, res) => webhookController.handleClerkWebhook(req, res),
}
