import { describe, expect, it } from 'vitest'

import { HttpError } from '../http'
import { unwrapApiResponse } from '../types'

describe('unwrapApiResponse', () => {
  it('returns typed data for a successful application response', () => {
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
})
