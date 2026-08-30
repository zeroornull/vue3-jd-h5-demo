import { http } from './http'
import { parseAppeal, parseOrder, parseOrderSnapshot } from './payloads'
import { readApiData } from './types'
import type {
  Appeal,
  CancelOrderInput,
  CreateAppealInput,
  CreateOrderInput,
  Order,
  OrderSnapshot,
  PayOrderInput,
  SupplementAppealInput,
} from '@/types/order'

export type { OrderSnapshot }

export async function getOrderSnapshot(): Promise<OrderSnapshot> {
  return readApiData(http.get<unknown>('/orders'), parseOrderSnapshot)
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  return readApiData(http.post<unknown>('/orders', input), parseOrder)
}

export async function payOrder(orderId: string, input: PayOrderInput): Promise<Order> {
  return readApiData(http.post<unknown>(`/orders/${orderId}/pay`, input), parseOrder)
}

export async function cancelOrder(orderId: string, input: CancelOrderInput): Promise<Order> {
  return readApiData(http.post<unknown>(`/orders/${orderId}/cancel`, input), parseOrder)
}

export async function confirmReceipt(orderId: string): Promise<Order> {
  return readApiData(http.post<unknown>(`/orders/${orderId}/confirm-receipt`), parseOrder)
}

export async function createAppeal(input: CreateAppealInput): Promise<Appeal> {
  return readApiData(http.post<unknown>('/appeals', input), parseAppeal)
}

export async function supplementAppeal(
  appealId: string,
  input: SupplementAppealInput,
): Promise<Appeal> {
  return readApiData(http.post<unknown>(`/appeals/${appealId}/supplement`, input), parseAppeal)
}
