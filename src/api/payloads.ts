import {
  expectArray,
  expectBoolean,
  expectNumber,
  expectOneOf,
  expectRecord,
  expectString,
  expectStringArray,
  optionalNumber,
  optionalString,
} from './types'
import type {
  Banner,
  Campaign,
  CampaignKind,
  CatalogCategory,
  CatalogData,
  CatalogProduct,
  CategoryGroup,
  HomeData,
  HomeShortcut,
  HotSearchTerm,
  ProductSection,
  ProductSummary,
  ProductVariant,
  StoreSummary,
} from '@/types/catalog'
import type { AuthSession, AuthUser, SendVerificationCodeResult } from '@/types/auth'
import type {
  Appeal,
  AppealStatus,
  LogisticsEvent,
  Order,
  OrderAddress,
  OrderItem,
  OrderLogistics,
  OrderSnapshot,
  OrderStatus,
} from '@/types/order'
import type {
  AddressGender,
  AddressTag,
  HelpTopic,
  InboxMessage,
  MessageKind,
  ProfileSettings,
  ProfileSnapshot,
  ShippingAddress,
  UserProfile,
} from '@/types/profile'
import type {
  LedgerEntry,
  LedgerKind,
  MiningPool,
  PoolId,
  PoolReward,
  ProfitShare,
  WalletAccount,
  WalletAccountId,
  WalletSnapshot,
} from '@/types/wallet'
import type { NodeApplication, NodeKind, NodeProduct, NodeSnapshot } from '@/types/node'
import type { FocusSnapshot, ToggleFocusResult } from '@/types/focus'

const CAMPAIGN_KINDS = ['flash', 'ranking', 'new', 'discovery', 'shops'] as const satisfies readonly CampaignKind[]
const ORDER_STATUSES = [
  'unpaid',
  'cancelled',
  'paid',
  'to_ship',
  'to_receive',
  'completed',
] as const satisfies readonly OrderStatus[]
const APPEAL_STATUSES = ['open', 'supplemented'] as const satisfies readonly AppealStatus[]
const ADDRESS_TAGS = ['home', 'company', 'school'] as const satisfies readonly AddressTag[]
const ADDRESS_GENDERS = ['female', 'male'] as const satisfies readonly AddressGender[]
const MESSAGE_KINDS = ['feedback', 'order'] as const satisfies readonly MessageKind[]
const WALLET_ACCOUNT_IDS = ['consumer', 'balance'] as const satisfies readonly WalletAccountId[]
const POOL_IDS = ['consumption', 'advertisement', 'node'] as const satisfies readonly PoolId[]
const LEDGER_KINDS = ['deposit', 'pool-release', 'claim'] as const satisfies readonly LedgerKind[]
const NODE_KINDS = ['share', 'area', 'city', 'state', 'industry', 'super'] as const satisfies readonly NodeKind[]
const NODE_FIELDS = ['country', 'province', 'city', 'district', 'industry'] as const
function parseAuthUser(value: unknown): AuthUser {
  const record = expectRecord(value, 'user')
  return {
    id: expectString(record.id, 'user.id'),
    identifier: expectString(record.identifier, 'user.identifier'),
    displayName: expectString(record.displayName, 'user.displayName'),
  }
}

export function parseAuthSession(value: unknown): AuthSession {
  const record = expectRecord(value, 'session')
  return {
    token: expectString(record.token, 'token'),
    user: parseAuthUser(record.user),
  }
}

export function parseVerificationResult(value: unknown): SendVerificationCodeResult {
  const record = expectRecord(value, 'verification')
  return {
    expiresInSeconds: expectNumber(record.expiresInSeconds, 'expiresInSeconds'),
    developmentCode: optionalString(record.developmentCode, 'developmentCode'),
  }
}

export function parseIdentifier(value: unknown): { identifier: string } {
  const record = expectRecord(value, 'identifier')
  return { identifier: expectString(record.identifier, 'identifier') }
}

function parseProductSummary(value: unknown): ProductSummary {
  const record = expectRecord(value, 'product')
  return {
    id: expectString(record.id, 'product.id'),
    title: expectString(record.title, 'product.title'),
    subtitle: expectString(record.subtitle, 'product.subtitle'),
    image: expectString(record.image, 'product.image'),
    price: expectNumber(record.price, 'product.price'),
    originalPrice: optionalNumber(record.originalPrice, 'product.originalPrice'),
    stock: expectNumber(record.stock, 'product.stock'),
    soldPercentage: expectNumber(record.soldPercentage, 'product.soldPercentage'),
  }
}

function parseVariant(value: unknown): ProductVariant {
  const record = expectRecord(value, 'variant')
  return {
    id: expectString(record.id, 'variant.id'),
    label: expectString(record.label, 'variant.label'),
    stock: expectNumber(record.stock, 'variant.stock'),
  }
}

function parseCatalogProduct(value: unknown): CatalogProduct {
  const summary = parseProductSummary(value)
  const record = expectRecord(value, 'product')
  return {
    ...summary,
    categoryId: expectString(record.categoryId, 'product.categoryId'),
    brand: expectString(record.brand, 'product.brand'),
    gallery: expectStringArray(record.gallery, 'product.gallery'),
    description: expectString(record.description, 'product.description'),
    monthlySales: expectNumber(record.monthlySales, 'product.monthlySales'),
    shippingFrom: expectString(record.shippingFrom, 'product.shippingFrom'),
    rating: expectNumber(record.rating, 'product.rating'),
    tags: expectStringArray(record.tags, 'product.tags'),
    variants: expectArray(record.variants, parseVariant, 'product.variants'),
  }
}

function parseCategoryGroup(value: unknown): CategoryGroup {
  const record = expectRecord(value, 'group')
  return {
    id: expectString(record.id, 'group.id'),
    title: expectString(record.title, 'group.title'),
    productIds: expectStringArray(record.productIds, 'group.productIds'),
  }
}

function parseCategory(value: unknown): CatalogCategory {
  const record = expectRecord(value, 'category')
  return {
    id: expectString(record.id, 'category.id'),
    name: expectString(record.name, 'category.name'),
    heroImage: expectString(record.heroImage, 'category.heroImage'),
    groups: expectArray(record.groups, parseCategoryGroup, 'category.groups'),
  }
}

function parseStore(value: unknown): StoreSummary {
  const record = expectRecord(value, 'store')
  return {
    id: expectString(record.id, 'store.id'),
    name: expectString(record.name, 'store.name'),
    tagline: expectString(record.tagline, 'store.tagline'),
    description: expectString(record.description, 'store.description'),
    phone: expectString(record.phone, 'store.phone'),
    address: expectString(record.address, 'store.address'),
    logo: expectString(record.logo, 'store.logo'),
    heroImage: expectString(record.heroImage, 'store.heroImage'),
    productImages: expectStringArray(record.productImages, 'store.productImages'),
    productIds: expectStringArray(record.productIds, 'store.productIds'),
    followers: expectNumber(record.followers, 'store.followers'),
  }
}

function parseCampaign(value: unknown): Campaign {
  const record = expectRecord(value, 'campaign')
  return {
    id: expectString(record.id, 'campaign.id'),
    title: expectString(record.title, 'campaign.title'),
    subtitle: expectString(record.subtitle, 'campaign.subtitle'),
    kind: expectOneOf(record.kind, CAMPAIGN_KINDS, 'campaign.kind'),
    tabs: expectStringArray(record.tabs, 'campaign.tabs'),
    accent: expectString(record.accent, 'campaign.accent'),
    productIds: expectStringArray(record.productIds, 'campaign.productIds'),
    storeIds:
      record.storeIds === undefined ? undefined : expectStringArray(record.storeIds, 'campaign.storeIds'),
    countdownMs: optionalNumber(record.countdownMs, 'campaign.countdownMs'),
  }
}

export function parseCatalogData(value: unknown): CatalogData {
  const record = expectRecord(value, 'catalog')
  return {
    categories: expectArray(record.categories, parseCategory, 'categories'),
    products: expectArray(record.products, parseCatalogProduct, 'products'),
    campaigns: expectArray(record.campaigns, parseCampaign, 'campaigns'),
    stores: expectArray(record.stores, parseStore, 'stores'),
  }
}

function parseBanner(value: unknown): Banner {
  const record = expectRecord(value, 'banner')
  return {
    id: expectString(record.id, 'banner.id'),
    image: expectString(record.image, 'banner.image'),
    alt: expectString(record.alt, 'banner.alt'),
    to: expectString(record.to, 'banner.to'),
  }
}

function parseShortcut(value: unknown): HomeShortcut {
  const record = expectRecord(value, 'shortcut')
  return {
    id: expectString(record.id, 'shortcut.id'),
    label: expectString(record.label, 'shortcut.label'),
    icon: expectString(record.icon, 'shortcut.icon'),
    to: expectString(record.to, 'shortcut.to'),
  }
}

function parseSection(value: unknown): ProductSection {
  const record = expectRecord(value, 'section')
  return {
    id: expectString(record.id, 'section.id'),
    title: expectString(record.title, 'section.title'),
    subtitle: expectString(record.subtitle, 'section.subtitle'),
    products: expectArray(record.products, parseProductSummary, 'section.products'),
  }
}

export function parseHomeData(value: unknown): HomeData {
  const record = expectRecord(value, 'home')
  return {
    banners: expectArray(record.banners, parseBanner, 'banners'),
    shortcuts: expectArray(record.shortcuts, parseShortcut, 'shortcuts'),
    sections: expectArray(record.sections, parseSection, 'sections'),
  }
}

export function parseHotSearchTerms(value: unknown): HotSearchTerm[] {
  return expectArray(
    value,
    (item) => {
      const record = expectRecord(item, 'hotTerm')
      return {
        title: expectString(record.title, 'hotTerm.title'),
        hot: expectBoolean(record.hot, 'hotTerm.hot'),
      }
    },
    'hotTerms',
  )
}

function parseOrderAddress(value: unknown): OrderAddress {
  const record = expectRecord(value, 'address')
  return {
    receiver: expectString(record.receiver, 'address.receiver'),
    phone: expectString(record.phone, 'address.phone'),
    detail: expectString(record.detail, 'address.detail'),
  }
}

function parseOrderItem(value: unknown): OrderItem {
  const record = expectRecord(value, 'item')
  return {
    productId: expectString(record.productId, 'item.productId'),
    title: expectString(record.title, 'item.title'),
    spec: expectString(record.spec, 'item.spec'),
    image: expectString(record.image, 'item.image'),
    price: expectNumber(record.price, 'item.price'),
    quantity: expectNumber(record.quantity, 'item.quantity'),
  }
}

function parseLogisticsEvent(value: unknown): LogisticsEvent {
  const record = expectRecord(value, 'event')
  return {
    time: expectString(record.time, 'event.time'),
    title: expectString(record.title, 'event.title'),
    description: expectString(record.description, 'event.description'),
  }
}

function parseLogistics(value: unknown): OrderLogistics | undefined {
  if (value === undefined) {
    return undefined
  }

  const record = expectRecord(value, 'logistics')
  return {
    trackingNumber: expectString(record.trackingNumber, 'logistics.trackingNumber'),
    from: expectString(record.from, 'logistics.from'),
    to: expectString(record.to, 'logistics.to'),
    pieceCount: expectNumber(record.pieceCount, 'logistics.pieceCount'),
    statusLabel: expectString(record.statusLabel, 'logistics.statusLabel'),
    events: expectArray(record.events, parseLogisticsEvent, 'logistics.events'),
  }
}

export function parseOrder(value: unknown): Order {
  const record = expectRecord(value, 'order')
  return {
    id: expectString(record.id, 'order.id'),
    number: expectString(record.number, 'order.number'),
    paymentNumber: optionalString(record.paymentNumber, 'order.paymentNumber'),
    status: expectOneOf(record.status, ORDER_STATUSES, 'order.status'),
    storeId: expectString(record.storeId, 'order.storeId'),
    storeName: expectString(record.storeName, 'order.storeName'),
    storeLogo: expectString(record.storeLogo, 'order.storeLogo'),
    items: expectArray(record.items, parseOrderItem, 'order.items'),
    payable: expectNumber(record.payable, 'order.payable'),
    paymentMethod: optionalString(record.paymentMethod, 'order.paymentMethod'),
    createdAt: expectString(record.createdAt, 'order.createdAt'),
    paidAt: optionalString(record.paidAt, 'order.paidAt'),
    cancelledAt: optionalString(record.cancelledAt, 'order.cancelledAt'),
    cancelReason: optionalString(record.cancelReason, 'order.cancelReason'),
    address: parseOrderAddress(record.address),
    logistics: parseLogistics(record.logistics),
  }
}

export function parseAppeal(value: unknown): Appeal {
  const record = expectRecord(value, 'appeal')
  return {
    id: expectString(record.id, 'appeal.id'),
    orderId: expectString(record.orderId, 'appeal.orderId'),
    contactName: expectString(record.contactName, 'appeal.contactName'),
    contactPhone: expectString(record.contactPhone, 'appeal.contactPhone'),
    content: expectString(record.content, 'appeal.content'),
    images: expectStringArray(record.images, 'appeal.images'),
    createdAt: expectString(record.createdAt, 'appeal.createdAt'),
    status: expectOneOf(record.status, APPEAL_STATUSES, 'appeal.status'),
  }
}

export function parseOrderSnapshot(value: unknown): OrderSnapshot {
  const record = expectRecord(value, 'orders')
  return {
    orders: expectArray(record.orders, parseOrder, 'orders'),
    appeals: expectArray(record.appeals, parseAppeal, 'appeals'),
  }
}

export function parseUserProfile(value: unknown): UserProfile {
  const record = expectRecord(value, 'profile')
  return {
    displayName: expectString(record.displayName, 'profile.displayName'),
    phone: expectString(record.phone, 'profile.phone'),
    email: expectString(record.email, 'profile.email'),
    avatar: expectString(record.avatar, 'profile.avatar'),
    region: expectString(record.region, 'profile.region'),
    productFollows: expectNumber(record.productFollows, 'profile.productFollows'),
    storeFollows: expectNumber(record.storeFollows, 'profile.storeFollows'),
    footprints: expectNumber(record.footprints, 'profile.footprints'),
  }
}

export function parseShippingAddress(value: unknown): ShippingAddress {
  const record = expectRecord(value, 'address')
  return {
    id: expectString(record.id, 'address.id'),
    name: expectString(record.name, 'address.name'),
    phone: expectString(record.phone, 'address.phone'),
    gender: expectOneOf(record.gender, ADDRESS_GENDERS, 'address.gender'),
    region: expectString(record.region, 'address.region'),
    detail: expectString(record.detail, 'address.detail'),
    tag: expectOneOf(record.tag, ADDRESS_TAGS, 'address.tag'),
    isDefault: expectBoolean(record.isDefault, 'address.isDefault'),
  }
}

export function parseInboxMessage(value: unknown): InboxMessage {
  const record = expectRecord(value, 'message')
  return {
    id: expectString(record.id, 'message.id'),
    kind: expectOneOf(record.kind, MESSAGE_KINDS, 'message.kind'),
    title: expectString(record.title, 'message.title'),
    body: expectString(record.body, 'message.body'),
    createdAt: expectString(record.createdAt, 'message.createdAt'),
  }
}

function parseHelpTopic(value: unknown): HelpTopic {
  const record = expectRecord(value, 'help')
  return {
    id: expectString(record.id, 'help.id'),
    title: expectString(record.title, 'help.title'),
    articles: expectStringArray(record.articles, 'help.articles'),
  }
}

export function parseProfileSettings(value: unknown): ProfileSettings {
  const record = expectRecord(value, 'settings')
  return {
    notifications: expectBoolean(record.notifications, 'settings.notifications'),
  }
}

export function parseProfileSnapshot(value: unknown): ProfileSnapshot {
  const record = expectRecord(value, 'profileSnapshot')
  return {
    profile: parseUserProfile(record.profile),
    addresses: expectArray(record.addresses, parseShippingAddress, 'addresses'),
    messages: expectArray(record.messages, parseInboxMessage, 'messages'),
    helpTopics: expectArray(record.helpTopics, parseHelpTopic, 'helpTopics'),
    settings: parseProfileSettings(record.settings),
  }
}

function parseWalletAccount(value: unknown): WalletAccount {
  const record = expectRecord(value, 'account')
  return {
    id: expectOneOf(record.id, WALLET_ACCOUNT_IDS, 'account.id'),
    name: expectString(record.name, 'account.name'),
    cm: expectNumber(record.cm, 'account.cm'),
    cny: expectNumber(record.cny, 'account.cny'),
  }
}

function parsePool(value: unknown): MiningPool {
  const record = expectRecord(value, 'pool')
  return {
    id: expectOneOf(record.id, POOL_IDS, 'pool.id'),
    name: expectString(record.name, 'pool.name'),
    amount: expectNumber(record.amount, 'pool.amount'),
    hashpower: expectNumber(record.hashpower, 'pool.hashpower'),
    accent: expectString(record.accent, 'pool.accent'),
    path: expectString(record.path, 'pool.path'),
  }
}

function parseProfit(value: unknown): ProfitShare {
  const record = expectRecord(value, 'profit')
  return {
    id: expectString(record.id, 'profit.id'),
    label: expectString(record.label, 'profit.label'),
    cm: expectNumber(record.cm, 'profit.cm'),
    color: expectString(record.color, 'profit.color'),
  }
}

export function parseLedgerEntry(value: unknown): LedgerEntry {
  const record = expectRecord(value, 'ledger')
  return {
    id: expectString(record.id, 'ledger.id'),
    accountId: expectOneOf(record.accountId, WALLET_ACCOUNT_IDS, 'ledger.accountId'),
    time: expectString(record.time, 'ledger.time'),
    month: expectString(record.month, 'ledger.month'),
    status: expectOneOf(record.status, ['completed'] as const, 'ledger.status'),
    kind: expectOneOf(record.kind, LEDGER_KINDS, 'ledger.kind'),
    kindLabel: expectString(record.kindLabel, 'ledger.kindLabel'),
    orderNo: expectString(record.orderNo, 'ledger.orderNo'),
    amount: expectNumber(record.amount, 'ledger.amount'),
    txId: expectString(record.txId, 'ledger.txId'),
  }
}

function parseReward(value: unknown): PoolReward {
  const record = expectRecord(value, 'reward')
  return {
    id: expectString(record.id, 'reward.id'),
    poolId: expectOneOf(record.poolId, POOL_IDS, 'reward.poolId'),
    date: expectString(record.date, 'reward.date'),
    title: expectString(record.title, 'reward.title'),
    tag: expectString(record.tag, 'reward.tag'),
    amount: expectNumber(record.amount, 'reward.amount'),
    unit: expectString(record.unit, 'reward.unit'),
  }
}

export function parseWalletSnapshot(value: unknown): WalletSnapshot {
  const record = expectRecord(value, 'wallet')
  return {
    accounts: expectArray(record.accounts, parseWalletAccount, 'accounts'),
    pools: expectArray(record.pools, parsePool, 'pools'),
    profits: expectArray(record.profits, parseProfit, 'profits'),
    ledgers: expectArray(record.ledgers, parseLedgerEntry, 'ledgers'),
    rewards: expectArray(record.rewards, parseReward, 'rewards'),
  }
}

function parseNodeProduct(value: unknown): NodeProduct {
  const record = expectRecord(value, 'nodeProduct')
  return {
    id: expectOneOf(record.id, NODE_KINDS, 'nodeProduct.id'),
    name: expectString(record.name, 'nodeProduct.name'),
    title: expectString(record.title, 'nodeProduct.title'),
    path: expectString(record.path, 'nodeProduct.path'),
    totalShares: expectNumber(record.totalShares, 'nodeProduct.totalShares'),
    remainingShares: expectNumber(record.remainingShares, 'nodeProduct.remainingShares'),
    unitPrice: expectNumber(record.unitPrice, 'nodeProduct.unitPrice'),
    currency: expectOneOf(record.currency, ['USDT'] as const, 'nodeProduct.currency'),
    accent: expectString(record.accent, 'nodeProduct.accent'),
    fields: expectArray(
      record.fields,
      (item) => expectOneOf(item, NODE_FIELDS, 'nodeProduct.fields'),
      'nodeProduct.fields',
    ),
  }
}

export function parseNodeApplication(value: unknown): NodeApplication {
  const record = expectRecord(value, 'nodeApplication')
  return {
    id: expectString(record.id, 'nodeApplication.id'),
    kind: expectOneOf(record.kind, NODE_KINDS, 'nodeApplication.kind'),
    kindName: expectString(record.kindName, 'nodeApplication.kindName'),
    shares: expectNumber(record.shares, 'nodeApplication.shares'),
    amount: expectNumber(record.amount, 'nodeApplication.amount'),
    paymentMethod: expectString(record.paymentMethod, 'nodeApplication.paymentMethod'),
    country: optionalString(record.country, 'nodeApplication.country'),
    province: optionalString(record.province, 'nodeApplication.province'),
    city: optionalString(record.city, 'nodeApplication.city'),
    district: optionalString(record.district, 'nodeApplication.district'),
    industry: optionalString(record.industry, 'nodeApplication.industry'),
    createdAt: expectString(record.createdAt, 'nodeApplication.createdAt'),
  }
}

export function parseNodeSnapshot(value: unknown): NodeSnapshot {
  const record = expectRecord(value, 'nodes')
  return {
    products: expectArray(record.products, parseNodeProduct, 'products'),
    applications: expectArray(record.applications, parseNodeApplication, 'applications'),
  }
}

export function parseFocusSnapshot(value: unknown): FocusSnapshot {
  const record = expectRecord(value, 'focus')
  return {
    productIds: expectStringArray(record.productIds, 'focus.productIds'),
    storeIds: expectStringArray(record.storeIds, 'focus.storeIds'),
  }
}

export function parseToggleFocusResult(value: unknown): ToggleFocusResult {
  const snapshot = parseFocusSnapshot(value)
  const record = expectRecord(value, 'focus')
  return {
    ...snapshot,
    followed: expectBoolean(record.followed, 'focus.followed'),
  }
}
