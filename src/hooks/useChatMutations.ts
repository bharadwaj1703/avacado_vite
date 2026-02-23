import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/clerk-react'
import { apiRequest } from '@/lib/api/client'
import type { ChatCreateResponse } from '@/types/api'

export function useCreateChat() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (title?: string | null) => {
      return apiRequest<ChatCreateResponse>('/api/chats', {
        method: 'POST',
        tokenProvider: () => getToken(),
        body: title != null ? { title } : {},
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] })
    },
  })
}
