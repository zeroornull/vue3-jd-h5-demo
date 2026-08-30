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
