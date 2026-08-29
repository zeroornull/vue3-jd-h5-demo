import type { RouteRecordRaw } from 'vue-router'

import { legacyRouteManifest } from './legacy-manifest'

const MigrationPendingView = () => import('@/views/MigrationPendingView.vue')

export function createLegacyRouteRecords(): RouteRecordRaw[] {
  return legacyRouteManifest.map((route) => ({
    path: route.path,
    name: route.name,
    component: MigrationPendingView,
    meta: {
      migrationStatus: route.status,
      sourceModule: route.sourceModule,
      legacyView: route.legacyView,
      legacyIndex: route.legacyIndex,
    },
  }))
}
