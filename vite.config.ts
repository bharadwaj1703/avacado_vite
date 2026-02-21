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
  },
})
