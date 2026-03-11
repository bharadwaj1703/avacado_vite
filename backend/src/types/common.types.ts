/**
 * Common Types
 */

import type { IncomingMessage, ServerResponse } from 'node:http'

/**
 * HTTP Handler Type
 */
export type HttpHandler = (
  req: IncomingMessage & { body?: unknown },
  res: ServerResponse
) => void | Promise<void>

/**
 * API Error Response
 */
export interface ApiErrorResponse {
  error: string
  code?: string
  details?: unknown
}

/**
 * API Success Response
 */
export interface ApiSuccessResponse<T = unknown> {
  data?: T
  message?: string
}

/**
 * Health Check Response
 */
export interface HealthCheckResponse {
  provider: 'sqlite' | 'd1' | 'turso'
  ok: boolean
}

/**
 * Webhook Event Types
 */
export interface ClerkWebhookEvent {
  type: string
  data?: {
    id?: string
    first_name?: string | null
    last_name?: string | null
    username?: string | null
  }
}
