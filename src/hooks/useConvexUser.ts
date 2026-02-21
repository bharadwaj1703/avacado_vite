import { useQuery, useMutation } from 'convex/react'
import { useAuth } from '@clerk/clerk-react'
import { api } from '../../convex/_generated/api'
import { isConvexSkipped } from '@/lib/convex-skip'

export function useConvexUser(): {
  user: { onboardingCompletedAt?: number } | null
  isLoading: boolean
  isOnboardingComplete: boolean
  syncUser: (opts?: { leadId?: string; displayName?: string }) => Promise<void>
} {
  const { isSignedIn, isLoaded: clerkLoaded } = useAuth()
  const skip = isConvexSkipped()
  // When Convex backend isn't deployed we skip the query so it doesn't throw
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Convex api types from codegen when convex dev runs
  const user = useQuery((api as any).users.currentUser, skip || !isSignedIn ? 'skip' : {})
  const syncFromClerk = useMutation((api as any).users.syncFromClerk)

  if (skip) {
    return {
      user: null,
      isLoading: false,
      isOnboardingComplete: false,
      syncUser: async () => {},
    }
  }

  const isLoading = !clerkLoaded || (isSignedIn && user === undefined)
  const isOnboardingComplete = !!user?.onboardingCompletedAt

  async function syncUser(opts?: { leadId?: string; displayName?: string }) {
    if (!isSignedIn) return
    await syncFromClerk({
      ...(opts?.leadId !== undefined && { leadId: opts.leadId }),
      ...(opts?.displayName !== undefined && { displayName: opts.displayName }),
    })
  }

  return {
    user: user ?? null,
    isLoading,
    isOnboardingComplete,
    syncUser,
  }
}
