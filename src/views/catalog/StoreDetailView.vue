<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'

import PageHeader from '@/components/PageHeader.vue'
import ProductCard from '@/components/ProductCard.vue'
import { useCartStore } from '@/stores/cart'
import { useCatalogStore } from '@/stores/catalog'
import { useFocusStore } from '@/stores/focus'
import type { CatalogProduct } from '@/types/catalog'

defineOptions({ name: 'StoreDetailView' })

type StoreSort = 'default' | 'price_asc' | 'price_desc' | 'sales_asc' | 'sales_desc'

const route = useRoute()
const catalogStore = useCatalogStore()
const cartStore = useCartStore()
const focusStore = useFocusStore()
const { loading, errorMessage } = storeToRefs(catalogStore)
const sort = ref<StoreSort>('default')
const announcement = ref('')

const storeId = computed(() => {
  if (typeof route.query.id === 'string' && route.query.id) {
    return route.query.id
  }

  return catalogStore.stores[0]?.id ?? ''
})
const store = computed(() => catalogStore.findStore(storeId.value))
const followed = computed(() => (store.value ? focusStore.hasStore(store.value.id) : false))
const products = computed(() => {
  const items = store.value ? catalogStore.productsByIds(store.value.productIds) : []

  if (sort.value === 'price_asc') {
    return [...items].sort((left, right) => left.price - right.price)
  }

  if (sort.value === 'price_desc') {
    return [...items].sort((left, right) => right.price - left.price)
  }

  if (sort.value === 'sales_asc') {
    return [...items].sort((left, right) => left.monthlySales - right.monthlySales)
  }

  if (sort.value === 'sales_desc') {
    return [...items].sort((left, right) => right.monthlySales - left.monthlySales)
  }

  return items
})

function selectSort(next: 'default' | 'price' | 'sales'): void {
  if (next === 'default') {
    sort.value = 'default'
    return
  }

  if (next === 'price') {
    sort.value = sort.value === 'price_asc' ? 'price_desc' : 'price_asc'
    return
  }

  sort.value = sort.value === 'sales_desc' ? 'sales_asc' : 'sales_desc'
}

function addProduct(product: CatalogProduct): void {
  cartStore.addToCart(product)
  announcement.value = `已将 ${product.title} 加入购物车`
}

async function toggleFollow(): Promise<void> {
  if (!store.value) {
    return
  }

  try {
    const next = await focusStore.toggle({ kind: 'store', id: store.value.id })
    announcement.value = next ? '已关注店铺' : '已取消关注'
  } catch (error) {
    announcement.value = error instanceof Error ? error.message : '操作失败'
  }
}

onMounted(() => {
  void catalogStore.load().catch(() => undefined)
  void focusStore.load().catch(() => undefined)
})
</script>

<template>
  <div class="store-page">
    <PageHeader title="店铺详情" subtitle="商家信息与在售商品" />

    <div v-if="loading && !catalogStore.data" class="page-state">正在加载店铺…</div>
    <div v-else-if="errorMessage && !catalogStore.data" class="page-state error">{{ errorMessage }}</div>
    <div v-else-if="!store" class="page-state" role="alert">店铺不存在或已经关闭</div>

    <template v-else>
      <section class="store-hero">
        <img :src="store.logo" :alt="`${store.name} 标志`" />
        <h2>{{ store.name }}</h2>
        <p>{{ store.description }}</p>
        <p class="store-followers">{{ store.followers.toLocaleString() }} 人关注</p>
        <button type="button" class="store-follow" :aria-pressed="followed" @click="toggleFollow">
          {{ followed ? '已关注' : '关注店铺' }}
        </button>
      </section>

      <section class="store-contact">
        <p><span>电话</span>{{ store.phone }}</p>
        <p><span>地址</span>{{ store.address }}</p>
        <a class="store-call" :href="`tel:${store.phone}`">联系店家</a>
      </section>

      <nav class="store-sort" aria-label="商品排序">
        <button type="button" :class="{ active: sort === 'default' }" @click="selectSort('default')">
          默认排序
        </button>
        <button
          type="button"
          :class="{ active: sort === 'price_asc' || sort === 'price_desc' }"
          @click="selectSort('price')"
        >
          按价格 {{ sort === 'price_desc' ? '↓' : sort === 'price_asc' ? '↑' : '' }}
        </button>
        <button
          type="button"
          :class="{ active: sort === 'sales_asc' || sort === 'sales_desc' }"
          @click="selectSort('sales')"
        >
          按销量 {{ sort === 'sales_asc' ? '↑' : sort === 'sales_desc' ? '↓' : '' }}
        </button>
      </nav>

      <section class="store-products" :aria-label="`${store.name} 在售商品`">
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
          @add="addProduct(product)"
        />
      </section>
    </template>

    <p class="order-hint" role="status">{{ announcement }}</p>
  </div>
</template>
