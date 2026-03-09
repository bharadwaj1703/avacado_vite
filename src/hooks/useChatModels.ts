import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/clerk-react'
import { apiRequest } from '@/lib/api/client'
import type { ChatModelsResponse } from '@/types/api'

export function useChatModels() {
  const { getToken, isSignedIn } = useAuth()

  return useQuery({
    queryKey: ['chat', 'models'],
    queryFn: () =>
      apiRequest<ChatModelsResponse>('/api/chat/models', {
        method: 'GET',
        tokenProvider: () => getToken(),
      }),
    enabled: isSignedIn ?? false,
  })
}
