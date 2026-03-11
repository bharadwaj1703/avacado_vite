/**
 * Local API dev server — runs all api/ handlers on Bun's HTTP server.
 * Vite proxies /api/* here so `bun run dev` serves both frontend and API.
 */
import { createServer } from 'node:http'
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

import { matchRoute } from '../src/routes/index.js'
import chatHandler from '../src/chat/index.js'

const PORT = Number(process.env.API_DEV_PORT) || 3001

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`)
  
  // Special handling for /api/chat (streaming endpoint)
  let handler = url.pathname === '/api/chat' ? chatHandler : matchRoute(url.pathname)

  // Get the origin from the request
  const origin = req.headers.origin || req.headers.host || 'http://localhost:5173'
  
  // Allow common dev origins
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:3001',
    'http://0.0.0.0:3001'
  ]
  
  // When credentials are included, we must specify exact origin (not *)
  const allowOrigin = allowedOrigins.some(allowed => 
    origin.includes(allowed.replace(/^https?:\/\//, ''))
  ) ? origin : allowedOrigins[0]
  
  res.setHeader('Access-Control-Allow-Origin', allowOrigin)
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')

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
