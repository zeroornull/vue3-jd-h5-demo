import {
  expectArray,
  expectBoolean,
  expectNumber,
  expectRecord,
  expectString,
  optionalNumber,
} from '../types'
import type { Banner, HomeData, HomeShortcut, HotSearchTerm, ProductSection, ProductSummary } from '@/types/catalog'

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
