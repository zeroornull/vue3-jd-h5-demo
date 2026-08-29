import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import type { UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import { mockApiPlugin } from './build/plugins/mock-api.ts'

// https://vite.dev/config/
export const sharedConfig = {
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
} satisfies UserConfig

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const mockEnabled = mode === 'development' && env.VITE_ENABLE_MOCK === 'true'

  return {
    ...sharedConfig,
    plugins: [...sharedConfig.plugins, vueDevTools(), mockApiPlugin(mockEnabled)],
  }
})
