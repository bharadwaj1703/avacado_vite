import { useRef, useState, useMemo, memo, type PointerEvent as ReactPointerEvent } from 'react'
import { Outlet, createFileRoute, useLocation, useNavigate } from '@tanstack/react-router'
import { SignedInGuard } from '@/components/auth/AuthGuards'
import { useChats } from '@/hooks/useChats'
import { useDeleteChat } from '@/hooks/useChatMutations'
import { useChatModels } from '@/hooks/useChatModels'
import type { ChatRow } from '@/types/api'
import { MessageCircle, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

function formatFallbackTitle(isoDate: string): string {
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

function formatUpdatedAt(isoDate: string): string {
  return new Date(isoDate).toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

const SWIPE_REVEAL_PX = 76
const SWIPE_OPEN_THRESHOLD_PX = 34

type ChatCardProps = {
  chat: ChatRow
  title: string
  modelName: string
  isDeletePending: boolean
  swipeOpenChatId: string | null
  setSwipeOpenChatId: (chatId: string | null) => void
  onOpen: () => void
  onDelete: () => void
}

const ChatCard = memo(function ChatCard({
  chat,
  title,
  modelName,
  isDeletePending,
  swipeOpenChatId,
  setSwipeOpenChatId,
  onOpen,
  onDelete,
}: ChatCardProps) {
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const pointerStartXRef = useRef<number | null>(null)
  const suppressNextClickRef = useRef(false)
  const isSwipeOpen = swipeOpenChatId === chat.id
  const translateX = isDragging ? dragOffset : isSwipeOpen ? -SWIPE_REVEAL_PX : 0

  const onPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== 'touch') return
    pointerStartXRef.current = event.clientX
    setIsDragging(true)
    setDragOffset(isSwipeOpen ? -SWIPE_REVEAL_PX : 0)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!isDragging || pointerStartXRef.current == null || event.pointerType !== 'touch') return
    const base = isSwipeOpen ? -SWIPE_REVEAL_PX : 0
    const delta = event.clientX - pointerStartXRef.current
    const nextOffset = Math.min(0, Math.max(-SWIPE_REVEAL_PX, base + delta))
    if (Math.abs(nextOffset - base) > 6) {
      suppressNextClickRef.current = true
    }
    setDragOffset(nextOffset)
  }

  const finalizeSwipe = () => {
    if (!isDragging) return
    setIsDragging(false)
    pointerStartXRef.current = null
    if (dragOffset <= -SWIPE_OPEN_THRESHOLD_PX) {
      setSwipeOpenChatId(chat.id)
    } else {
      setSwipeOpenChatId(null)
    }
    setDragOffset(0)
  }

  return (
    <div className="group relative overflow-hidden rounded-xl">
      <div className="absolute inset-y-0 right-0 flex w-19 items-center justify-center sm:hidden">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          disabled={isDeletePending}
          onClick={onDelete}
          className="h-[calc(100%-8px)] w-14 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/15"
          aria-label="Delete chat"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <button
        type="button"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finalizeSwipe}
        onPointerCancel={finalizeSwipe}
        onClick={() => {
          if (suppressNextClickRef.current) {
            suppressNextClickRef.current = false
            return
          }
          if (isSwipeOpen) {
            setSwipeOpenChatId(null)
            return
          }
          onOpen()
        }}
        className="w-full touch-pan-y rounded-xl border bg-background p-3 pr-12 text-left transition hover:bg-muted/60 sm:pr-12"
        style={{
          transform: `translateX(${translateX}px)`,
          transitionProperty: isDragging ? 'none' : 'transform',
          transitionDuration: '220ms',
        }}
      >
        <p className="truncate text-sm font-medium sm:text-[15px]">{title}</p>
        <div className="mt-1 grid grid-cols-[minmax(0,1fr)_minmax(92px,40%)] items-center gap-2">
          <p className="min-w-0 truncate whitespace-nowrap text-[11px] text-muted-foreground sm:text-xs">
            {modelName}
          </p>
          <p className="min-w-0 justify-self-end truncate whitespace-nowrap text-right text-[11px] text-muted-foreground sm:text-xs">
            {formatUpdatedAt(chat.updated_at)}
          </p>
        </div>
      </button>

      <Button
        type="button"
        size="icon"
        variant="ghost"
        disabled={isDeletePending}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onDelete()
        }}
        className="absolute right-2 top-2 hidden size-7 rounded-full text-destructive/80 opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 group-hover:bg-destructive/10 group-focus-within:opacity-100 group-focus-within:bg-destructive/10 sm:inline-flex"
        aria-label="Delete chat"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  )
})

function ChatIndexPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const chatsQuery = useChats()
  const deleteChat = useDeleteChat()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<{ id: string; title: string } | null>(null)
  const [swipeOpenChatId, setSwipeOpenChatId] = useState<string | null>(null)
  const { data: modelsData } = useChatModels()
  const chats = chatsQuery.data?.data ?? []
  const isIndexRoute = location.pathname === '/chat' || location.pathname === '/chat/'

  const modelNameById = useMemo(
    () => new Map((modelsData?.data ?? []).map((entry) => [entry.id, entry.name])),
    [modelsData?.data]
  )

  if (!isIndexRoute) {
    return <Outlet />
  }

  return (
    <SignedInGuard>
      <div className="relative mx-auto flex min-h-full w-full max-w-2xl flex-col px-5 py-6">
        {chatsQuery.isLoading && (
          <p className="mt-4 text-sm text-muted-foreground">Loading chats…</p>
        )}

        {chatsQuery.isError && (
          <p className="mt-4 text-sm text-destructive">
            {chatsQuery.error instanceof Error ? chatsQuery.error.message : 'Failed to load chats.'}
          </p>
        )}

        {!chatsQuery.isLoading && !chatsQuery.isError && chats.length === 0 && (
          <div className="mt-12 flex flex-col items-center justify-center text-center">
            <MessageCircle className="size-12 text-muted-foreground/40" />
            <p className="mt-4 text-sm text-muted-foreground">No chats yet. Start a new one.</p>
          </div>
        )}

        {chats.length > 0 && (
          <div className="mt-4 space-y-2 pb-28">
            {chats.map((chat) => {
              const title = chat.title?.trim() || formatFallbackTitle(chat.created_at)
              const modelName = chat.model_id ? (modelNameById.get(chat.model_id) ?? chat.model_id) : 'Model'

              return (
                <ChatCard
                  key={chat.id}
                  chat={chat}
                  title={title}
                  modelName={modelName}
                  isDeletePending={deleteChat.isPending}
                  swipeOpenChatId={swipeOpenChatId}
                  setSwipeOpenChatId={setSwipeOpenChatId}
                  onOpen={() => navigate({ to: '/chat/$chatId', params: { chatId: chat.id } })}
                  onDelete={() => {
                    setPendingDelete({ id: chat.id, title })
                    setSwipeOpenChatId(null)
                    setDeleteDialogOpen(true)
                  }}
                />
              )
            })}
          </div>
        )}

        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-20 flex justify-center">
          <Button
            type="button"
            onClick={() => navigate({ to: '/chat/new' })}
            className="pointer-events-auto rounded-full px-5 shadow-lg"
          >
            <Plus className="size-4" />
            New Chat
          </Button>
        </div>

        <AlertDialog
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            setDeleteDialogOpen(open)
            if (!open) setPendingDelete(null)
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete chat?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove{' '}
                <span className="font-medium text-foreground">{pendingDelete?.title ?? 'this chat'}</span>{' '}
                from your list.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button type="button" variant="outline">
                  Back
                </Button>
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={!pendingDelete || deleteChat.isPending}
                  onClick={async () => {
                    if (!pendingDelete) return
                    await deleteChat.mutateAsync(pendingDelete.id)
                    setDeleteDialogOpen(false)
                    setPendingDelete(null)
                  }}
                >
                  Delete
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SignedInGuard>
  )
}

export const Route = createFileRoute('/_app/chat')({
  component: ChatIndexPage,
})
