import { useAuth } from '@clerk/clerk-react'
import { useQuery } from '@tanstack/react-query'
import { apiRequest } from '@/lib/api/client'
import type { AppUserProfile } from '@/types/api'

export function useAppUserProfile() {
  const { isSignedIn, getToken } = useAuth()

  return useQuery<AppUserProfile>({
    queryKey: ['appUser', 'me'],
    queryFn: () =>
      apiRequest<AppUserProfile>('/api/users/me', {
        method: 'GET',
        tokenProvider: () => getToken(),
      }),
    enabled: isSignedIn === true,
    staleTime: 5 * 60 * 1000,
  })
}
