import { useRef } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useConvexUser } from '@/hooks/useConvexUser'

/**
 * When signed in, ensures the Convex user exists (sync from Clerk) and optionally
 * updates displayName. Runs once per session when Convex user is missing.
 */
export function ConvexUserSync() {
  const { isSignedIn, user: clerkUser } = useUser()
  const { user, isLoading, syncUser } = useConvexUser()
  const syncedRef = useRef(false)

  if (isSignedIn && !isLoading && user === null && !syncedRef.current) {
    syncedRef.current = true
    syncUser({ displayName: clerkUser?.fullName ?? undefined }).catch(() => {
      syncedRef.current = false
    })
  }

  return null
}
