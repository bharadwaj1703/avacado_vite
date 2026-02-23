import { useState, useMemo } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useAuth } from '@clerk/clerk-react'
import type { UIMessage } from 'ai'
import { useChatModels } from '@/hooks/useChatModels'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { apiUrl } from '@/lib/api/client'

const MAX_USER_CHARS = 15_000
const MAX_MESSAGES = 10

type ChatPanelProps = {
  chatId: string
  initialMessages: UIMessage[]
}

export function ChatPanel({ chatId, initialMessages }: ChatPanelProps) {
  const { getToken } = useAuth()
  const [selectedModelId, setSelectedModelId] = useState<string>('')
  const [input, setInput] = useState('')

  const { data: modelsData } = useChatModels()
  const models = modelsData?.data ?? []
  const effectiveModelId = selectedModelId || models[0]?.id || ''
  const transport = useMemo(() => {
    return new DefaultChatTransport({
      api: apiUrl('/api/chat'),
      headers: async () => ({
        Authorization: `Bearer ${await getToken()}`,
      }),
      prepareSendMessagesRequest: ({ id, messages }) => ({
        body: {
          id,
          message: messages[messages.length - 1],
          model: effectiveModelId || undefined,
        },
      }),
    })
  }, [getToken, effectiveModelId])

  const { messages, sendMessage, status, error, regenerate } = useChat({
    id: chatId,
    messages: initialMessages,
    transport,
  })

  const charCount = input.length
  const overLimit = charCount > MAX_USER_CHARS
  const atMessageLimit = messages.length >= MAX_MESSAGES
  const canSend = status === 'ready' && !overLimit && !atMessageLimit && input.trim().length > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSend) return
    const text = overLimit ? input.slice(0, MAX_USER_CHARS) : input.trim()
    if (!text) return
    sendMessage({ text })
    setInput('')
  }

  const displayMessages = messages.filter((m) => m.role !== 'system')

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 border-b px-3 py-2">
        <Select
          value={effectiveModelId}
          onValueChange={setSelectedModelId}
          disabled={models.length === 0}
        >
          <SelectTrigger size="sm" className="w-full max-w-xs">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            {models.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mx-auto max-w-2xl space-y-4">
          {displayMessages.map((m) => (
            <div
              key={m.id}
              className={cn(
                'rounded-lg px-3 py-2',
                m.role === 'user'
                  ? 'ml-auto max-w-[85%] bg-primary text-primary-foreground'
                  : 'mr-auto max-w-[85%] bg-muted'
              )}
            >
              <div className="text-sm font-medium opacity-80">
                {m.role === 'user' ? 'You' : 'Assistant'}
              </div>
              <div className="mt-1 whitespace-pre-wrap wrap-break-word text-sm">
                {m.parts
                  ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
                  .map((p, i) => (
                    <span key={i}>{p.text}</span>
                  ))}
              </div>
            </div>
          ))}
          {(status === 'submitted' || status === 'streaming') && (
            <div className="mr-auto max-w-[85%] rounded-lg bg-muted px-3 py-2">
              <span className="text-sm text-muted-foreground">Thinking…</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="border-t px-3 py-2">
          <p className="text-sm text-destructive">Something went wrong.</p>
          <Button type="button" variant="outline" size="sm" onClick={() => regenerate()}>
            Retry
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="shrink-0 border-t p-3">
        <div className="mx-auto max-w-2xl flex flex-col gap-2">
          {atMessageLimit && (
            <p className="text-xs text-muted-foreground">Maximum 10 messages. Start a new chat.</p>
          )}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              disabled={!canSend}
              maxLength={MAX_USER_CHARS + 100}
              className="min-w-0 flex-1"
            />
            <Button type="submit" disabled={!canSend}>
              Send
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {charCount} / {MAX_USER_CHARS} characters
            {overLimit && ' (over limit)'}
          </p>
        </div>
      </form>
    </div>
  )
}
