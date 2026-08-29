import { describe, expect, it } from 'vitest'

import { parseAppEnv } from '../env'

describe('parseAppEnv', () => {
  it('normalizes public environment values', () => {
    expect(
      parseAppEnv(
        {
          VITE_API_BASE_URL: ' /api ',
          VITE_ENABLE_MOCK: 'true',
        },
        true,
      ),
    ).toEqual({
      apiBaseUrl: '/api',
      mockEnabled: true,
    })
  })

  it('never enables mocks outside development', () => {
    expect(
      parseAppEnv(
        {
          VITE_API_BASE_URL: '/api',
          VITE_ENABLE_MOCK: 'true',
        },
        false,
      ).mockEnabled,
    ).toBe(false)
  })

  it('rejects missing or invalid values', () => {
    expect(() =>
      parseAppEnv(
        {
          VITE_API_BASE_URL: ' ',
          VITE_ENABLE_MOCK: 'false',
        },
        true,
      ),
    ).toThrow('VITE_API_BASE_URL is required')

    expect(() =>
      parseAppEnv(
        {
          VITE_API_BASE_URL: '/api',
          VITE_ENABLE_MOCK: 'yes',
        },
        true,
      ),
    ).toThrow('VITE_ENABLE_MOCK must be either "true" or "false"')
  })
})
