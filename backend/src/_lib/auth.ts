import type { IncomingMessage } from 'node:http'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { verifyToken } from '@clerk/backend'
import { assertClerkSecret, assertWebhookSecret, getEnv } from './env.js'
import { getBearerToken, readBodyText } from './http.js'

function getCookieValue(req: IncomingMessage, name: string): string | null {
  const rawCookie = req.headers.cookie
  if (!rawCookie) return null

  const cookies = rawCookie.split(';')
  for (const item of cookies) {
    const trimmed = item.trim()
    if (!trimmed) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    if (key !== name) continue
    const value = trimmed.slice(eq + 1).trim()
    if (!value) return null
    try {
      return decodeURIComponent(value)
    } catch {
      return value
    }
  }

  return null
}

export async function requireClerkUserId(req: IncomingMessage): Promise<string> {
  const token = getBearerToken(req) ?? getCookieValue(req, '__session')
  if (!token) throw new Error('Missing bearer token')

  const env = getEnv()
  assertClerkSecret(env)

  const payload = await verifyToken(token, {
    secretKey: env.clerkSecretKey,
  })

  if (!payload.sub) throw new Error('Unable to resolve Clerk user')
  return payload.sub
}

function decodeSvixSecret(secret: string): Buffer {
  const normalized = secret.startsWith('whsec_') ? secret.slice(6) : secret
  return Buffer.from(normalized, 'base64')
}

function createSvixSignature(secret: string, svixId: string, svixTimestamp: string, body: string): string {
  const signedContent = `${svixId}.${svixTimestamp}.${body}`
  const hmac = createHmac('sha256', decodeSvixSecret(secret))
  hmac.update(signedContent)
  return hmac.digest('base64')
}

function constantTimeEquals(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a)
  const bBuffer = Buffer.from(b)
  if (aBuffer.length !== bBuffer.length) return false
  return timingSafeEqual(aBuffer, bBuffer)
}

export async function verifyClerkWebhook(req: IncomingMessage & { body?: unknown }): Promise<string> {
  const env = getEnv()
  assertWebhookSecret(env)

  const svixId = req.headers['svix-id']
  const svixTimestamp = req.headers['svix-timestamp']
  const svixSignatureHeader = req.headers['svix-signature']

  if (
    typeof svixId !== 'string' ||
    typeof svixTimestamp !== 'string' ||
    typeof svixSignatureHeader !== 'string'
  ) {
    throw new Error('Missing Svix headers')
  }

  const body = await readBodyText(req)
  const expected = createSvixSignature(env.clerkWebhookSecret, svixId, svixTimestamp, body)
  const signatures = svixSignatureHeader
    .split(' ')
    .filter(Boolean)
    .map((item) => item.split(',')[1] ?? '')

  const valid = signatures.some((signature) => constantTimeEquals(signature, expected))
  if (!valid) throw new Error('Invalid webhook signature')

  return body
}
