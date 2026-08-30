import { createRouter, createWebHistory } from 'vue-router'

import { routes } from './routes'
import { installAuthGuards } from './auth-guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

installAuthGuards(router)

export default router
