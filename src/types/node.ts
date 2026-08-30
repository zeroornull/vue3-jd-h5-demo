export type NodeKind = 'share' | 'area' | 'city' | 'state' | 'industry' | 'super'

export interface NodeProduct {
  id: NodeKind
  name: string
  title: string
  path: string
  totalShares: number
  remainingShares: number
  unitPrice: number
  currency: 'USDT'
  accent: string
  fields: ReadonlyArray<'country' | 'province' | 'city' | 'district' | 'industry'>
}

export interface NodeApplication {
  id: string
  kind: NodeKind
  kindName: string
  shares: number
  amount: number
  paymentMethod: string
  country?: string
  province?: string
  city?: string
  district?: string
  industry?: string
  createdAt: string
}

export interface ApplyNodeInput {
  kind: NodeKind
  shares: number
  paymentMethod: string
  country?: string
  province?: string
  city?: string
  district?: string
  industry?: string
}

export interface NodeSnapshot {
  products: NodeProduct[]
  applications: NodeApplication[]
}

export const NODE_PAYMENT_METHODS = ['CoinPay', '支付宝', 'Top-Pay'] as const

export const NODE_PROVINCES = ['广东省', '北京市', '浙江省'] as const
export const NODE_CITIES = ['深圳市', '广州市', '杭州市'] as const
export const NODE_DISTRICTS = ['南山区', '宝安区', '朝阳区'] as const
export const NODE_INDUSTRIES = ['互联网', '零售', '制造'] as const
