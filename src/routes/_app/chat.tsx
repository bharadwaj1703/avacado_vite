import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { SignedInGuard } from '@/components/auth/AuthGuards'
import { useCreateChat } from '@/hooks/useChatMutations'
import { MessageCircle } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

function ChatIndexPage() {
  // #region agent log
  fetch('http://127.0.0.1:7403/ingest/67d6e77b-c89b-43f9-b04c-aa28c1b1dc42',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'4e9523'},body:JSON.stringify({sessionId:'4e9523',location:'chat.tsx:ChatIndexPage',message:'ChatIndexPage RENDERED',data:{pathname:window.location.pathname},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const createChat = useCreateChat()

  async function startNewChat() {
    try {
      const chat = await createChat.mutateAsync(undefined)
      queryClient.invalidateQueries({ queryKey: ['chats'] })
      await navigate({ to: '/chat/$chatId', params: { chatId: chat.id } })
      if (
        window.location.pathname === '/chat' ||
        !window.location.pathname.startsWith(`/chat/${chat.id}`)
      ) {
        window.location.href = `/chat/${chat.id}`
      }
    } catch {
      // Error already surfaced via createChat.isError
    }
  }

  return (
    <SignedInGuard>
      <div className="mx-auto flex min-h-full max-w-2xl flex-col items-center justify-center px-5 py-6">
        <MessageCircle className="size-12 text-muted-foreground/40" />
        <p className="mt-4 text-sm text-muted-foreground">
          Start a new conversation with the AI.
        </p>
        <button
          type="button"
          onClick={startNewChat}
          disabled={createChat.isPending}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {createChat.isPending ? 'Creating…' : 'New chat'}
        </button>
        {createChat.isError && (
          <p className="mt-2 text-sm text-destructive">
            {createChat.error instanceof Error &&
            createChat.error.message.includes('409')
              ? 'Please wait for your current chat to finish before starting another.'
              : createChat.error instanceof Error
                ? createChat.error.message
                : 'Something went wrong'}
          </p>
        )}
      </div>
    </SignedInGuard>
  )
}

export const Route = createFileRoute('/_app/chat')({
  component: ChatIndexPage,
})
