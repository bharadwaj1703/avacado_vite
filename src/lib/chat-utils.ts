import type { UIMessage } from 'ai'

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
