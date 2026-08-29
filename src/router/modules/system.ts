import type { RouteRecordRaw } from 'vue-router'

const MigrationPendingView = () => import('@/views/MigrationPendingView.vue')
const NotFoundView = () => import('@/views/NotFoundView.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/nopermission',
    name: 'nopermission',
    component: MigrationPendingView,
    meta: {
      migrationStatus: 'pending-view',
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
