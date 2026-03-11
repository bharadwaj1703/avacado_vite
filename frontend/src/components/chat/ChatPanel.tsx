import { useState, useMemo, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useAuth } from '@clerk/clerk-react'
import type { UIMessage } from 'ai'
import { ArrowUp, Check, Copy, ThumbsDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { apiUrl } from '@/lib/api/client'

const MAX_USER_CHARS = 15_000
const MAX_MESSAGES = 10
const ASSISTANT_FEEDBACK_OPTIONS = ['Not Correct', 'Did not understand', 'Too vague', 'Outdated', 'Unsafe']

type ChatPanelProps = {
  chatId: string
  initialMessages: UIMessage[]
  initialAutoSendText?: string | null
  chatCreatedAt?: string
}

function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function parseInlineMarkdown(text: string): string {
  let value = escapeHtml(text)
  value = value.replace(/`([^`]+)`/g, '<code>$1</code>')
  value = value.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  value = value.replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
  // Validate URLs before creating links to prevent XSS
  value = value.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (match, linkText, url) => {
    if (isValidUrl(url)) {
      return `<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer noopener">${linkText}</a>`
    }
    return escapeHtml(match) // Return escaped if URL is invalid
  })
  return value
}

function markdownToHtml(markdown: string): string {
  const lines = markdown.replaceAll('\r\n', '\n').split('\n')
  const html: string[] = []
  let inCodeFence = false
  let inUnorderedList = false
  let inOrderedList = false

  const closeLists = () => {
    if (inUnorderedList) {
      html.push('</ul>')
      inUnorderedList = false
    }
    if (inOrderedList) {
      html.push('</ol>')
      inOrderedList = false
    }
  }

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      closeLists()
      if (!inCodeFence) {
        inCodeFence = true
        html.push('<pre><code>')
      } else {
        inCodeFence = false
        html.push('</code></pre>')
      }
      continue
    }

    if (inCodeFence) {
      html.push(`${escapeHtml(line)}\n`)
      continue
    }

    if (!line.trim()) {
      closeLists()
      continue
    }

    const h = line.match(/^(#{1,6})\s+(.+)$/)
    if (h) {
      closeLists()
      const level = h[1].length
      html.push(`<h${level}>${parseInlineMarkdown(h[2])}</h${level}>`)
      continue
    }

    const ul = line.match(/^\s*[-*]\s+(.+)$/)
    if (ul) {
      if (!inUnorderedList) {
        closeLists()
        inUnorderedList = true
        html.push('<ul>')
      }
      html.push(`<li>${parseInlineMarkdown(ul[1])}</li>`)
      continue
    }

    const ol = line.match(/^\s*\d+\.\s+(.+)$/)
    if (ol) {
      if (!inOrderedList) {
        closeLists()
        inOrderedList = true
        html.push('<ol>')
      }
      html.push(`<li>${parseInlineMarkdown(ol[1])}</li>`)
      continue
    }

    const blockquote = line.match(/^\s*>\s?(.+)$/)
    if (blockquote) {
      closeLists()
      html.push(`<blockquote>${parseInlineMarkdown(blockquote[1])}</blockquote>`)
      continue
    }

    closeLists()
    html.push(`<p>${parseInlineMarkdown(line)}</p>`)
  }

  closeLists()
  if (inCodeFence) {
    html.push('</code></pre>')
  }
  return html.join('')
}

function messageText(message: UIMessage): string {
  const textParts = message.parts?.filter(
    (part): part is { type: 'text'; text: string } => part.type === 'text'
  )
  if (textParts && textParts.length > 0) {
    return textParts.map((part) => part.text).join('')
  }
  const content = (message as { content?: unknown }).content
  if (typeof content === 'string') {
    return content
  }
  return ''
}

function formatTimelineDate(isoDate: string): string {
  const date = new Date(isoDate)
  const parts = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).formatToParts(date)

  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${map.month} ${map.day}, ${map.year} ${map.hour}:${map.minute} ${map.dayPeriod}`
}

async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return true
  }
  if (typeof document === 'undefined') return false
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  const copied = document.execCommand('copy')
  document.body.removeChild(textarea)
  return copied
}

export function ChatPanel({
  chatId,
  initialMessages,
  initialAutoSendText = null,
  chatCreatedAt,
}: ChatPanelProps) {
  const { getToken } = useAuth()
  const [input, setInput] = useState('')
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [assistantFeedbackOpen, setAssistantFeedbackOpen] = useState<Record<string, boolean>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasAutoSentRef = useRef(false)
  const copyResetTimerRef = useRef<number | null>(null)

  const transport = useMemo(() => {
    return new DefaultChatTransport({
      api: apiUrl('/api/chat'),
      headers: async (): Promise<Record<string, string>> => {
        const token = await getToken()
        return token ? { Authorization: `Bearer ${token}` } : {}
      },
      prepareSendMessagesRequest: ({ id, messages }) => ({
        body: {
          id,
          message: messages[messages.length - 1],
        },
      }),
    })
  }, [getToken])

  const { messages, sendMessage, status, error, regenerate } = useChat({
    id: chatId,
    messages: initialMessages,
    transport,
  })

  const displayMessages = messages.filter((m) => m.role !== 'system')
  const charCount = input.length
  const overLimit = charCount > MAX_USER_CHARS
  const usageRatio = Math.min(charCount / MAX_USER_CHARS, 1)
  const isNearLimit = usageRatio >= 0.8
  const remainingChars = MAX_USER_CHARS - charCount
  const usageColor = overLimit ? '#dc2626' : isNearLimit ? '#f59e0b' : '#111827'
  const atMessageLimit = displayMessages.length >= MAX_MESSAGES
  const isReady = status === 'ready'
  const canSend = isReady && !overLimit && !atMessageLimit && input.trim().length > 0

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (hasAutoSentRef.current) return
    if (!initialAutoSendText || !initialAutoSendText.trim()) return
    if (!isReady || atMessageLimit) return

    hasAutoSentRef.current = true
    void sendMessage({ text: initialAutoSendText.trim() })
  }, [atMessageLimit, initialAutoSendText, isReady, sendMessage])

  useEffect(() => {
    return () => {
      if (copyResetTimerRef.current != null) {
        window.clearTimeout(copyResetTimerRef.current)
      }
    }
  }, [])

  const handleCopyMessage = async (messageId: string, text: string) => {
    const content = text.trim()
    if (!content) return
    try {
      const copied = await copyToClipboard(content)
      if (!copied) return
      setCopiedMessageId(messageId)
      if (copyResetTimerRef.current != null) {
        window.clearTimeout(copyResetTimerRef.current)
      }
      copyResetTimerRef.current = window.setTimeout(() => {
        setCopiedMessageId((current) => (current === messageId ? null : current))
      }, 800)
    } catch {
      // ignore clipboard errors
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSend) return

    const text = overLimit ? input.slice(0, MAX_USER_CHARS) : input.trim()
    if (!text) return

    void sendMessage({ text })
    setInput('')
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-3 py-3 pb-36">
        <div className="mx-auto max-w-2xl space-y-4 sm:space-y-6">
          {chatCreatedAt && (
            <p className="py-1 text-center text-[11px] text-muted-foreground sm:text-xs">
              {formatTimelineDate(chatCreatedAt)}
            </p>
          )}

          {displayMessages.map((m) => {
            const text = messageText(m)
            const copied = copiedMessageId === m.id
            const feedbackOpen = !!assistantFeedbackOpen[m.id]

            return (
              <div key={m.id} className="space-y-2 sm:space-y-2.5">
                <div
                  className={cn(
                    'text-sm leading-[1.65rem] sm:text-base sm:leading-[1.65rem]',
                    m.role === 'user' ? 'flex justify-end' : 'block'
                  )}
                >
                  {m.role === 'user' ? (
                    <div className="max-w-[82%] rounded-2xl rounded-br-md bg-slate-800/90 px-3 py-2 text-slate-50 shadow-sm">
                      <span className="whitespace-pre-wrap break-words">{text}</span>
                    </div>
                  ) : (
                    <div
                      className="markdown-message max-w-[95%] break-words px-1 text-foreground/95"
                      dangerouslySetInnerHTML={{ __html: markdownToHtml(text) }}
                      // Note: markdownToHtml uses escapeHtml for security. Consider adding DOMPurify for additional sanitization layer.
                    />
                  )}
                </div>

                <div className={cn('flex items-center gap-1 px-1', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'size-7 rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                      copied && 'text-emerald-600 hover:text-emerald-700'
                    )}
                    onClick={() => void handleCopyMessage(m.id, text)}
                    aria-label="Copy message"
                  >
                    {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  </Button>

                  {m.role === 'assistant' && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={cn(
                        'size-7 rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                        feedbackOpen && 'text-destructive hover:text-destructive'
                      )}
                      onClick={() =>
                        setAssistantFeedbackOpen((current) => ({
                          ...current,
                          [m.id]: !current[m.id],
                        }))
                      }
                      aria-label="Message feedback"
                    >
                      <ThumbsDown className="size-3.5" />
                    </Button>
                  )}
                </div>

                {m.role === 'assistant' && feedbackOpen && (
                  <div className="flex flex-wrap gap-1.5 px-1">
                    {ASSISTANT_FEEDBACK_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        aria-label={`Provide feedback: ${option}`}
                        className="rounded-full border px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:text-xs"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {(status === 'submitted' || status === 'streaming') && (
            <div className="max-w-[95%] px-1 text-sm text-muted-foreground">Thinking…</div>
          )}

          {error && (
            <div className="max-w-[95%] rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2">
              <p className="text-sm text-destructive">Something went wrong.</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2 text-sm"
                onClick={() => regenerate()}
              >
                Retry
              </Button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="pointer-events-none fixed inset-x-0 bottom-3 z-40 px-3">
        <div className="pointer-events-auto mx-auto w-full max-w-2xl rounded-2xl border border-border/80 bg-background/95 p-2 shadow-xl backdrop-blur">
          {atMessageLimit && (
            <p className="px-2 pb-1 text-sm text-muted-foreground">Maximum 10 messages. Start a new chat.</p>
          )}

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={!isReady || atMessageLimit}
            className="max-h-32 min-h-[44px] w-full resize-none bg-transparent px-2 py-2 text-sm outline-none"
          />

          <div className="flex items-center justify-between gap-2 px-1 pb-1">
            <div className="flex items-center gap-2">
              <span className="relative inline-flex size-4 shrink-0 rounded-full border border-zinc-400/80">
                <span
                  className="absolute inset-[2px] rounded-full"
                  style={{
                    background: `conic-gradient(${usageColor} ${usageRatio * 360}deg, transparent 0deg)`,
                  }}
                />
              </span>
              {(isNearLimit || overLimit) && (
                <span className={cn('text-xs sm:text-sm', overLimit ? 'text-destructive' : 'text-orange-500')}>
                  {overLimit
                    ? `${Math.abs(remainingChars).toLocaleString()} Over`
                    : `${remainingChars.toLocaleString()} Remaining`}
                </span>
              )}
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

      <style>{`
        .markdown-message h1,
        .markdown-message h2,
        .markdown-message h3,
        .markdown-message h4,
        .markdown-message h5,
        .markdown-message h6 {
          margin: 0.4rem 0;
          padding-bottom: 0.35rem;
          font-weight: 600;
          line-height: 1.35;
        }
        .markdown-message h1 { font-size: 1.25rem; }
        .markdown-message h2 { font-size: 1.15rem; }
        .markdown-message h3 { font-size: 1.05rem; }
        .markdown-message p {
          margin: 0.3rem 0;
          padding-bottom: 0.35rem;
        }
        .markdown-message ul,
        .markdown-message ol {
          margin: 0.3rem 0 0.3rem 1.2rem;
          padding: 0;
          padding-bottom: 0.35rem;
        }
        .markdown-message li { margin: 0.2rem 0; }
        .markdown-message blockquote {
          margin: 0.4rem 0;
          padding-bottom: 0.35rem;
          border-left: 2px solid hsl(var(--border));
          padding-left: 0.75rem;
          color: hsl(var(--muted-foreground));
        }
        .markdown-message pre {
          margin: 0.45rem 0;
          padding-bottom: 0.35rem;
          overflow-x: auto;
          border: 1px solid hsl(var(--border));
          border-radius: 0.5rem;
          padding: 0.65rem 0.65rem 1rem;
          background: hsl(var(--muted) / 0.4);
          font-size: 0.85rem;
        }
        .markdown-message code {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          border-radius: 0.35rem;
          background: hsl(var(--muted) / 0.55);
          padding: 0.12rem 0.35rem;
          font-size: 0.85em;
        }
        .markdown-message pre code {
          background: transparent;
          padding: 0;
        }
        .markdown-message a {
          text-decoration: underline;
          text-underline-offset: 3px;
        }
      `}</style>
    </div>
  )
}
