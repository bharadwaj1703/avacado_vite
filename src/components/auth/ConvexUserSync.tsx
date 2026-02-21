import { useRef } from 'react'
import { useConvexAuth } from 'convex/react'
import { useUser } from '@clerk/clerk-react'
import { useConvexUser } from '@/hooks/useConvexUser'

/**
 * After Convex has authenticated (token sent and validated), sync Clerk user to Convex.
 * Only runs when useConvexAuth().isAuthenticated is true so the mutation receives the JWT.
 * See https://docs.convex.dev/auth/clerk and https://docs.convex.dev/auth/debug
 */
export function ConvexUserSync() {
  const { isAuthenticated } = useConvexAuth()
  const { user: clerkUser } = useUser()
  const { syncUser } = useConvexUser()
  const syncedRef = useRef(false)

  if (isAuthenticated && !syncedRef.current) {
    syncedRef.current = true
    syncUser({ displayName: clerkUser?.fullName ?? undefined }).catch(() => {
      syncedRef.current = false
    })
  }

  return null
}
