import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      // HTTP API calls
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      // Socket.IO WebSocket + polling — must proxy this path too
      '/socket.io': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true,          // ← enable WebSocket proxying
      },
    }
  },
  plugins: [react(), tailwindcss()],
})
