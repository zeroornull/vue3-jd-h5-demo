export interface AppEnv {
  apiBaseUrl: string
}

interface PublicEnv {
  VITE_API_BASE_URL?: string
  VITE_ENABLE_MOCK?: string
}

export function parseAppEnv(source: PublicEnv): AppEnv {
  const apiBaseUrl = source.VITE_API_BASE_URL?.trim()

  if (!apiBaseUrl) {
    throw new Error('VITE_API_BASE_URL is required')
  }

  const mockFlag = source.VITE_ENABLE_MOCK ?? 'false'

  if (mockFlag !== 'true' && mockFlag !== 'false') {
    throw new Error('VITE_ENABLE_MOCK must be either "true" or "false"')
  }

  return { apiBaseUrl }
}

export const appEnv = parseAppEnv(import.meta.env)
