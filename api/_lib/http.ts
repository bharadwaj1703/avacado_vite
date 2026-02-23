import type { IncomingMessage, ServerResponse } from 'node:http'

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

export function sendJson(res: ServerResponse, statusCode: number, payload: JsonValue | { [key: string]: unknown }) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

export async function readBodyText(req: IncomingMessage & { body?: unknown }): Promise<string> {
  if (typeof req.body === 'string') return req.body
  if (req.body && typeof req.body === 'object') return JSON.stringify(req.body)

  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)))
  }
  return Buffer.concat(chunks).toString('utf8')
}

export async function readBodyJson<T>(req: IncomingMessage & { body?: unknown }): Promise<T> {
  const bodyText = await readBodyText(req)
  if (!bodyText) return {} as T
  return JSON.parse(bodyText) as T
}

export function getBearerToken(req: IncomingMessage): string | null {
  const raw = req.headers.authorization
  if (!raw) return null
  const [scheme, token] = raw.split(' ')
  if (scheme !== 'Bearer' || !token) return null
  return token
}

export function methodNotAllowed(res: ServerResponse, method: string) {
  sendJson(res, 405, { error: `Method not allowed. Use ${method}.` })
}

/**
 * Pipe a Web ReadableStream to a Node ServerResponse (for streaming SSE/chat).
 */
export async function pipeStreamToResponse(
  res: ServerResponse,
  stream: ReadableStream<Uint8Array>,
  headers: Record<string, string>,
  statusCode = 200
): Promise<void> {
  res.statusCode = statusCode
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value)
  }
  const reader = stream.getReader()
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      res.write(Buffer.from(value))
    }
  } finally {
    reader.releaseLock()
  }
  res.end()
}
