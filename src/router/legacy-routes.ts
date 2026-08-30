import type { RouteRecordRaw } from 'vue-router'

import { legacyRouteManifest } from './legacy-manifest'

const MigrationPendingView = () => import('@/views/MigrationPendingView.vue')
const migratedViews: Partial<Record<string, () => Promise<unknown>>> = {
  brandSpike: () => import('@/views/catalog/CampaignView.vue'),
  chainCatSpike: () => import('@/views/catalog/CampaignView.vue'),
  classify: () => import('@/views/catalog/CategoryView.vue'),
  foundGoodGoods: () => import('@/views/catalog/CampaignView.vue'),
  index: () => import('@/views/home/HomeView.vue'),
  loveShop: () => import('@/views/catalog/CampaignView.vue'),
  newProductLaunch: () => import('@/views/catalog/CampaignView.vue'),
  premiumRanking: () => import('@/views/catalog/CampaignView.vue'),
  product: () => import('@/views/catalog/ProductDetailView.vue'),
  recommend: () => import('@/views/catalog/RecommendationView.vue'),
  search: () => import('@/views/search/SearchView.vue'),
  shopCart: () => import('@/views/cart/CartView.vue'),
  specialSpike: () => import('@/views/catalog/CampaignView.vue'),
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
