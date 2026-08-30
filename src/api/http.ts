import axios from 'axios'
import type { AxiosAdapter, AxiosInstance, InternalAxiosRequestConfig } from 'axios'

import { appEnv } from '@/config/env'

const DEFAULT_TIMEOUT_MS = 12_000

export type AccessTokenProvider = () => string | null

export type UnauthorizedHandler = (error: HttpError) => void

export interface HttpClientOptions {
  baseURL: string
  getAccessToken?: AccessTokenProvider
  timeout?: number
  adapter?: AxiosAdapter
  onUnauthorized?: UnauthorizedHandler
}

interface HttpErrorOptions {
  status?: number
  code?: string
  data?: unknown
}

export class HttpError extends Error {
  readonly status: number | undefined
  readonly code: string | undefined
  readonly data: unknown

  constructor(message: string, options: HttpErrorOptions = {}) {
    super(message)
    this.name = 'HttpError'
    this.status = options.status
    this.code = options.code
    this.data = options.data
  }
}

function getResponseMessage(data: unknown): string | undefined {
  if (typeof data !== 'object' || data === null || !('message' in data)) {
    return undefined
  }

  return typeof data.message === 'string' ? data.message : undefined
}

export function normalizeHttpError(error: unknown): HttpError {
  if (axios.isAxiosError(error)) {
    const options: HttpErrorOptions = {
      data: error.response?.data,
    }

    if (error.response) {
      options.status = error.response.status
    }

    if (error.code) {
      options.code = error.code
    }

    return new HttpError(
      getResponseMessage(error.response?.data) ?? error.message ?? 'Request failed',
      options,
    )
  }

  if (error instanceof Error) {
    return new HttpError(error.message)
  }

  return new HttpError('Unknown request error')
}

export function isUnauthorizedStatus(status: number | undefined): boolean {
  return status === 401 || status === 403
}

let unauthorizedHandler: UnauthorizedHandler | undefined

export function setUnauthorizedHandler(handler: UnauthorizedHandler | undefined): void {
  unauthorizedHandler = handler
}

function browserAccessToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage.getItem('token')
}

export function createHttpClient(options: HttpClientOptions): AxiosInstance {
  const client = axios.create({
    baseURL: options.baseURL,
    timeout: options.timeout ?? DEFAULT_TIMEOUT_MS,
    ...(options.adapter ? { adapter: options.adapter } : {}),
  })

  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const accessToken = options.getAccessToken?.()

    if (accessToken) {
      config.headers.set('Authorization', `Bearer ${accessToken}`)
    }

    return config
  })

  client.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      const normalized = normalizeHttpError(error)

      if (isUnauthorizedStatus(normalized.status)) {
        options.onUnauthorized?.(normalized)
        void unauthorizedHandler?.(normalized)
      }

      return Promise.reject(normalized)
    },
  )

  return client
}

export const http = createHttpClient({
  baseURL: appEnv.apiBaseUrl,
  getAccessToken: browserAccessToken,
})
