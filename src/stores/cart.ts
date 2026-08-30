import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import type { ProductSummary } from '@/types/catalog'

export interface CartItem extends ProductSummary {
  quantity: number
  selected: boolean
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  const count = computed(() =>
    items.value.reduce((total, item) => total + item.quantity, 0),
  )
  const selectedCount = computed(() => items.value.filter((item) => item.selected).length)
  const selectedTotal = computed(() =>
    items.value.reduce(
      (total, item) => total + (item.selected ? item.price * item.quantity : 0),
      0,
    ),
  )
  const allSelected = computed(
    () => items.value.length > 0 && items.value.every((item) => item.selected),
  )

  function addToCart(product: ProductSummary, quantity = 1): void {
    const normalizedQuantity = Math.max(1, Math.round(quantity))
    const existing = items.value.find((item) => item.id === product.id)

    if (existing) {
      existing.quantity = Math.min(existing.stock, existing.quantity + normalizedQuantity)
      existing.selected = true
      return
    }

    items.value.push({
      ...product,
      quantity: Math.min(product.stock, normalizedQuantity),
      selected: true,
    })
  }

  function setQuantity(productId: string, quantity: number): void {
    const item = items.value.find((candidate) => candidate.id === productId)

    if (item) {
      item.quantity = Math.min(item.stock, Math.max(1, Math.round(quantity)))
    }
  }

  function setSelected(productId: string, selected: boolean): void {
    const item = items.value.find((candidate) => candidate.id === productId)

    if (item) {
      item.selected = selected
    }
  }

  function toggleAll(selected: boolean): void {
    for (const item of items.value) {
      item.selected = selected
    }
  }

  function removeSelected(): void {
    items.value = items.value.filter((item) => !item.selected)
  }

  function reset(): void {
    items.value = []
  }

  return {
    items,
    count,
    selectedCount,
    selectedTotal,
    allSelected,
    addToCart,
    setQuantity,
    setSelected,
    toggleAll,
    removeSelected,
    reset,
  }
})
