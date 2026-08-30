import type { RouteRecordRaw } from 'vue-router'

import { legacyRouteManifest } from './legacy-manifest'

const MigrationPendingView = () => import('@/views/MigrationPendingView.vue')
const migratedViews: Partial<Record<string, () => Promise<unknown>>> = {
  brandSpike: () => import('@/views/catalog/CampaignView.vue'),
  chainCatSpike: () => import('@/views/catalog/CampaignView.vue'),
  classify: () => import('@/views/catalog/CategoryView.vue'),
  emailRegister: () => import('@/views/auth/RegisterStartView.vue'),
  emailRegisterTwo: () => import('@/views/auth/RegisterCompleteView.vue'),
  forgetPassword: () => import('@/views/auth/ForgotPasswordView.vue'),
  foundGoodGoods: () => import('@/views/catalog/CampaignView.vue'),
  index: () => import('@/views/home/HomeView.vue'),
  loveShop: () => import('@/views/catalog/CampaignView.vue'),
  login: () => import('@/views/auth/LoginView.vue'),
  newProductLaunch: () => import('@/views/catalog/CampaignView.vue'),
  premiumRanking: () => import('@/views/catalog/CampaignView.vue'),
  phoneRegister: () => import('@/views/auth/RegisterStartView.vue'),
  phoneRegisterTwo: () => import('@/views/auth/RegisterCompleteView.vue'),
  product: () => import('@/views/catalog/ProductDetailView.vue'),
  recommend: () => import('@/views/catalog/RecommendationView.vue'),
  search: () => import('@/views/search/SearchView.vue'),
  shopCart: () => import('@/views/cart/CartView.vue'),
  specialSpike: () => import('@/views/catalog/CampaignView.vue'),
}

const tabbarRouteNames = new Set(['index', 'classify', 'shopCart', 'mine'])
const guestRouteNames = new Set([
  'login',
  'emailRegister',
  'emailRegisterTwo',
  'phoneRegister',
  'phoneRegisterTwo',
  'forgetPassword',
])

function isProtectedPath(path: string): boolean {
  return (
    path === '/mine' ||
    path.startsWith('/mine/') ||
    path.startsWith('/order') ||
    path.startsWith('/wallet') ||
    path === '/myFocus'
  )
}

export function createLegacyRouteRecords(): RouteRecordRaw[] {
  return legacyRouteManifest.map((route) => {
    const guestOnly = guestRouteNames.has(route.name)

    return {
      path: route.path,
      name: route.name,
      component: migratedViews[route.name] ?? MigrationPendingView,
      meta: {
        migrationStatus: route.status,
        sourceModule: route.sourceModule,
        legacyView: route.legacyView,
        legacyIndex: route.legacyIndex,
        showTabbar: tabbarRouteNames.has(route.name),
        guestOnly,
        requiresAuth: !guestOnly && isProtectedPath(route.path),
      },
    }
  })
}
