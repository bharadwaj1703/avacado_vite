import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/clerk-react'
import { apiRequest } from '@/lib/api/client'
import type { ChatGetResponse } from '@/types/api'

export function useChatQuery(chatId: string | undefined) {
  const { getToken, isSignedIn } = useAuth()

  return useQuery({
    queryKey: ['chat', chatId],
    queryFn: () =>
      apiRequest<ChatGetResponse>(`/api/chats/${chatId}`, {
        method: 'GET',
        tokenProvider: () => getToken(),
      }),
    enabled: Boolean(isSignedIn && chatId),
    staleTime: 2 * 60 * 1000, // 2 minutes - chat data stays fresh for 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache for 10 minutes
  })
}
