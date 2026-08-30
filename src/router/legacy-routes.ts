import type { RouteRecordRaw } from 'vue-router'

import { legacyRouteManifest } from './legacy-manifest'

const MigrationPendingView = () => import('@/views/MigrationPendingView.vue')
const migratedViews: Partial<Record<string, () => Promise<unknown>>> = {
  index: () => import('@/views/home/HomeView.vue'),
  search: () => import('@/views/search/SearchView.vue'),
  shopCart: () => import('@/views/cart/CartView.vue'),
}

const tabbarRouteNames = new Set(['index', 'classify', 'shopCart', 'mine'])

export function createLegacyRouteRecords(): RouteRecordRaw[] {
  return legacyRouteManifest.map((route) => ({
    path: route.path,
    name: route.name,
    component: migratedViews[route.name] ?? MigrationPendingView,
    meta: {
      migrationStatus: route.status,
      sourceModule: route.sourceModule,
      legacyView: route.legacyView,
      legacyIndex: route.legacyIndex,
      showTabbar: tabbarRouteNames.has(route.name),
    },
  }))
}
