import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import {
  cancelOrder as cancelOrderRequest,
  confirmReceipt as confirmReceiptRequest,
  createAppeal as createAppealRequest,
  createOrder as createOrderRequest,
  getOrderSnapshot,
  payOrder as payOrderRequest,
  supplementAppeal as supplementAppealRequest,
} from '@/api/order'
import type {
  Appeal,
  CancelOrderInput,
  CreateAppealInput,
  CreateOrderInput,
  Order,
  OrderStatus,
  OrderTab,
  PayOrderInput,
  SupplementAppealInput,
} from '@/types/order'

function replaceById<T extends { id: string }>(items: T[], next: T): T[] {
  const index = items.findIndex((item) => item.id === next.id)
  if (index === -1) {
    return [next, ...items]
  }

  const copy = items.slice()
  copy[index] = next
  return copy
}

export const useOrderStore = defineStore('order', () => {
  const orders = ref<Order[]>([])
  const appeals = ref<Appeal[]>([])
  const loaded = ref(false)
  const loading = ref(false)
  const errorMessage = ref('')

  const counts = computed(() => {
    const result: Record<OrderTab, number> = {
      all: orders.value.length,
      unpaid: 0,
      cancelled: 0,
      paid: 0,
      to_ship: 0,
      to_receive: 0,
      completed: 0,
    }

    for (const order of orders.value) {
      result[order.status] += 1
    }

    return result
  })

  function applySnapshot(snapshot: { orders: Order[]; appeals: Appeal[] }): void {
    orders.value = snapshot.orders
    appeals.value = snapshot.appeals
    loaded.value = true
    errorMessage.value = ''
  }

  async function load(force = false): Promise<void> {
    if (loaded.value && !force) {
      return
    }

    loading.value = true
    errorMessage.value = ''

    try {
      applySnapshot(await getOrderSnapshot())
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '订单数据加载失败'
      throw error
    } finally {
      loading.value = false
    }
  }

  function findOrder(orderId: string): Order | undefined {
    return orders.value.find((order) => order.id === orderId)
  }

  function findAppeal(appealId: string): Appeal | undefined {
    return appeals.value.find((appeal) => appeal.id === appealId)
  }

  function ordersByTab(tab: OrderTab): Order[] {
    if (tab === 'all') {
      return orders.value
    }

    return orders.value.filter((order) => order.status === tab)
  }

  function firstOrderByStatus(status: OrderStatus): Order | undefined {
    return orders.value.find((order) => order.status === status)
  }

  function appealsForOrder(orderId: string): Appeal[] {
    return appeals.value.filter((appeal) => appeal.orderId === orderId)
  }

  async function createOrder(input: CreateOrderInput): Promise<Order> {
    const order = await createOrderRequest(input)
    orders.value = replaceById(orders.value, order)
    loaded.value = true
    return order
  }

  async function payOrder(orderId: string, input: PayOrderInput): Promise<Order> {
    const order = await payOrderRequest(orderId, input)
    orders.value = replaceById(orders.value, order)
    return order
  }

  async function cancelOrder(orderId: string, input: CancelOrderInput): Promise<Order> {
    const order = await cancelOrderRequest(orderId, input)
    orders.value = replaceById(orders.value, order)
    return order
  }

  async function confirmReceipt(orderId: string): Promise<Order> {
    const order = await confirmReceiptRequest(orderId)
    orders.value = replaceById(orders.value, order)
    return order
  }

  async function createAppeal(input: CreateAppealInput): Promise<Appeal> {
    const appeal = await createAppealRequest(input)
    appeals.value = replaceById(appeals.value, appeal)
    return appeal
  }

  async function supplementAppeal(
    appealId: string,
    input: SupplementAppealInput,
  ): Promise<Appeal> {
    const appeal = await supplementAppealRequest(appealId, input)
    appeals.value = replaceById(appeals.value, appeal)
    return appeal
  }

  return {
    orders,
    appeals,
    loaded,
    loading,
    errorMessage,
    counts,
    applySnapshot,
    load,
    findOrder,
    findAppeal,
    ordersByTab,
    firstOrderByStatus,
    appealsForOrder,
    createOrder,
    payOrder,
    cancelOrder,
    confirmReceipt,
    createAppeal,
    supplementAppeal,
  }
})
