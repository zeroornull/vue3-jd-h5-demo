import { createMemoryHistory, createRouter } from 'vue-router'
import { describe, expect, it } from 'vitest'

import {
  LEGACY_ROUTE_MODULE_COUNT,
  LEGACY_ROUTE_RECORD_COUNT,
  legacyRouteManifest,
} from '../legacy-manifest'
import { routes } from '../routes'

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes,
  })
}

describe('legacy route manifest', () => {
  it('accounts for every legacy module and exported route record', () => {
    expect(LEGACY_ROUTE_MODULE_COUNT).toBe(53)
    expect(LEGACY_ROUTE_RECORD_COUNT).toBe(56)
    expect(new Set(legacyRouteManifest.map((route) => route.sourceModule)).size).toBe(53)
    expect(new Set(legacyRouteManifest.map((route) => route.path)).size).toBe(56)
    expect(new Set(legacyRouteManifest.map((route) => route.name)).size).toBe(56)
    expect(legacyRouteManifest.filter((route) => route.status === 'migrated')).toHaveLength(42)
    expect(legacyRouteManifest.filter((route) => route.status === 'pending-view')).toHaveLength(14)
  })

  it('records known legacy anomalies without silently renaming contracts', () => {
    expect(legacyRouteManifest.find((route) => route.sourceModule === 'recommend')).toMatchObject({
      legacyPath: 'classify/recommend',
      path: '/classify/recommend',
    })
    expect(legacyRouteManifest.find((route) => route.sourceModule === 'orderDetail')).toMatchObject(
      {
        path: '/order/orderDetail',
        name: 'home',
      },
    )
  })

  it('marks migrated business routes including the profile subdomain', () => {
    const migratedNames = legacyRouteManifest
      .filter((route) => route.status === 'migrated')
      .map((route) => route.name)
      .sort()

    expect(migratedNames).toEqual(
      [
        'aboutAs',
        'addAddress',
        'appeal',
        'appealDetail',
        'appealRecord',
        'brandSpike',
        'cancelOrder',
        'changePassword',
        'chainCatSpike',
        'classify',
        'countryRegion',
        'emailRegister',
        'emailRegisterTwo',
        'feedback',
        'forgetPassword',
        'foundGoodGoods',
        'helpCenter',
        'home',
        'index',
        'loveShop',
        'login',
        'messageCenter',
        'mine',
        'newProductLaunch',
        'order',
        'pendingReceipt',
        'personInfo',
        'phoneNumberSetting',
        'phoneRegister',
        'phoneRegisterTwo',
        'premiumRanking',
        'product',
        'recommend',
        'search',
        'setting',
        'settingMail',
        'shippingAddress',
        'shopCart',
        'specialSpike',
        'toBeDelivered',
        'transactionDetails',
        'viewLogistics',
      ].sort(),
    )
  })
})

describe('router contract', () => {
  it('redirects the legacy root to /index', async () => {
    const router = createTestRouter()

    await router.push('/')
    await router.isReady()

    expect(router.currentRoute.value.fullPath).toBe('/index')
    expect(router.currentRoute.value.name).toBe('index')
  })

  it('resolves every legacy URL with its current migration status', () => {
    const router = createTestRouter()

    expect(router.getRoutes()).toHaveLength(LEGACY_ROUTE_RECORD_COUNT + 3)
    expect(router.hasRoute('migration-placeholder')).toBe(false)

    for (const legacyRoute of legacyRouteManifest) {
      const resolved = router.resolve(legacyRoute.path)

      expect(resolved.name).toBe(legacyRoute.name)
      expect(resolved.meta).toMatchObject({
        migrationStatus: legacyRoute.status,
        sourceModule: legacyRoute.sourceModule,
        legacyView: legacyRoute.legacyView,
        legacyIndex: legacyRoute.legacyIndex,
      })
    }
  })

  it('uses the modern catch-all route for unknown URLs', () => {
    const router = createTestRouter()
    const resolved = router.resolve('/missing/deep/path')

    expect(resolved.name).toBe('not-found')
    expect(resolved.params.pathMatch).toEqual(['missing', 'deep', 'path'])
  })

  it('types guest-only and protected route boundaries', () => {
    const router = createTestRouter()

    expect(router.resolve('/login').meta).toMatchObject({
      guestOnly: true,
      requiresAuth: false,
    })
    expect(router.resolve('/mine/forgetPassword').meta).toMatchObject({
      guestOnly: true,
      requiresAuth: false,
    })
    expect(router.resolve('/order').meta).toMatchObject({
      guestOnly: false,
      requiresAuth: true,
    })
    expect(router.resolve('/mine').meta).toMatchObject({
      guestOnly: false,
      requiresAuth: true,
    })
    expect(router.resolve('/setting/aboutAs').meta).toMatchObject({
      requiresAuth: true,
    })
  })
})
