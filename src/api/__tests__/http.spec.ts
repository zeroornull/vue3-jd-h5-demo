import { AxiosError } from 'axios'
import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  createHttpClient,
  HttpError,
  isUnauthorizedStatus,
  normalizeHttpError,
  setUnauthorizedHandler,
} from '../http'

function successAdapter(onRequest: (config: InternalAxiosRequestConfig) => void): AxiosAdapter {
  return async (config) => {
    onRequest(config)

    return {
      data: { ok: true },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    }
  }
}

afterEach(() => {
  setUnauthorizedHandler(undefined)
})

describe('createHttpClient', () => {
  it('adds a bearer token without relying on Vue component globals', async () => {
    let authorization: string | undefined
    const client = createHttpClient({
      baseURL: '/api',
      getAccessToken: () => 'test-token',
      adapter: successAdapter((config) => {
        authorization = config.headers.get('Authorization')?.toString()
      }),
    })

    await client.get('/profile')

    expect(authorization).toBe('Bearer test-token')
  })

  it('does not add an authorization header without a token', async () => {
    let authorization: unknown
    const client = createHttpClient({
      baseURL: '/api',
      getAccessToken: () => null,
      adapter: successAdapter((config) => {
        authorization = config.headers.get('Authorization')
      }),
    })

    await client.get('/public')

    expect(authorization).toBeUndefined()
  })

  it.each([
    { status: 401, message: '需要登录' },
    { status: 403, message: '登录已过期' },
    { status: 404, message: '资源不存在' },
  ])('normalizes a $status response into an application error', async ({ status, message }) => {
    const adapter: AxiosAdapter = async (config) => {
      throw new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, undefined, {
        data: { message },
        status,
        statusText: 'Request failed',
        headers: {},
        config,
      })
    }
    const client = createHttpClient({ baseURL: '/api', adapter })

    await expect(client.get('/private')).rejects.toMatchObject({
      name: 'HttpError',
      message,
      status,
      code: 'ERR_BAD_REQUEST',
    })
  })

  it('notifies an unauthorized handler for 401 and 403 but not 404', async () => {
    const onUnauthorized = vi.fn<(error: HttpError) => void>()
    const adapterFor = (status: number): AxiosAdapter => {
      return async (config) => {
        throw new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, undefined, {
          data: { message: 'nope' },
          status,
          statusText: 'Request failed',
          headers: {},
          config,
        })
      }
    }

    await expect(
      createHttpClient({ baseURL: '/api', adapter: adapterFor(401), onUnauthorized }).get('/private'),
    ).rejects.toMatchObject({ status: 401 })
    await expect(
      createHttpClient({ baseURL: '/api', adapter: adapterFor(403), onUnauthorized }).get('/private'),
    ).rejects.toMatchObject({ status: 403 })
    await expect(
      createHttpClient({ baseURL: '/api', adapter: adapterFor(404), onUnauthorized }).get('/missing'),
    ).rejects.toMatchObject({ status: 404 })

    expect(onUnauthorized).toHaveBeenCalledTimes(2)
    expect(isUnauthorizedStatus(401)).toBe(true)
    expect(isUnauthorizedStatus(404)).toBe(false)
  })
})

describe('normalizeHttpError', () => {
  it('handles non-Axios errors without exposing an unknown value', () => {
    expect(normalizeHttpError(new Error('offline'))).toEqual(new HttpError('offline'))
    expect(normalizeHttpError(null).message).toBe('Unknown request error')
  })
})
