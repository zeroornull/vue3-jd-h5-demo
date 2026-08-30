import { http } from './http'
import type { ApiResponse } from './types'
import { unwrapApiResponse } from './types'
import type {
  Appeal,
  CancelOrderInput,
  CreateAppealInput,
  CreateOrderInput,
  Order,
  PayOrderInput,
  SupplementAppealInput,
} from '@/types/order'

export interface OrderSnapshot {
  orders: Order[]
  appeals: Appeal[]
}

export async function getOrderSnapshot(): Promise<OrderSnapshot> {
  const response = await http.get<ApiResponse<OrderSnapshot>>('/orders')
  return unwrapApiResponse(response.data)
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const response = await http.post<ApiResponse<Order>>('/orders', input)
  return unwrapApiResponse(response.data)
}

export async function payOrder(orderId: string, input: PayOrderInput): Promise<Order> {
  const response = await http.post<ApiResponse<Order>>(`/orders/${orderId}/pay`, input)
  return unwrapApiResponse(response.data)
}

export async function cancelOrder(orderId: string, input: CancelOrderInput): Promise<Order> {
  const response = await http.post<ApiResponse<Order>>(`/orders/${orderId}/cancel`, input)
  return unwrapApiResponse(response.data)
}

export async function confirmReceipt(orderId: string): Promise<Order> {
  const response = await http.post<ApiResponse<Order>>(`/orders/${orderId}/confirm-receipt`)
  return unwrapApiResponse(response.data)
}

export async function createAppeal(input: CreateAppealInput): Promise<Appeal> {
  const response = await http.post<ApiResponse<Appeal>>('/appeals', input)
  return unwrapApiResponse(response.data)
}

export async function supplementAppeal(
  appealId: string,
  input: SupplementAppealInput,
): Promise<Appeal> {
  const response = await http.post<ApiResponse<Appeal>>(`/appeals/${appealId}/supplement`, input)
  return unwrapApiResponse(response.data)
}
