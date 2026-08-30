import { describe, expect, it } from 'vitest'

import { handleMockRequest, resetOrderMockState, resetProfileMockState } from '../handlers'

function request(path: string) {
  return handleMockRequest('GET', new URL(path, 'http://localhost'))
}

describe('handleMockRequest', () => {
  it('supports JSON POST login with a typed session', () => {
    expect(
      handleMockRequest('POST', new URL('/api/auth/login', 'http://localhost'), {
        identifier: 'demo@example.com',
        password: 'Password123',
      })?.body,
    ).toMatchObject({
      code: 1,
      data: {
        token: 'mock-token-demo-example-com',
        user: {
          identifier: 'demo@example.com',
          displayName: '演示用户',
        },
      },
    })
  })

  it('supports verification, registration, login, and password reset as POST flows', () => {
    const identifier = 'round-auth@example.com'
    const url = (path: string) => new URL(path, 'http://localhost')

    expect(
      handleMockRequest('POST', url('/api/auth/send-code'), {
        channel: 'email',
        identifier,
        purpose: 'register',
      })?.body,
    ).toMatchObject({ code: 1, data: { developmentCode: '123456' } })

    expect(
      handleMockRequest('POST', url('/api/auth/register'), {
        channel: 'email',
        identifier,
        verificationCode: '123456',
        displayName: '新用户',
        password: 'Password123',
      })?.body,
    ).toMatchObject({ code: 1, message: '注册成功' })

    expect(
      handleMockRequest('POST', url('/api/auth/login'), {
        identifier,
        password: 'Password123',
      })?.body,
    ).toMatchObject({ code: 1, data: { user: { identifier } } })

    handleMockRequest('POST', url('/api/auth/send-code'), {
      channel: 'email',
      identifier,
      purpose: 'reset-password',
    })
    expect(
      handleMockRequest('POST', url('/api/auth/reset-password'), {
        channel: 'email',
        identifier,
        verificationCode: '123456',
        password: 'Changed123',
      })?.body,
    ).toMatchObject({ code: 1, message: '密码已重置' })
    expect(
      handleMockRequest('POST', url('/api/auth/login'), {
        identifier,
        password: 'Changed123',
      })?.body,
    ).toMatchObject({ code: 1 })
  })

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
    expect(request('/api/catalog')?.body).toMatchObject({
      code: 1,
      data: {
        categories: expect.arrayContaining([expect.objectContaining({ id: 'digital' })]),
        products: expect.arrayContaining([expect.objectContaining({ id: 'product-6' })]),
        campaigns: expect.arrayContaining([expect.objectContaining({ id: 'premiumRanking' })]),
        stores: expect.arrayContaining([expect.objectContaining({ id: 'store-1' })]),
      },
    })
    expect(request('/api/home')?.body).toMatchObject({
      code: 1,
      data: {
        banners: expect.arrayContaining([expect.objectContaining({ id: 'banner-1' })]),
        sections: expect.arrayContaining([expect.objectContaining({ id: 'featured' })]),
      },
    })
    expect(request('/api/search/hot')?.body).toMatchObject({
      code: 1,
      data: expect.arrayContaining([expect.objectContaining({ title: '小米手机', hot: true })]),
    })
    expect(request('/api/banner')?.body).toMatchObject({ code: 1, message: 'success' })
    expect(request('/api/classify')?.body).toMatchObject({ code: 1, data: [] })
  })

  it('supports order snapshot, checkout, pay, cancel, and appeal flows', () => {
    resetOrderMockState()
    const url = (path: string) => new URL(path, 'http://localhost')

    expect(handleMockRequest('GET', url('/api/orders'))?.body).toMatchObject({
      code: 1,
      data: {
        orders: expect.arrayContaining([expect.objectContaining({ id: 'order-unpaid' })]),
        appeals: expect.arrayContaining([expect.objectContaining({ id: 'appeal-1' })]),
      },
    })

    const created = handleMockRequest('POST', url('/api/orders'), {
      items: [{ productId: 'product-5', quantity: 1, spec: '黑色表带' }],
      paymentMethod: '支付宝',
    })?.body as { data: { id: string } }

    expect(created).toMatchObject({
      code: 1,
      data: { status: 'unpaid', paymentMethod: '支付宝' },
    })

    expect(
      handleMockRequest('POST', url(`/api/orders/${created.data.id}/pay`), {
        paymentMethod: '支付宝',
      })?.body,
    ).toMatchObject({ code: 1, data: { status: 'paid' } })

    const unpaid = handleMockRequest('POST', url('/api/orders'), {
      items: [{ productId: 'product-1', quantity: 1 }],
    })?.body as { data: { id: string } }

    expect(
      handleMockRequest('POST', url(`/api/orders/${unpaid.data.id}/cancel`), {
        reason: '买多了/买错了',
      })?.body,
    ).toMatchObject({ code: 1, data: { status: 'cancelled' } })

    expect(
      handleMockRequest('POST', url('/api/appeals'), {
        orderId: 'order-paid',
        contactName: '演示用户',
        contactPhone: '13800138000',
        content: '商品与描述不符',
        images: ['/mock/catalog/product-6.png'],
      })?.body,
    ).toMatchObject({ code: 1, data: { orderId: 'order-paid' } })
  })

  it('supports profile updates, addresses, password change and feedback', () => {
    resetProfileMockState()
    const url = (path: string) => new URL(path, 'http://localhost')

    expect(handleMockRequest('GET', url('/api/profile'))?.body).toMatchObject({
      code: 1,
      data: {
        profile: { displayName: '演示用户' },
        addresses: expect.arrayContaining([expect.objectContaining({ id: 'address-home' })]),
      },
    })

    expect(
      handleMockRequest('POST', url('/api/profile'), { displayName: '新昵称' })?.body,
    ).toMatchObject({ code: 1, data: { displayName: '新昵称' } })

    expect(
      handleMockRequest('POST', url('/api/profile/password'), {
        identifier: 'demo@example.com',
        currentPassword: 'Password123',
        password: 'Changed123',
      })?.body,
    ).toMatchObject({ code: 1, data: { identifier: 'demo@example.com' } })

    expect(
      handleMockRequest('POST', url('/api/addresses'), {
        name: '测试',
        phone: '13900001111',
        gender: 'female',
        region: '北京市朝阳区',
        detail: '望京SOHO',
        tag: 'home',
        isDefault: true,
      })?.body,
    ).toMatchObject({ code: 1, data: { name: '测试', isDefault: true } })

    expect(
      handleMockRequest('POST', url('/api/feedback'), {
        type: 'bug',
        content: '结算按钮点不了',
      })?.body,
    ).toMatchObject({ code: 1, data: { kind: 'feedback' } })
  })

  it('lets Vite continue for unknown routes and unsupported methods', () => {
    expect(request('/unknown')).toBeUndefined()
    expect(handleMockRequest('POST', new URL('/api/login', 'http://localhost'))).toBeUndefined()
  })
})
