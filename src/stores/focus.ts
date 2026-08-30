import { ref } from 'vue'
import { defineStore } from 'pinia'

import { getFocusSnapshot, toggleFocus } from '@/api/focus'
import type { FocusKind, FocusSnapshot, ToggleFocusInput } from '@/types/focus'

export const useFocusStore = defineStore('focus', () => {
  const productIds = ref<string[]>([])
  const storeIds = ref<string[]>([])
  const loaded = ref(false)
  const loading = ref(false)
  const errorMessage = ref('')

  function applySnapshot(snapshot: FocusSnapshot): void {
    productIds.value = snapshot.productIds
    storeIds.value = snapshot.storeIds
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
      applySnapshot(await getFocusSnapshot())
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '关注数据加载失败'
      throw error
    } finally {
      loading.value = false
    }
  }

  function hasProduct(productId: string): boolean {
    return productIds.value.includes(productId)
  }

  function hasStore(storeId: string): boolean {
    return storeIds.value.includes(storeId)
  }

  async function toggle(input: ToggleFocusInput): Promise<boolean> {
    const result = await toggleFocus(input)
    productIds.value = result.productIds
    storeIds.value = result.storeIds
    return result.followed
  }

  function count(kind: FocusKind): number {
    return kind === 'store' ? storeIds.value.length : productIds.value.length
  }

  return {
    productIds,
    storeIds,
    loaded,
    loading,
    errorMessage,
    applySnapshot,
    load,
    hasProduct,
    hasStore,
    toggle,
    count,
  }
})
