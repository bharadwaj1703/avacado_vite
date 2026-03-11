/**
 * Vercel Serverless Function Handler
 * Handles all /api/* routes
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { IncomingMessage, ServerResponse } from 'http'

// Import backend route matcher
import { matchRoute } from '../backend/src/routes/index.js'
import chatHandler from '../backend/src/chat/index.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Construct the full path
    const path = Array.isArray(req.query.path) ? req.query.path.join('/') : req.query.path || ''
    const pathname = `/api/${path}`

    // Handle CORS
    const origin = req.headers.origin || req.headers.host || ''
    const allowedOrigins = [
      'http://localhost:3001',
      'http://localhost:5173',
      'https://theavocado.app',
      ...(process.env.ALLOWED_ORIGINS?.split(',').filter(Boolean) || [])
    ]

    const allowOrigin = origin && allowedOrigins.some(allowed =>
      origin.includes(allowed.replace(/^https?:\/\//, ''))
    ) ? origin : (allowedOrigins.find(o => o.startsWith('https://')) || allowedOrigins[0])

    res.setHeader('Access-Control-Allow-Origin', allowOrigin)
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')

    // Handle OPTIONS preflight
    if (req.method === 'OPTIONS') {
      res.status(204).end()
      return
    }

    // Special handling for /api/chat (streaming endpoint)
    let handler = pathname === '/api/chat' ? chatHandler : matchRoute(pathname)

    if (!handler) {
      res.status(404).json({ error: 'Not found' })
      return
    }

    // Create Node.js compatible request/response objects
    const nodeReq = req as unknown as IncomingMessage
    const nodeRes = res as unknown as ServerResponse

    // Call the handler
    await handler(nodeReq, nodeRes)
  } catch (error) {
    console.error('API Error:', error)
    if (!res.headersSent) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Internal server error'
      })
    }
  }
}

// Configure for Vercel serverless functions
export const config = {
  runtime: 'nodejs20.x',
  maxDuration: 60,
}
