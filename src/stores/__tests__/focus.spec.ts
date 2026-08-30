import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createFocusSeed } from '@/mocks/focus-data'
import type { FocusSnapshot, ToggleFocusInput, ToggleFocusResult } from '@/types/focus'

const api = vi.hoisted(() => ({
  getFocusSnapshot: vi.fn<() => Promise<FocusSnapshot>>(),
  toggleFocus: vi.fn<(input: ToggleFocusInput) => Promise<ToggleFocusResult>>(),
}))

vi.mock('@/api/focus', () => api)

import { useFocusStore } from '../focus'

describe('useFocusStore', () => {
  const seed = createFocusSeed()

  beforeEach(() => {
    setActivePinia(createPinia())
    api.getFocusSnapshot.mockReset()
    api.toggleFocus.mockReset()
    api.getFocusSnapshot.mockResolvedValue(structuredClone(seed))
  })

  it('loads once and exposes followed product and store ids', async () => {
    const store = useFocusStore()
    await store.load()
    await store.load()

    expect(api.getFocusSnapshot).toHaveBeenCalledTimes(1)
    expect(store.hasProduct('product-6')).toBe(true)
    expect(store.hasStore('store-2')).toBe(false)
    expect(store.count('product')).toBe(3)
    expect(store.count('store')).toBe(1)
  })

  it('toggles follow state and replaces the snapshot lists', async () => {
    const store = useFocusStore()
    await store.load()

    api.toggleFocus.mockResolvedValue({
      productIds: seed.productIds,
      storeIds: [],
      followed: false,
    })

    await expect(store.toggle({ kind: 'store', id: 'store-1' })).resolves.toBe(false)
    expect(store.hasStore('store-1')).toBe(false)
    expect(store.count('store')).toBe(0)
  })
})
