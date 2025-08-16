import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  define: {
    global: 'globalThis',
  },
  // 开发环境默认值
  envPrefix: 'VITE_',
  server: {
    host: true,
    port: 4000
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
