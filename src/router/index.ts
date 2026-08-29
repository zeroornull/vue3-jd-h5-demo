import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const migrationPlaceholderRoutes = [
  {
    path: '/',
    name: 'migration-placeholder',
    component: {
      name: 'MigrationPlaceholder',
      render: () => null,
    },
  },
] satisfies RouteRecordRaw[]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: migrationPlaceholderRoutes,
})

export default router
