<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'

import PageHeader from '@/components/PageHeader.vue'
import ProductCard from '@/components/ProductCard.vue'
import StoreCard from '@/components/StoreCard.vue'
import { useCartStore } from '@/stores/cart'
import { useCatalogStore } from '@/stores/catalog'
import { useFocusStore } from '@/stores/focus'
import type { CatalogProduct } from '@/types/catalog'

defineOptions({ name: 'FocusView' })

const route = useRoute()
const router = useRouter()
const catalogStore = useCatalogStore()
const cartStore = useCartStore()
const focusStore = useFocusStore()
const { loading, errorMessage } = storeToRefs(focusStore)
const announcement = ref('')

const tab = computed(() => (route.query.tab === 'store' ? 'store' : 'product'))
const products = computed(() => catalogStore.productsByIds(focusStore.productIds))
const stores = computed(() => catalogStore.storesByIds(focusStore.storeIds))

function setTab(value: string | number): void {
  const next = value === 'store' ? 'store' : 'product'

  if (tab.value !== next) {
    void router.replace({ path: '/myFocus', query: { tab: next } })
  }
}

function addProduct(product: CatalogProduct): void {
  cartStore.addToCart(product)
  announcement.value = `已将 ${product.title} 加入购物车`
}

async function toggleProduct(productId: string): Promise<void> {
  try {
    const followed = await focusStore.toggle({ kind: 'product', id: productId })
    announcement.value = followed ? '已加入关注' : '已取消关注'
  } catch (error) {
    announcement.value = error instanceof Error ? error.message : '操作失败'
  }
}

async function toggleStore(storeId: string): Promise<void> {
  try {
    const followed = await focusStore.toggle({ kind: 'store', id: storeId })
    announcement.value = followed ? '已关注店铺' : '已取消关注'
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
  <div class="focus-page">
    <PageHeader title="我的关注" subtitle="商品与店铺" :show-search="false" />

    <div v-if="loading && !focusStore.loaded" class="page-state">正在加载关注…</div>
    <div v-else-if="errorMessage && !focusStore.loaded" class="page-state error">{{ errorMessage }}</div>

    <template v-else>
      <van-tabs :active="tab" color="#d8182d" shrink @change="setTab">
        <van-tab title="商品关注" name="product">
          <van-empty v-if="products.length === 0" description="还没有关注商品" />
          <section v-else class="focus-list" aria-label="关注的商品">
            <ProductCard
              v-for="product in products"
              :key="product.id"
              :product="product"
              show-favorite
              favorite
              @add="addProduct(product)"
              @toggle-favorite="toggleProduct(product.id)"
            />
          </section>
        </van-tab>
        <van-tab title="店铺关注" name="store">
          <van-empty v-if="stores.length === 0" description="还没有关注店铺" />
          <section v-else class="focus-list" aria-label="关注的店铺">
            <article v-for="store in stores" :key="store.id" class="focus-store">
              <StoreCard :store="store" />
              <button type="button" class="store-follow" @click="toggleStore(store.id)">取消关注</button>
            </article>
          </section>
        </van-tab>
      </van-tabs>
    </template>

    <p class="order-hint" role="status">{{ announcement }}</p>
  </div>
</template>
