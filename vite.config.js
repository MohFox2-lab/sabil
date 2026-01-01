import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // احذف base أو خله هكذا:
  base: '/',
  plugins: [react()],
  server: {
    allowedHosts: true // هذا السطر سيسمح للتطبيق بالعمل في أي مكان
  }
})
