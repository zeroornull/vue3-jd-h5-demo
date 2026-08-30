import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { StorageLike } from '@/services/json-storage'
import type { AuthSession } from '@/types/auth'

const api = vi.hoisted(() => ({
  login: vi.fn<() => Promise<AuthSession>>(),
}))

vi.mock('@/api/auth', () => ({ login: api.login }))

import {
  AUTH_TOKEN_STORAGE_KEY,
  AUTH_USER_STORAGE_KEY,
  useAuthStore,
} from '../auth'

class MemoryStorage implements StorageLike {
  readonly values = new Map<string, string>()

  getItem(key: string): string | null {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value)
  }

  removeItem(key: string): void {
    this.values.delete(key)
  }
}

const session: AuthSession = {
  token: 'mock-token-demo',
  user: {
    id: 'user-demo',
    identifier: 'demo@example.com',
    displayName: '演示用户',
  },
}

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    api.login.mockReset()
    api.login.mockResolvedValue(session)
  })

  it('logs in and persists the legacy-compatible token plus typed user', async () => {
    const storage = new MemoryStorage()
    const store = useAuthStore()

    await store.login({ identifier: 'demo@example.com', password: 'Password123' }, storage)

    expect(store.authenticated).toBe(true)
    expect(storage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBe(session.token)
    expect(JSON.parse(storage.getItem(AUTH_USER_STORAGE_KEY) ?? 'null')).toEqual(session.user)
  })

  it('hydrates a complete session and removes a partial/corrupt session', () => {
    const storage = new MemoryStorage()
    storage.setItem(AUTH_TOKEN_STORAGE_KEY, session.token)
    storage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(session.user))
    const store = useAuthStore()

    store.hydrate(storage)
    expect(store.authenticated).toBe(true)

    setActivePinia(createPinia())
    const partialStore = useAuthStore()
    storage.setItem(AUTH_USER_STORAGE_KEY, '{broken')
    partialStore.hydrate(storage)
    expect(partialStore.authenticated).toBe(false)
    expect(storage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull()
  })

  it('logs out and manages an in-memory two-step registration draft', () => {
    const storage = new MemoryStorage()
    const store = useAuthStore()
    store.setSession(session, storage)
    store.setRegistrationDraft({
      channel: 'email',
      identifier: 'new@example.com',
      verificationCode: '123456',
    })

    expect(store.registrationDraft?.identifier).toBe('new@example.com')
    store.clearRegistrationDraft()
    store.logout(storage)

    expect(store.registrationDraft).toBeUndefined()
    expect(store.authenticated).toBe(false)
    expect(storage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull()
  })

  it('updates the persisted display name without dropping the session', () => {
    const storage = new MemoryStorage()
    const store = useAuthStore()
    store.setSession(session, storage)
    store.updateUser({ displayName: '新昵称' }, storage)

    expect(store.user?.displayName).toBe('新昵称')
    expect(JSON.parse(storage.getItem(AUTH_USER_STORAGE_KEY) ?? 'null')).toMatchObject({
      displayName: '新昵称',
      identifier: session.user.identifier,
    })
  })
})
