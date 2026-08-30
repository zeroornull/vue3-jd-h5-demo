export type OrderStatus =
  | 'unpaid'
  | 'cancelled'
  | 'paid'
  | 'to_ship'
  | 'to_receive'
  | 'completed'

export type OrderTab = 'all' | OrderStatus

export interface OrderAddress {
  receiver: string
  phone: string
  detail: string
}

export interface OrderItem {
  productId: string
  title: string
  spec: string
  image: string
  price: number
  quantity: number
}

export interface LogisticsEvent {
  time: string
  title: string
  description: string
}

export interface OrderLogistics {
  trackingNumber: string
  from: string
  to: string
  pieceCount: number
  statusLabel: string
  events: LogisticsEvent[]
}

export interface Order {
  id: string
  number: string
  paymentNumber?: string
  status: OrderStatus
  storeId: string
  storeName: string
  storeLogo: string
  items: OrderItem[]
  payable: number
  paymentMethod?: string
  createdAt: string
  paidAt?: string
  cancelledAt?: string
  cancelReason?: string
  address: OrderAddress
  logistics?: OrderLogistics
}

export type AppealStatus = 'open' | 'supplemented'

export interface Appeal {
  id: string
  orderId: string
  contactName: string
  contactPhone: string
  content: string
  images: string[]
  createdAt: string
  status: AppealStatus
}

export interface CreateOrderInput {
  items: Array<{
    productId: string
    quantity: number
    spec?: string
  }>
  paymentMethod?: string
}

export interface PayOrderInput {
  paymentMethod: string
}

export interface CancelOrderInput {
  reason: string
  note?: string
}

export interface CreateAppealInput {
  orderId: string
  contactName: string
  contactPhone: string
  content: string
  images: string[]
}

export interface SupplementAppealInput {
  content: string
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  unpaid: '待支付',
  cancelled: '已取消',
  paid: '已支付',
  to_ship: '待发货',
  to_receive: '待收货',
  completed: '已完成',
}

export const ORDER_TABS: ReadonlyArray<{ id: OrderTab; label: string }> = [
  { id: 'all', label: '全部' },
  { id: 'cancelled', label: '已取消' },
  { id: 'unpaid', label: '待支付' },
  { id: 'to_ship', label: '待发货' },
  { id: 'paid', label: '已支付' },
  { id: 'completed', label: '已完成' },
  { id: 'to_receive', label: '待收货' },
]

export const CANCEL_REASONS = [
  { id: 'changed-mind', label: '想了想，我不想要了' },
  { id: 'wrong-item', label: '买多了/买错了' },
  { id: 'payment-issue', label: '支付遇到问题' },
  { id: 'wrong-address', label: '地址填写错误' },
  { id: 'other', label: '其他原因' },
] as const

export const PAYMENT_METHODS = ['Top-Pay', '支付宝', '微信支付', '银行卡'] as const

export function orderItemCount(items: readonly OrderItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0)
}

export function orderGoodsTotal(items: readonly OrderItem[]): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0)
}

export function orderDetailPath(order: Pick<Order, 'id' | 'status'>): string {
  if (order.status === 'to_ship') {
    return `/order/toBeDelivered?id=${order.id}`
  }

  if (order.status === 'to_receive') {
    return `/order/pendingReceipt?id=${order.id}`
  }

  return `/order/orderDetail?id=${order.id}`
}
