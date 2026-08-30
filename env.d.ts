/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_ENABLE_MOCK?: 'true' | 'false'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.svg?raw' {
  const source: string
  export default source
}
