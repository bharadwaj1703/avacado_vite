import { useEffect, useMemo, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowUp, ChevronLeft } from 'lucide-react'
import { SignedInGuard } from '@/components/auth/AuthGuards'
import { useCreateChat } from '@/hooks/useChatMutations'
import { useChatModels } from '@/hooks/useChatModels'
import { setPendingFirstChatMessage } from '@/lib/chat-utils'
import { Button } from '@/components/ui/button'
import { Combobox } from '@/components/ui/combobox'

const MAX_USER_CHARS = 15_000

function NewChatPage() {
  const navigate = useNavigate()
  const createChat = useCreateChat()
  const modelsQuery = useChatModels()
  const [input, setInput] = useState('')
  const [selectedModelId, setSelectedModelId] = useState('')

  const models = useMemo(
    () => [...(modelsQuery.data?.data ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
    [modelsQuery.data?.data]
  )

  const modelOptions = useMemo(
    () => models.map((model) => ({ value: model.id, label: model.name })),
    [models]
  )

  const hasModelError = modelsQuery.isError || models.length === 0
  const inputTooLong = input.length > MAX_USER_CHARS

  useEffect(() => {
    if (!selectedModelId && models[0]?.id) {
      setSelectedModelId(models[0].id)
      console.log('Set default selectedModelId:', models[0].id)
    }
  }, [models, selectedModelId])

  const canSend = !hasModelError && !createChat.isPending && !inputTooLong && input.trim().length > 0 && !!selectedModelId

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    console.log('Form submitted, canSend:', canSend)
    if (!canSend) {
      console.log('Cannot send. ModelError:', hasModelError, 'createChat.isPending:', createChat.isPending, 'inputTooLong:', inputTooLong, 'input:', input, 'selectedModelId:', selectedModelId)
      return
    }

    const firstMessage = input.trim()
    if (!firstMessage) {
      console.log('No first message to send.')
      return
    }

    try {
      console.log('Creating chat with modelId:', selectedModelId)
      const chat = await createChat.mutateAsync({ modelId: selectedModelId })
      console.log('Chat created:', chat)
      setPendingFirstChatMessage(chat.id, firstMessage)
      await navigate({ to: '/chat/$chatId', params: { chatId: chat.id } })
      console.log('Navigated to chat:', chat.id)
    } catch (error) {
      console.error('Failed to create chat:', error)
      // surfaced in UI via createChat.error
    }
  }

  useEffect(() => {
    if (modelsQuery.data) {
      console.log('Loaded models:', modelsQuery.data.data)
    }
    if (modelsQuery.isError) {
      console.error('Failed to load models')
    }
  }, [modelsQuery.data, modelsQuery.isError])

  return (
    <SignedInGuard>
      <div className="fixed inset-0 z-50 flex flex-col bg-background">
        <div className="border-b px-3 py-2">
          <div className="mx-auto flex w-full max-w-2xl items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                console.log('Navigating back to chat list');
                navigate({ to: '/chat' });
              }}
              aria-label="Back to chats"
            >
              <ChevronLeft className="size-5" />
            </Button>

            <Combobox
              className="w-full"
              options={modelOptions}
              value={selectedModelId}
              onValueChange={(val) => {
                setSelectedModelId(val)
                console.log('Model changed to:', val)
              }}
              placeholder={modelsQuery.isLoading ? 'Loading models...' : 'Select model'}
              searchPlaceholder="Search model"
              emptyText="No models found"
              disabled={models.length === 0 || modelsQuery.isLoading}
            />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-4">
          <p className="text-sm text-muted-foreground">Start a new AI chat</p>
        </div>

        <form onSubmit={handleSubmit} className="pointer-events-none fixed inset-x-0 bottom-3 z-40 px-3">
          <div className="pointer-events-auto mx-auto w-full max-w-2xl rounded-2xl border border-border/80 bg-background/95 p-2 shadow-xl backdrop-blur">
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                console.log('Input changed:', e.target.value)
              }}
              placeholder="Type your first message..."
              disabled={createChat.isPending || hasModelError}
              className="max-h-32 min-h-[44px] w-full resize-none bg-transparent px-2 py-2 text-sm outline-none"
            />

            <div className="flex items-center justify-between gap-2 px-1 pb-1">
              <div className="flex min-w-0 flex-col">
                {modelsQuery.isError && (
                  <span className="text-sm text-destructive">Failed to load models.</span>
                )}
                {createChat.isError && (
                  <span className="text-sm text-destructive">
                    {createChat.error instanceof Error ? createChat.error.message : 'Failed to create chat.'}
                  </span>
                )}
                <span className="text-sm text-muted-foreground">
                  {input.length} / {MAX_USER_CHARS}
                  {inputTooLong && ' (over limit)'}
                </span>
              </div>

              <Button
                type="submit"
                size="icon"
                disabled={!canSend}
                className="size-9 rounded-full"
                aria-label="Send message"
              >
                <ArrowUp className="size-4" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </SignedInGuard>
  )
}

export const Route = createFileRoute('/_app/chat/new')({
  component: NewChatPage,
})
