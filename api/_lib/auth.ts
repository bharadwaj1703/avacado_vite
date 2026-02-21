import type { IncomingMessage } from 'node:http'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { assertClerkSecret, assertWebhookSecret, getEnv } from '../env'
import { getBearerToken, readBodyText } from '../http'

type ClerkSessionVerifyResponse = {
  sub?: string
  payload?: {
    sub?: string
  }
}

export async function requireClerkUserId(req: IncomingMessage): Promise<string> {
  const token = getBearerToken(req)
  if (!token) throw new Error('Missing bearer token')

  const env = getEnv()
  assertClerkSecret(env)

  const response = await fetch(`${env.clerkBackendApiUrl}/v1/sessions/verify`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.clerkSecretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  })

  if (!response.ok) {
    throw new Error('Invalid auth token')
  }

  const payload = (await response.json()) as ClerkSessionVerifyResponse
  const clerkUserId = payload.sub ?? payload.payload?.sub
  if (!clerkUserId) throw new Error('Unable to resolve Clerk user')

  return clerkUserId
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
