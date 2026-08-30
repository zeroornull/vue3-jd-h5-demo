import type { FocusSnapshot } from '../types/focus.js'

export function createFocusSeed(): FocusSnapshot {
  return {
    productIds: ['product-1', 'product-3', 'product-6'],
    storeIds: ['store-1'],
  }
}
