/**
 * Routes Index
 * Central registry for all application routes
 */

import { userRoutes } from './user.routes.js'
import { chatRoutes, chatByIdHandler } from './chat.routes.js'
import { activityRoutes } from './activity.routes.js'
import { webhookRoutes } from './webhook.routes.js'
import { healthRoutes } from './health.routes.js'
import type { HttpHandler } from '../types/common.types.js'

/**
 * All static routes
 */
export const routes: Record<string, HttpHandler> = {
  ...healthRoutes,
  ...userRoutes,
  ...chatRoutes,
  ...activityRoutes,
  ...webhookRoutes,
}

/**
 * Match route from pathname
 * Handles both static and dynamic routes
 */
export function matchRoute(pathname: string): HttpHandler | null {
  // Try exact match first
  const exactMatch = routes[pathname] || routes[`${pathname}/`]
  if (exactMatch) return exactMatch

  // Handle dynamic routes
  // Pattern: /api/chats/:id
  if (pathname.startsWith('/api/chats/')) {
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length === 3) {
      return chatByIdHandler
    }
  }

  return null
}

/**
 * Get all registered routes (for debugging)
 */
export function getRegisteredRoutes(): string[] {
  return Object.keys(routes).sort()
}
