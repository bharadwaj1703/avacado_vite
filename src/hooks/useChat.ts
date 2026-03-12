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
  })
}
