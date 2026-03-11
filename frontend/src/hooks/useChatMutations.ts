import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/clerk-react'
import { apiRequest } from '@/lib/api/client'
import type { ChatCreateResponse } from '@/types/api'

type CreateChatInput = {
  modelId: string
  title?: string | null
}

export function useCreateChat() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateChatInput) => {
      return apiRequest<ChatCreateResponse>('/api/chats', {
        method: 'POST',
        tokenProvider: () => getToken(),
        body: input.title != null
          ? { title: input.title, modelId: input.modelId }
          : { modelId: input.modelId },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] })
    },
  })
}

export function useDeleteChat() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (chatId: string) => {
      return apiRequest<{ ok: true }>(`/api/chats/${chatId}`, {
        method: 'DELETE',
        tokenProvider: () => getToken(),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] })
    },
  })
}
