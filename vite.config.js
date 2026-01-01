import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/sabil/',
  plugins: [react()],
  server: {
    allowedHosts: true // هذا السطر سيسمح للتطبيق بالعمل في أي مكان
  }
})