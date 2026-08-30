import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, describe, expect, it } from 'vitest'

import { installAuthGuards } from '@/router/auth-guards'
import { routes } from '@/router/routes'
import {
  AUTH_TOKEN_STORAGE_KEY,
  AUTH_USER_STORAGE_KEY,
  useAuthStore,
} from '@/stores/auth'
import type { AuthSession } from '@/types/auth'
import { createUnauthorizedHandler } from '../unauthorized'

const session: AuthSession = {
  token: 'mock-token-demo',
  user: {
    id: 'user-demo',
    identifier: 'demo@example.com',
    displayName: '演示用户',
  },
}

describe('createUnauthorizedHandler', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('clears the session and replaces a protected page with login plus redirect', async () => {
    const router = createRouter({ history: createMemoryHistory(), routes })
    installAuthGuards(router)
    useAuthStore().setSession(session)

    await router.push('/mine')
    await router.isReady()
    expect(router.currentRoute.value.name).toBe('mine')

    await createUnauthorizedHandler(router)()

    expect(useAuthStore().authenticated).toBe(false)
    expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull()
    expect(localStorage.getItem(AUTH_USER_STORAGE_KEY)).toBeNull()
    expect(router.currentRoute.value.name).toBe('login')
    expect(router.currentRoute.value.query.redirect).toBe('/mine')
  })

  it('does not bounce the login page when a 401 arrives during sign-in', async () => {
    const router = createRouter({ history: createMemoryHistory(), routes })
    installAuthGuards(router)

    await router.push('/login')
    await router.isReady()
    await createUnauthorizedHandler(router)()

    expect(router.currentRoute.value.name).toBe('login')
    expect(router.currentRoute.value.query.redirect).toBeUndefined()
  })
})
