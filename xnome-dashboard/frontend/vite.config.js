import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://127.0.0.1:8787',
      '/auth': 'http://127.0.0.1:8787'
    }
  },
  // ECharts is large; keep build responsive during early UI iteration.
  // We'll re-enable full minification once the design is locked.
  build: {
    minify: false,
    sourcemap: false
  }
})
