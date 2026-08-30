export interface Banner {
  id: string
  image: string
  alt: string
  to: string
}

export interface HomeShortcut {
  id: string
  label: string
  icon: string
  to: string
}

export interface ProductSummary {
  id: string
  title: string
  subtitle: string
  image: string
  price: number
  originalPrice?: number
  stock: number
  soldPercentage: number
}

export interface ProductSection {
  id: string
  title: string
  subtitle: string
  products: ProductSummary[]
}

export interface HomeData {
  banners: Banner[]
  shortcuts: HomeShortcut[]
  sections: ProductSection[]
}

export interface HotSearchTerm {
  title: string
  hot: boolean
}

export interface ProductVariant {
  id: string
  label: string
  stock: number
}

export interface CatalogProduct extends ProductSummary {
  categoryId: string
  brand: string
  gallery: string[]
  description: string
  monthlySales: number
  shippingFrom: string
  rating: number
  tags: string[]
  variants: ProductVariant[]
}

export interface CategoryGroup {
  id: string
  title: string
  productIds: string[]
}

export interface CatalogCategory {
  id: string
  name: string
  heroImage: string
  groups: CategoryGroup[]
}

export interface StoreSummary {
  id: string
  name: string
  tagline: string
  logo: string
  heroImage: string
  productImages: string[]
  followers: number
}

export type CampaignKind = 'flash' | 'ranking' | 'new' | 'discovery' | 'shops'

export interface Campaign {
  id: string
  title: string
  subtitle: string
  kind: CampaignKind
  tabs: string[]
  accent: string
  productIds: string[]
  storeIds?: string[]
  countdownMs?: number
}

export interface CatalogData {
  categories: CatalogCategory[]
  products: CatalogProduct[]
  campaigns: Campaign[]
  stores: StoreSummary[]
}
