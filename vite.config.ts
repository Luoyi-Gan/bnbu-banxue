import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: { host: '127.0.0.1', port: 4174, strictPort: true, watch: { ignored: ['**/docs/**', '**/data/**', '**/artifacts/**'] }, proxy: {
    ...(process.env.BNBU_SPORTS_ORIGIN ? { '/api/v1': { target: process.env.BNBU_SPORTS_ORIGIN, changeOrigin: false } } : {}),
    ...(process.env.BNBU_SPORTS_OBJECT_ORIGIN ? { '/minio': { target: process.env.BNBU_SPORTS_OBJECT_ORIGIN, rewrite: (path: string) => path.replace(/^\/minio/, '') } } : {}),
    '/api': { target: process.env.BNBU_COMPANION_ORIGIN || 'http://127.0.0.1:4175' },
  } },
})
