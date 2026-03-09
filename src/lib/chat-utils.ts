import type { UIMessage } from 'ai'

const pendingFirstChatMessages = new Map<string, string>()

export function messageRowsToUIMessages(
  messages: Array<{ id: string; role: string; content: string }>
): UIMessage[] {
  const out: UIMessage[] = []
  for (const row of messages) {
    try {
      const o = JSON.parse(row.content) as unknown
      if (o && typeof o === 'object' && 'role' in o && 'parts' in o) {
        const obj = o as { id?: string; role: string; parts: UIMessage['parts'] }
        out.push({
          id: obj.id ?? row.id,
          role: obj.role as UIMessage['role'],
          parts: obj.parts ?? [],
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
