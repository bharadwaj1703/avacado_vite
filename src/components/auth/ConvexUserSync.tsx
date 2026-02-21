import { useSyncUserOnAuth } from '@/hooks/useConvexUser'

/**
 * Renders nothing. Calls useSyncUserOnAuth() so Clerk user is synced to Convex once when authenticated.
 */
export function ConvexUserSync() {
  useSyncUserOnAuth()
  return null
}
