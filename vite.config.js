import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import base44 from '@base44/vite-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  // مهم جدًا لـ GitHub Pages: اسم المستودع بين السلاشات
  // لو الريبو اسمه غير sabil غيره هنا
  base: '/sabil/',

  logLevel: 'error', // إظهار الأخطاء فقط

  plugins: [
    base44({
      // دعم الكودات القديمة لو كنت تستخدم استيرادات قديمة
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
      hmrNotifier: true,
      navigationNotifier: true,
      visualEditAgent: true,
    }),
    react(),
  ],
})
