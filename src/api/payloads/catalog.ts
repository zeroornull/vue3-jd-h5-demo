import {
  expectArray,
  expectNumber,
  expectOneOf,
  expectRecord,
  expectString,
  expectStringArray,
  optionalNumber,
} from '../types'
import type {
  Campaign,
  CampaignKind,
  CatalogCategory,
  CatalogData,
  CatalogProduct,
  CategoryGroup,
  ProductSummary,
  ProductVariant,
  StoreSummary,
} from '@/types/catalog'

const CAMPAIGN_KINDS = ['flash', 'ranking', 'new', 'discovery', 'shops'] as const satisfies readonly CampaignKind[]

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
