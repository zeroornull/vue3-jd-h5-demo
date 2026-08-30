import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useCartStore } from '../cart'
import type { ProductSummary } from '@/types/catalog'

const product: ProductSummary = {
  id: 'product-1',
  title: '多功能料理机',
  subtitle: '轻松准备每日健康餐',
  image: '/mock/home/product-1.png',
  price: 125,
  originalPrice: 169,
  stock: 2,
  soldPercentage: 68,
}

describe('useCartStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('adds a product snapshot and increments an existing quantity', () => {
    const store = useCartStore()

    store.addToCart(product)
    store.addToCart(product)
    store.addToCart(product)

    expect(store.items).toHaveLength(1)
    expect(store.items[0]).toMatchObject({ id: product.id, quantity: 2, selected: true })
    expect(store.count).toBe(2)
  })

  it('clamps quantity to the product stock and a minimum of one', () => {
    const store = useCartStore()
    store.addToCart(product)

    store.setQuantity(product.id, 99)
    expect(store.items[0]?.quantity).toBe(2)

    store.setQuantity(product.id, 0)
    expect(store.items[0]?.quantity).toBe(1)
  })

  it('calculates selected totals and removes selected items', () => {
    const store = useCartStore()
    const secondProduct = { ...product, id: 'product-2', price: 50 }
    store.addToCart(product)
    store.addToCart(secondProduct)
    store.setSelected(secondProduct.id, false)

    expect(store.selectedCount).toBe(1)
    expect(store.selectedTotal).toBe(125)
    expect(store.allSelected).toBe(false)

    store.removeSelected()
    expect(store.items.map((item) => item.id)).toEqual(['product-2'])
  })

  it('toggles all selections and resets the cart', () => {
    const store = useCartStore()
    store.addToCart(product)

    store.toggleAll(false)
    expect(store.selectedCount).toBe(0)

    store.toggleAll(true)
    expect(store.allSelected).toBe(true)

    store.reset()
    expect(store.items).toEqual([])
    expect(store.count).toBe(0)
  })
})
