import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, describe, expect, it } from 'vitest'

import { useAuthStore } from '@/stores/auth'
import type { AuthSession } from '@/types/auth'
import { installAuthGuards } from '../auth-guards'
import { routes } from '../routes'

const session: AuthSession = {
  token: 'mock-token-demo',
  user: {
    id: 'user-demo',
    identifier: 'demo@example.com',
    displayName: '演示用户',
  },
}

function createTestRouter() {
  const router = createRouter({ history: createMemoryHistory(), routes })
  installAuthGuards(router)
  return router
}

describe('authentication navigation guards', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('redirects a protected route to login and preserves the full path', async () => {
    const router = createTestRouter()

    await router.push('/order?tab=all')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('login')
    expect(router.currentRoute.value.query.redirect).toBe('/order?tab=all')
  })

  it('returns an authenticated guest-only visitor to the requested protected route', async () => {
    useAuthStore().setSession(session)
    const router = createTestRouter()

    await router.push('/login?redirect=/order')
    await router.isReady()

    expect(router.currentRoute.value.fullPath).toBe('/order')
    expect(router.currentRoute.value.name).toBe('order')
  })

  it('rejects an external redirect value for an authenticated visitor', async () => {
    useAuthStore().setSession(session)
    const router = createTestRouter()

    await router.push('/login?redirect=//evil.example')
    await router.isReady()

    expect(router.currentRoute.value.fullPath).toBe('/index')
  })
})
