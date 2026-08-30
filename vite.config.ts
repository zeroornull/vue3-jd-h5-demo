import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import type { PluginOption, UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import { mockApiPlugin } from './build/plugins/mock-api.ts'

export const sharedConfig = {
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
} satisfies UserConfig

function isMockEnabled(env: Record<string, string>): boolean {
  return (process.env.VITE_ENABLE_MOCK ?? env.VITE_ENABLE_MOCK) === 'true'
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const plugins: PluginOption[] = [...sharedConfig.plugins]

  if (mode === 'development') {
    plugins.push(vueDevTools())
  }

  plugins.push(mockApiPlugin(isMockEnabled(env)))

  return {
    ...sharedConfig,
    base: '/',
    appType: 'spa',
    plugins,
    preview: {
      port: 4173,
      strictPort: true,
    },
  }
})
