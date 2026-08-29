import { RouterView } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

import { createLegacyRouteRecords } from '../legacy-routes'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'legacy-root',
    component: RouterView,
    redirect: '/index',
    meta: {
      migrationStatus: 'system',
      sourceModule: 'src/router/index.js',
      legacyView: '@/views/index',
    },
    children: createLegacyRouteRecords(),
  },
]

export default routes
