import { createFileRoute } from '@tanstack/react-router'
import { SignedInGuard } from '@/components/auth/AuthGuards'
import { useChatQuery } from '@/hooks/useChat'
import { ChatPanel } from '@/components/chat/ChatPanel'
import { messageRowsToUIMessages } from '@/lib/chat-utils'

function ChatPage() {
  // #region agent log
  fetch('http://127.0.0.1:7403/ingest/67d6e77b-c89b-43f9-b04c-aa28c1b1dc42',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'4e9523'},body:JSON.stringify({sessionId:'4e9523',location:'chat.$chatId.tsx:ChatPage',message:'ChatPage RENDERED',data:{pathname:window.location.pathname},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  const { chatId } = Route.useParams()
  const { data, isLoading, error } = useChatQuery(chatId)

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading chat…</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <p className="text-sm text-destructive">Chat not found</p>
      </div>
    )
  }

  const initialMessages = messageRowsToUIMessages(data.messages)

  return (
    <SignedInGuard>
      <div className="flex min-h-[60vh] flex-1 flex-col overflow-hidden">
        <ChatPanel chatId={chatId} initialMessages={initialMessages} />
      </div>
    </SignedInGuard>
  )
}

export const Route = createFileRoute('/_app/chat/$chatId')({
  component: ChatPage,
})
