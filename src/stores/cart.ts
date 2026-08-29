import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', () => {
  const count = ref(0)

  function addToCart(): void {
    count.value += 1
  }

  function reset(): void {
    count.value = 0
  }

  return {
    count,
    addToCart,
    reset,
  }
})
