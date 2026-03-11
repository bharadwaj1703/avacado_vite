import type { UIMessage } from 'ai'

const pendingFirstChatMessages = new Map<string, string>()

type ParsedMessageContent = {
  id?: string
  role: string
  parts?: UIMessage['parts']
}

function isValidUIMessageContent(obj: unknown): obj is ParsedMessageContent {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'role' in obj &&
    typeof (obj as { role: unknown }).role === 'string' &&
    'parts' in obj
  )
}

function isValidUIMessageRole(role: string): role is UIMessage['role'] {
  return ['system', 'developer', 'user', 'assistant', 'tool'].includes(role)
}

export function messageRowsToUIMessages(
  messages: Array<{ id: string; role: string; content: string }>
): UIMessage[] {
  const out: UIMessage[] = []
  for (const row of messages) {
    try {
      const parsed = JSON.parse(row.content) as unknown
      if (isValidUIMessageContent(parsed) && isValidUIMessageRole(parsed.role)) {
        out.push({
          id: parsed.id ?? row.id,
          role: parsed.role,
          parts: parsed.parts ?? [],
        })
      }
    } catch {
      // skip malformed
    }
  }
  return out
}

export function setPendingFirstChatMessage(chatId: string, text: string): void {
  pendingFirstChatMessages.set(chatId, text)
}

export function consumePendingFirstChatMessage(chatId: string): string | null {
  const text = pendingFirstChatMessages.get(chatId) ?? null
  if (text != null) {
    pendingFirstChatMessages.delete(chatId)
  }
  return text
}
