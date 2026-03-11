import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/clerk-react'
import { apiRequest } from '@/lib/api/client'
import type { ChatListResponse } from '@/types/api'

export function useChats() {
  const { getToken, isSignedIn } = useAuth()

  return useQuery({
    queryKey: ['chats'],
    queryFn: () =>
      apiRequest<ChatListResponse>('/api/chats', {
        method: 'GET',
        tokenProvider: () => getToken(),
      }),
    enabled: isSignedIn ?? false,
    staleTime: 1 * 60 * 1000, // 1 minute - chat list refreshes more frequently
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache for 10 minutes
  })
}
