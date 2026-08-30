import { HttpError } from './http'

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export function unwrapApiResponse<T>(response: ApiResponse<T>): T {
  if (response.code !== 1) {
    throw new HttpError(response.message || 'API request failed', {
      data: response,
    })
  }

  return response.data
}
