import type { Router } from 'vue-router'

import { setUnauthorizedHandler } from '@/api/http'
import { useAuthStore } from '@/stores/auth'
import { safeRedirectPath } from '@/utils/auth-validation'

export function createUnauthorizedHandler(router: Router): () => Promise<void> {
  return async () => {
    const authStore = useAuthStore()
    authStore.logout()

    const current = router.currentRoute.value

    if (current.meta.guestOnly || current.name === 'login') {
      return
    }

    await router.replace({
      name: 'login',
      query: { redirect: safeRedirectPath(current.fullPath) },
    })
  }
}

export function installUnauthorizedRedirect(router: Router): void {
  setUnauthorizedHandler(createUnauthorizedHandler(router))
}
