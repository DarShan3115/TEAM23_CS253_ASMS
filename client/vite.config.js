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
        target: 'http://auth-service:5001', // Use Docker service name
        changeOrigin: true,
        secure: false,
      },
      '/api/users': {
        target: 'http://auth-service:5001',
        changeOrigin: true,
        secure: false,
      },
      '/api/admin': {
        target: 'http://auth-service:5001',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://auth-service:5001', // Serve avatar images via proxy
        changeOrigin: true,
        secure: false,
      },
      '/api/analytics': {
        target: 'http://analytics-service:8001', // Use Docker service name and correct port
        changeOrigin: true,
        secure: false,
      },
      '/api/v1': {
        target: 'http://productivity-service:8080', // Use Docker service name
        changeOrigin: true,
        secure: false,
      },
      '/api/academic': {
        target: 'http://academic-service:8000', // Use Docker service name and correct port
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/academic/, '/api')
      },
    },
  }
})