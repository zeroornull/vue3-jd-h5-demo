import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createOrderSeed } from '@/mocks/order-data'
import type { Appeal, Order } from '@/types/order'

const api = vi.hoisted(() => ({
  getOrderSnapshot: vi.fn<() => Promise<{ orders: Order[]; appeals: Appeal[] }>>(),
  createOrder: vi.fn<(input: unknown) => Promise<Order>>(),
  payOrder: vi.fn<(orderId: string) => Promise<Order>>(),
  cancelOrder: vi.fn<(orderId: string) => Promise<Order>>(),
  confirmReceipt: vi.fn<(orderId: string) => Promise<Order>>(),
  createAppeal: vi.fn<(input: unknown) => Promise<Appeal>>(),
  supplementAppeal: vi.fn<(appealId: string) => Promise<Appeal>>(),
}))

vi.mock('@/api/order', () => api)

import { useOrderStore } from '../order'

describe('useOrderStore', () => {
  const seed = createOrderSeed()

  beforeEach(() => {
    setActivePinia(createPinia())
    api.getOrderSnapshot.mockReset()
    api.createOrder.mockReset()
    api.payOrder.mockReset()
    api.cancelOrder.mockReset()
    api.getOrderSnapshot.mockResolvedValue({
      orders: structuredClone(seed.orders),
      appeals: structuredClone(seed.appeals),
    })
  })

  it('loads once and filters orders by tab while preserving counts', async () => {
    const store = useOrderStore()

    await store.load()
    await store.load()

    expect(api.getOrderSnapshot).toHaveBeenCalledTimes(1)
    expect(store.counts.all).toBe(6)
    expect(store.counts.unpaid).toBe(1)
    expect(store.ordersByTab('to_receive')[0]?.id).toBe('order-to-receive')
    expect(store.findOrder('order-unpaid')?.status).toBe('unpaid')
    expect(store.appealsForOrder('order-paid')).toHaveLength(1)
  })

  it('creates an unpaid order and can pay, cancel, and confirm receipt', async () => {
    const store = useOrderStore()
    await store.load()

    const created: Order = {
      ...seed.orders[0]!,
      id: 'order-new',
      number: '20260830000007',
      status: 'unpaid',
    }
    api.createOrder.mockResolvedValue(created)
    api.payOrder.mockResolvedValue({ ...created, status: 'paid', paymentNumber: 'PAY1' })
    api.cancelOrder.mockResolvedValue({ ...created, status: 'cancelled' })
    api.confirmReceipt.mockResolvedValue({
      ...seed.orders.find((order) => order.id === 'order-to-receive')!,
      status: 'completed',
    })

    expect((await store.createOrder({ items: [{ productId: 'product-5', quantity: 1 }] })).id).toBe(
      'order-new',
    )
    expect((await store.payOrder('order-new', { paymentMethod: '支付宝' })).status).toBe('paid')
    expect((await store.cancelOrder('order-new', { reason: '买多了/买错了' })).status).toBe(
      'cancelled',
    )
    expect((await store.confirmReceipt('order-to-receive')).status).toBe('completed')
  })

  it('records an API failure and recovers with a forced load', async () => {
    const store = useOrderStore()
    api.getOrderSnapshot.mockRejectedValueOnce(new Error('offline'))

    await expect(store.load()).rejects.toThrow('offline')
    expect(store.errorMessage).toBe('offline')

    await store.load(true)
    expect(store.errorMessage).toBe('')
    expect(store.orders).toHaveLength(6)
  })
})
