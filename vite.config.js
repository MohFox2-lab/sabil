import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import base44 from '@base44/vite-plugin'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  base: '/sabil/',        // نفس الإعداد اللي كان يشتغل معك
  logLevel: 'error',      // إظهار الأخطاء فقط

  plugins: [
    base44({
      // إعدادات كلود سونت / Base44
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
      hmrNotifier: true,
      navigationNotifier: true,
      visualEditAgent: true,
    }),
    react(),
  ],

  // هنا نعرّف الرمز @ أنه يشير إلى مجلد src
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  server: {
    allowedHosts: true,   // يسمح للتطبيق يشتغل في أي مكان (CloudSunit وغيره)
  },
})