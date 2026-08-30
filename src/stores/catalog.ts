import { computed, shallowRef } from 'vue'
import { defineStore } from 'pinia'

import { getCatalogData } from '@/api/catalog'
import type {
  Campaign,
  CatalogCategory,
  CatalogData,
  CatalogProduct,
  StoreSummary,
} from '@/types/catalog'

export const useCatalogStore = defineStore('catalog', () => {
  const data = shallowRef<CatalogData>()
  const loading = shallowRef(false)
  const errorMessage = shallowRef('')

  const categories = computed(() => data.value?.categories ?? [])
  const products = computed(() => data.value?.products ?? [])
  const campaigns = computed(() => data.value?.campaigns ?? [])
  const stores = computed(() => data.value?.stores ?? [])

  function applyCatalogData(value: CatalogData): void {
    data.value = value
    errorMessage.value = ''
  }

  async function load(force = false): Promise<void> {
    if (data.value && !force) {
      return
    }

    loading.value = true
    errorMessage.value = ''

    try {
      applyCatalogData(await getCatalogData())
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '商品数据加载失败'
      throw error
    } finally {
      loading.value = false
    }
  }

  function findCategory(categoryId: string): CatalogCategory | undefined {
    return categories.value.find((category) => category.id === categoryId)
  }

  function findProduct(productId: string): CatalogProduct | undefined {
    return products.value.find((product) => product.id === productId)
  }

  function findCampaign(campaignId: string): Campaign | undefined {
    return campaigns.value.find((campaign) => campaign.id === campaignId)
  }

  function productsByIds(productIds: readonly string[]): CatalogProduct[] {
    const productsById = new Map(products.value.map((product) => [product.id, product]))
    return productIds.flatMap((productId) => {
      const product = productsById.get(productId)
      return product ? [product] : []
    })
  }

  function productsForCategory(categoryId: string): CatalogProduct[] {
    return products.value.filter((product) => product.categoryId === categoryId)
  }

  function storesByIds(storeIds: readonly string[]): StoreSummary[] {
    const storesById = new Map(stores.value.map((store) => [store.id, store]))
    return storeIds.flatMap((storeId) => {
      const store = storesById.get(storeId)
      return store ? [store] : []
    })
  }

  return {
    data,
    loading,
    errorMessage,
    categories,
    products,
    campaigns,
    stores,
    applyCatalogData,
    load,
    findCategory,
    findProduct,
    findCampaign,
    productsByIds,
    productsForCategory,
    storesByIds,
  }
})
