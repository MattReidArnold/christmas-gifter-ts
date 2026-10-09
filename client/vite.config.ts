/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const proxyHost = process.env.PROXY_HOST ?? 'localhost'
const proxyPort = process.env.PROXY_PORT ?? '4000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: `http://${proxyHost}:${proxyPort}`,
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
})
