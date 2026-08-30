import type { RouteRecordRaw } from 'vue-router'

const NoPermissionView = () => import('@/views/NoPermissionView.vue')
const NotFoundView = () => import('@/views/NotFoundView.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/nopermission',
    name: 'nopermission',
    component: NoPermissionView,
    meta: {
      migrationStatus: 'system',
      sourceModule: 'src/router/index.js',
      legacyView: '@/views/error/NoPermission',
      legacyIndex: 1,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
    meta: {
      migrationStatus: 'system',
    },
  },
]

export default routes
