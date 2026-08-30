import type { RouteRecordRaw } from 'vue-router'

import { legacyRouteManifest } from './legacy-manifest'

const MigrationPendingView = () => import('@/views/MigrationPendingView.vue')
const migratedViews: Partial<Record<string, () => Promise<unknown>>> = {
  aboutAs: () => import('@/views/mine/AboutView.vue'),
  addAddress: () => import('@/views/mine/AddressFormView.vue'),
  advertisementPool: () => import('@/views/wallet/PoolView.vue'),
  appeal: () => import('@/views/order/AppealFormView.vue'),
  appealDetail: () => import('@/views/order/AppealDetailView.vue'),
  appealRecord: () => import('@/views/order/AppealRecordView.vue'),
  balanceWallet: () => import('@/views/wallet/WalletLedgerView.vue'),
  brandSpike: () => import('@/views/catalog/CampaignView.vue'),
  cancelOrder: () => import('@/views/order/CancelOrderView.vue'),
  changePassword: () => import('@/views/mine/ChangePasswordView.vue'),
  chainCatSpike: () => import('@/views/catalog/CampaignView.vue'),
  consumerWallet: () => import('@/views/wallet/WalletLedgerView.vue'),
  consumptionPool: () => import('@/views/wallet/PoolView.vue'),
  countryRegion: () => import('@/views/mine/CountryRegionView.vue'),
  classify: () => import('@/views/catalog/CategoryView.vue'),
  emailRegister: () => import('@/views/auth/RegisterStartView.vue'),
  emailRegisterTwo: () => import('@/views/auth/RegisterCompleteView.vue'),
  feedback: () => import('@/views/mine/FeedbackView.vue'),
  forgetPassword: () => import('@/views/auth/ForgotPasswordView.vue'),
  foundGoodGoods: () => import('@/views/catalog/CampaignView.vue'),
  helpCenter: () => import('@/views/mine/HelpCenterView.vue'),
  home: () => import('@/views/order/OrderDetailView.vue'),
  index: () => import('@/views/home/HomeView.vue'),
  loveShop: () => import('@/views/catalog/CampaignView.vue'),
  login: () => import('@/views/auth/LoginView.vue'),
  messageCenter: () => import('@/views/mine/MessageCenterView.vue'),
  mine: () => import('@/views/mine/MineView.vue'),
  myWallet: () => import('@/views/wallet/WalletHomeView.vue'),
  newProductLaunch: () => import('@/views/catalog/CampaignView.vue'),
  nodePool: () => import('@/views/wallet/PoolView.vue'),
  order: () => import('@/views/order/OrderListView.vue'),
  personInfo: () => import('@/views/mine/ProfileView.vue'),
  phoneNumberSetting: () => import('@/views/mine/ContactSettingView.vue'),
  pendingReceipt: () => import('@/views/order/OrderDetailView.vue'),
  premiumRanking: () => import('@/views/catalog/CampaignView.vue'),
  phoneRegister: () => import('@/views/auth/RegisterStartView.vue'),
  phoneRegisterTwo: () => import('@/views/auth/RegisterCompleteView.vue'),
  product: () => import('@/views/catalog/ProductDetailView.vue'),
  recommend: () => import('@/views/catalog/RecommendationView.vue'),
  search: () => import('@/views/search/SearchView.vue'),
  setting: () => import('@/views/mine/SettingsView.vue'),
  settingMail: () => import('@/views/mine/ContactSettingView.vue'),
  shippingAddress: () => import('@/views/mine/AddressListView.vue'),
  shopCart: () => import('@/views/cart/CartView.vue'),
  specialSpike: () => import('@/views/catalog/CampaignView.vue'),
  toBeDelivered: () => import('@/views/order/OrderDetailView.vue'),
  transactionDetails: () => import('@/views/order/TransactionDetailsView.vue'),
  viewLogistics: () => import('@/views/order/LogisticsView.vue'),
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
    path.startsWith('/pool') ||
    path.startsWith('/setting') ||
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
