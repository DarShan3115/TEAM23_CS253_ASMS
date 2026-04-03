import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Sets the dev server to port 3000
    host: true, // Allows access from network/Codespace
    proxy: {
      '/api/auth': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
      '/api/analytics': {
        target: 'http://localhost:8000', // Assuming FastAPI default
        changeOrigin: true,
        secure: false,
      },
      '/api/v1': {
        target: 'http://localhost:8080', // Productivity Service (Go)
        changeOrigin: true,
        secure: false,
      },
      '/api/academic': {
        target: 'http://localhost:8001', // Assuming Django/Academic port
        changeOrigin: true,
        secure: false,
      },
    },
  }
})