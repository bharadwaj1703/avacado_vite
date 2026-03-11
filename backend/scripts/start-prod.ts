/**
 * Production API server — runs all api/ handlers on Bun's HTTP server.
 */
import { createServer } from 'node:http'
import { matchRoute } from '../src/routes/index.js'
import chatHandler from '../src/chat/index.js'

const PORT = Number(process.env.API_PORT || process.env.PORT) || 3001

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`)
  
  // Special handling for /api/chat (streaming endpoint)
  let handler = url.pathname === '/api/chat' ? chatHandler : matchRoute(url.pathname)

  // Get the origin from the request
  const origin = req.headers.origin || ''
  
  // In production, allow specific origins
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []
  const allowOrigin = allowedOrigins.includes(origin) ? origin : '*'
  
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
    console.error('Request error:', err)
    if (!res.headersSent) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: err instanceof Error ? err.message : 'Internal server error' }))
    }
  }
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Production API server running at http://0.0.0.0:${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`)
  console.log(`Database: ${process.env.DATABASE || 'sqlite'}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server')
  server.close(() => {
    console.log('HTTP server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server')
  server.close(() => {
    console.log('HTTP server closed')
    process.exit(0)
  })
})
