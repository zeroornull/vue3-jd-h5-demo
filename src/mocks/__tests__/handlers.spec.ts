import { describe, expect, it } from 'vitest'

import { handleMockRequest } from '../handlers'

function request(path: string) {
  return handleMockRequest('GET', new URL(path, 'http://localhost'))
}

describe('handleMockRequest', () => {
  it('supports the legacy login contract with deterministic tokens', () => {
    expect(request('/api/login?username=zhangsan&password=123456')).toEqual({
      status: 200,
      body: {
        code: 1,
        message: '登录成功',
        token: 'mock-token-zhangsan',
        result: [],
      },
    })

    expect(request('/api/login?username=zhangsan&password=wrong')?.body).toMatchObject({
      code: 0,
      message: '账号或者密码错误',
    })
  })

  it('returns typed static data for migrated development endpoints', () => {
    expect(request('/api/banner')?.body).toMatchObject({ code: 1, message: 'success' })
    expect(request('/api/classify')?.body).toMatchObject({ code: 1, data: [] })
  })

  it('lets Vite continue for unknown routes and unsupported methods', () => {
    expect(request('/unknown')).toBeUndefined()
    expect(handleMockRequest('POST', new URL('/api/login', 'http://localhost'))).toBeUndefined()
  })
})
