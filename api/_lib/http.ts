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
