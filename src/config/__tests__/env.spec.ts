import { describe, expect, it } from 'vitest'

import { parseAppEnv } from '../env'

describe('parseAppEnv', () => {
  it('normalizes the public API base URL', () => {
    expect(
      parseAppEnv({
        VITE_API_BASE_URL: ' /api ',
        VITE_ENABLE_MOCK: 'true',
      }),
    ).toEqual({
      apiBaseUrl: '/api',
    })
  })

  it('rejects missing or invalid values', () => {
    expect(() =>
      parseAppEnv({
        VITE_API_BASE_URL: ' ',
        VITE_ENABLE_MOCK: 'false',
      }),
    ).toThrow('VITE_API_BASE_URL is required')

    expect(() =>
      parseAppEnv({
        VITE_API_BASE_URL: '/api',
        VITE_ENABLE_MOCK: 'yes',
      }),
    ).toThrow('VITE_ENABLE_MOCK must be either "true" or "false"')
  })
})
