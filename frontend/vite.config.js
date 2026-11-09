import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // In development, proxy /api requests to the local Flask server so the
  // frontend never needs to know a cross-origin URL.
  const backendTarget = env.VITE_API_BASE_URL || 'http://127.0.0.1:5000'

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
