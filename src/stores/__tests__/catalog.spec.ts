import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { catalogData } from '@/mocks/catalog-data'

const api = vi.hoisted(() => ({
  getCatalogData: vi.fn<() => Promise<typeof catalogData>>(),
}))

vi.mock('@/api/catalog', () => api)

import { useCatalogStore } from '../catalog'

describe('useCatalogStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    api.getCatalogData.mockReset()
    api.getCatalogData.mockResolvedValue(catalogData)
  })

  it('loads once and exposes typed category/product/campaign selectors', async () => {
    const store = useCatalogStore()

    await store.load()
    await store.load()

    expect(api.getCatalogData).toHaveBeenCalledTimes(1)
    expect(store.findCategory('digital')?.name).toBe('手机数码')
    expect(store.findProduct('product-6')?.title).toBe('无线降噪耳机')
    expect(store.findCampaign('premiumRanking')?.kind).toBe('ranking')
    expect(store.productsForCategory('beauty')).toHaveLength(2)
  })

  it('preserves campaign/store ID order and skips unknown IDs', () => {
    const store = useCatalogStore()
    store.applyCatalogData(catalogData)

    expect(store.productsByIds(['product-8', 'missing', 'product-6']).map((item) => item.id)).toEqual([
      'product-8',
      'product-6',
    ])
    expect(store.storesByIds(['store-2']).map((item) => item.id)).toEqual(['store-2'])
  })

  it('records an API failure and can recover with a forced load', async () => {
    const store = useCatalogStore()
    api.getCatalogData.mockRejectedValueOnce(new Error('offline'))

    await expect(store.load()).rejects.toThrow('offline')
    expect(store.errorMessage).toBe('offline')

    await store.load(true)
    expect(store.errorMessage).toBe('')
    expect(store.products).toHaveLength(8)
  })
})
