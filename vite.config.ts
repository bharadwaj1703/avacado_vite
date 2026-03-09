import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'
import { contentPlugin } from './src/plugins/vite-content-plugin'
import path from 'path'

export default defineConfig({
  plugins: [
    contentPlugin(),
    react(),
    tailwindcss(),
    TanStackRouterVite(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    watch: {
      ignored: ['**/routeTree.gen.ts'],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        ws: false, // Disable WebSocket proxying
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            console.error('[Vite Proxy] Proxy error:', err)
            if (res && !res.headersSent) {
              res.writeHead(500, {
                'Content-Type': 'application/json',
              })
              res.end(JSON.stringify({ error: 'Proxy error' }))
            }
          })
        },
      },
    },
  },
})
