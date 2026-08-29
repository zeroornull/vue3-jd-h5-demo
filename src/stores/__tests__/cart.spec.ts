import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useCartStore } from '../cart'

describe('useCartStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('preserves the only live legacy behavior: cart count increments', () => {
    const store = useCartStore()

    store.addToCart()
    store.addToCart()

    expect(store.count).toBe(2)
  })

  it('resets the migrated count without inventing product-domain state', () => {
    const store = useCartStore()
    store.addToCart()

    store.reset()

    expect(store.count).toBe(0)
  })
})
