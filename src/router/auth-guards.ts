import type { Router } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import { safeRedirectPath } from '@/utils/auth-validation'

export function installAuthGuards(router: Router): void {
  router.beforeEach((to) => {
    if (!to.meta.requiresAuth && !to.meta.guestOnly) {
      return true
    }

    const authStore = useAuthStore()
    authStore.hydrate()

    if (to.meta.requiresAuth && !authStore.authenticated) {
      return {
        name: 'login',
        query: { redirect: to.fullPath },
      }
    }

    if (to.meta.guestOnly && authStore.authenticated) {
      return safeRedirectPath(to.query.redirect)
    }

    return true
  })
}
