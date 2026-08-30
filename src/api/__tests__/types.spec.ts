import { describe, expect, it } from 'vitest'

import { HttpError } from '../http'
import { unwrapApiData, unwrapApiResponse } from '../types'

describe('unwrapApiResponse', () => {
  it('returns envelope data for a successful application response', () => {
    expect(unwrapApiResponse({ code: 1, message: 'success', data: { id: 'home' } })).toEqual({
      id: 'home',
    })
  })

  it('throws a normalized HttpError for an application failure', () => {
    const failure = { code: 0, message: '业务失败', data: null }
    let thrown: unknown

    try {
      unwrapApiResponse(failure)
    } catch (error) {
      thrown = error
    }

    expect(thrown).toBeInstanceOf(HttpError)
    expect(thrown).toMatchObject({
      name: 'HttpError',
      message: '业务失败',
      data: failure,
    })
  })

  it('rejects HTML or otherwise untyped payloads at the envelope boundary', () => {
    expect(() => unwrapApiResponse('<!DOCTYPE html>')).toThrow(HttpError)
    expect(() => unwrapApiResponse({ message: 'success' })).toThrow(/Invalid API payload/)
    expect(() => unwrapApiData({ code: 1, message: 'ok', data: 12 }, expectStringLike)).toThrow(
      /Invalid API payload/,
    )
  })
})

function expectStringLike(value: unknown): string {
  if (typeof value !== 'string') {
    throw new HttpError('Invalid API payload: data')
  }

  return value
}
