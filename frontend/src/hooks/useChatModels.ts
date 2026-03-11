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
    staleTime: 30 * 60 * 1000, // 30 minutes - models rarely change
    gcTime: 60 * 60 * 1000, // 1 hour - keep in cache for 1 hour
  })
}
