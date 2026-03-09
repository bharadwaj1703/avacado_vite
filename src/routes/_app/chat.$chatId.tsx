import { useMemo, useRef } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { useChatQuery } from '@/hooks/useChat'
import { useChatModels } from '@/hooks/useChatModels'
import { ChatPanel } from '@/components/chat/ChatPanel'
import { consumePendingFirstChatMessage, messageRowsToUIMessages } from '@/lib/chat-utils'
import { Button } from '@/components/ui/button'

function formatChatFallbackTitle(isoDate: string): string {
  const date = new Date(isoDate)
  const parts = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).formatToParts(date)

  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${map.weekday} ${map.month} ${map.day}, ${map.year}`
}

function ChatPage() {
  const { chatId } = Route.useParams()
  const navigate = useNavigate()
  const { data, isLoading, error } = useChatQuery(chatId)
  const { data: modelsData } = useChatModels()
  const pendingFirstMessageRef = useRef<string | null>(consumePendingFirstChatMessage(chatId))

  const title = useMemo(() => {
    if (!data?.chat) return ''
    return data.chat.title?.trim() || formatChatFallbackTitle(data.chat.created_at)
  }, [data?.chat])

  const modelName = useMemo(() => {
    if (!data?.chat.model_id) return 'Model'
    const model = modelsData?.data.find((entry) => entry.id === data.chat.model_id)
    return model?.name ?? data.chat.model_id
  }, [data?.chat.model_id, modelsData?.data])

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading chat…</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <p className="text-sm text-destructive">Chat not found</p>
      </div>
    )
  }

  const initialMessages = messageRowsToUIMessages(data.messages)

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="shrink-0 border-b px-3 py-2">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: '/chat' })}
            aria-label="Back to chats"
          >
            <ChevronLeft className="size-5" />
          </Button>
          <p className="min-w-0 flex-1 truncate text-sm font-medium">{title}</p>
          <p className="max-w-[38%] truncate text-sm text-muted-foreground">{modelName}</p>
        </div>
      </div>

      <ChatPanel
        chatId={chatId}
        initialMessages={initialMessages}
        initialAutoSendText={pendingFirstMessageRef.current}
        chatCreatedAt={data.chat.created_at}
      />
    </div>
  )
}

export const Route = createFileRoute('/_app/chat/$chatId')({
  component: ChatPage,
})
