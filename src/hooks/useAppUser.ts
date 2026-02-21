import { useRef } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { apiRequest } from '@/lib/api/client'
import type { SyncUserInput, SyncUserResponse } from '@/types/api'

export function useAppUser(): {
  syncUser: (opts?: SyncUserInput) => Promise<SyncUserResponse | null>
} {
  const { isSignedIn, getToken } = useAuth()

  async function syncUser(opts?: SyncUserInput): Promise<SyncUserResponse | null> {
    if (!isSignedIn) return null

    return apiRequest<SyncUserResponse>('/api/users/sync', {
      method: 'POST',
      tokenProvider: () => getToken(),
      body: opts,
    })
  }

  return { syncUser }
}

export function useSyncUserOnAuth(): void {
  const { isSignedIn } = useAuth()
  const { user } = useUser()
  const { syncUser } = useAppUser()
  const syncedRef = useRef(false)

  /* eslint-disable react-hooks/refs -- one-shot sync from hook body; no useEffect by project rule */
  if (isSignedIn && !syncedRef.current) {
    syncedRef.current = true
    syncUser({ displayName: user?.fullName ?? undefined }).catch(() => {
      syncedRef.current = false
    })
  }
  /* eslint-enable react-hooks/refs */
}
