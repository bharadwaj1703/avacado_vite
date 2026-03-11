/**
 * Local API dev server — runs all api/ handlers on Bun's HTTP server.
 * Vite proxies /api/* here so `bun run dev` serves both frontend and API.
 */
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { resolve } from 'node:path'
import { readFileSync, existsSync } from 'node:fs'

// Load .env.local into process.env before anything else
const envPath = resolve(import.meta.dirname, '..', '.env.local')
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))
      value = value.slice(1, -1)
    if (!process.env[key]) process.env[key] = value
  }
}

import healthHandler from '../src/health'
import meHandler from '../src/users/me'
import syncHandler from '../src/users/sync'
import onboardingHandler from '../src/users/onboarding'
import activitiesHandler from '../src/activities'
import clerkWebhookHandler from '../src/webhooks/clerk'
import chatsHandler from '../src/chats/index'
import chatIdHandler from '../src/chats/[id]'
import chatHandler from '../src/chat/index'
import chatModelsHandler from '../src/chat/models'

type Handler = (req: IncomingMessage & { body?: unknown }, res: ServerResponse) => void | Promise<void>

const routes: [string, Handler][] = [
  ['/api/health', healthHandler],
  ['/api/users/me', meHandler],
  ['/api/users/sync', syncHandler],
  ['/api/users/onboarding', onboardingHandler],
  ['/api/activities', activitiesHandler],
  ['/api/webhooks/clerk', clerkWebhookHandler],
  ['/api/chat/models', chatModelsHandler],
  ['/api/chat', chatHandler],
  ['/api/chats', chatsHandler],
]

function matchRoute(pathname: string): Handler | null {
  for (const [pattern, handler] of routes) {
    if (pathname === pattern || pathname === `${pattern}/`) return handler
  }
  // /api/chats/:id
  if (pathname.startsWith('/api/chats/') && pathname.split('/').filter(Boolean).length === 3) {
    return chatIdHandler
  }
  return null
}

const PORT = Number(process.env.API_DEV_PORT) || 3001

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`)
  const handler = matchRoute(url.pathname)

  // Get the origin from the request, default to localhost:5173 for dev
  const origin = req.headers.origin || 'http://localhost:5173'
  
  // Allow all origins in dev, or specific origin in production
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    '*'
  ]
  
  const allowOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0]
  
  res.setHeader('Access-Control-Allow-Origin', allowOrigin)
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  if (!handler) {
    res.statusCode = 404
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Not found' }))
    return
  }

  try {
    await handler(req, res)
  } catch (err) {
    if (!res.headersSent) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: err instanceof Error ? err.message : 'Internal server error' }))
    }
  }
})

server.listen(PORT, () => {
  console.log(`API dev server running at http://localhost:${PORT}`)
})
