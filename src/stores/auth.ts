import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { login as loginRequest } from '@/api/auth'
import { getBrowserStorage, readJson, writeJson } from '@/services/json-storage'
import type { StorageLike } from '@/services/json-storage'
import type { AuthSession, AuthUser, LoginInput, RegistrationDraft } from '@/types/auth'

export const AUTH_TOKEN_STORAGE_KEY = 'token'
export const AUTH_USER_STORAGE_KEY = 'authUser'

function isAuthUser(value: unknown): value is AuthUser {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Partial<AuthUser>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.identifier === 'string' &&
    typeof candidate.displayName === 'string'
  )
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>()
  const user = ref<AuthUser>()
  const registrationDraft = ref<RegistrationDraft>()
  const hydrated = ref(false)
  const loading = ref(false)
  const errorMessage = ref('')

  const authenticated = computed(() => Boolean(token.value && user.value))

  function clearPersistedSession(storage: StorageLike | undefined): void {
    storage?.removeItem(AUTH_TOKEN_STORAGE_KEY)
    storage?.removeItem(AUTH_USER_STORAGE_KEY)
  }

  function hydrate(storage: StorageLike | undefined = getBrowserStorage()): void {
    if (hydrated.value) {
      return
    }

    const storedToken = storage?.getItem(AUTH_TOKEN_STORAGE_KEY) ?? undefined
    const storedUser = readJson(AUTH_USER_STORAGE_KEY, isAuthUser, storage)

    if (storedToken && storedUser) {
      token.value = storedToken
      user.value = storedUser
    } else {
      token.value = undefined
      user.value = undefined
      clearPersistedSession(storage)
    }

    hydrated.value = true
  }

  function setSession(
    session: AuthSession,
    storage: StorageLike | undefined = getBrowserStorage(),
  ): void {
    token.value = session.token
    user.value = session.user
    hydrated.value = true
    storage?.setItem(AUTH_TOKEN_STORAGE_KEY, session.token)
    writeJson(AUTH_USER_STORAGE_KEY, session.user, storage)
  }

  async function login(
    input: LoginInput,
    storage: StorageLike | undefined = getBrowserStorage(),
  ): Promise<AuthSession> {
    loading.value = true
    errorMessage.value = ''

    try {
      const session = await loginRequest(input)
      setSession(session, storage)
      return session
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '登录失败'
      throw error
    } finally {
      loading.value = false
    }
  }

  function updateUser(
    partial: Partial<AuthUser>,
    storage: StorageLike | undefined = getBrowserStorage(),
  ): void {
    if (!user.value) {
      return
    }

    user.value = { ...user.value, ...partial }
    writeJson(AUTH_USER_STORAGE_KEY, user.value, storage)
  }

  function logout(storage: StorageLike | undefined = getBrowserStorage()): void {
    token.value = undefined
    user.value = undefined
    hydrated.value = true
    clearPersistedSession(storage)
  }

  function setRegistrationDraft(draft: RegistrationDraft): void {
    registrationDraft.value = draft
  }

  function clearRegistrationDraft(): void {
    registrationDraft.value = undefined
  }

  return {
    token,
    user,
    registrationDraft,
    hydrated,
    loading,
    errorMessage,
    authenticated,
    hydrate,
    setSession,
    login,
    updateUser,
    logout,
    setRegistrationDraft,
    clearRegistrationDraft,
  }
})
