import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      // API REST y WebSocket de Socket.IO hacia el backend
      '/api': { target: 'http://localhost:5080', changeOrigin: true },
      '/socket.io': { target: 'http://localhost:5080', ws: true, changeOrigin: true },
    },
  },
})
