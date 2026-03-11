/**
 * Production server — serves both API and frontend static files
 */
import { createServer } from 'node:http'
import { readFileSync, existsSync, statSync } from 'node:fs'
import { resolve, extname, join } from 'node:path'
import { matchRoute } from '../src/routes/index.js'
import chatHandler from '../src/chat/index.js'

const PORT = Number(process.env.API_PORT || process.env.PORT) || 3001
const FRONTEND_DIST = resolve(import.meta.dirname, '../../frontend/dist')

// MIME types for static files
const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf',
  '.webp': 'image/webp',
  '.txt': 'text/plain',
}

function serveStaticFile(filePath: string, res: any) {
  try {
    const content = readFileSync(filePath)
    const ext = extname(filePath)
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream'
    
    res.statusCode = 200
    res.setHeader('Content-Type', mimeType)
    res.setHeader('Cache-Control', ext === '.html' ? 'no-cache' : 'public, max-age=31536000')
    res.end(content)
    return true
  } catch (err) {
    return false
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`)
  
  // Handle API routes
  if (url.pathname.startsWith('/api/')) {
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
    return
  }

  // Serve frontend static files
  let filePath = join(FRONTEND_DIST, url.pathname === '/' ? 'index.html' : url.pathname)
  
  // Check if file exists
  if (existsSync(filePath) && statSync(filePath).isFile()) {
    serveStaticFile(filePath, res)
    return
  }
  
  // For SPA routing, serve index.html for non-existent routes
  const indexPath = join(FRONTEND_DIST, 'index.html')
  if (existsSync(indexPath)) {
    serveStaticFile(indexPath, res)
  } else {
    res.statusCode = 404
    res.setHeader('Content-Type', 'text/plain')
    res.end('Not Found')
  }
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Production server running at http://0.0.0.0:${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`)
  console.log(`Database: ${process.env.DATABASE || 'sqlite'}`)
  console.log(`Serving frontend from: ${FRONTEND_DIST}`)
  console.log(`API endpoints: /api/*`)
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
