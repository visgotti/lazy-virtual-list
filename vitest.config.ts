import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    include: ['**/*.spec.{ts,tsx,js,jsx}'],
    environment: 'jsdom',
    globals: true
  }
})