<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'

import PageHeader from '@/components/PageHeader.vue'
import ProductCard from '@/components/ProductCard.vue'
import { useCartStore } from '@/stores/cart'
import { useCatalogStore } from '@/stores/catalog'
import type { CatalogProduct } from '@/types/catalog'

defineOptions({ name: 'RecommendationView' })

const route = useRoute()
const catalogStore = useCatalogStore()
const cartStore = useCartStore()
const { products, loading, errorMessage } = storeToRefs(catalogStore)
const visibleCount = ref(4)
const announcement = ref('')

const categoryId = computed(() =>
  typeof route.query.category === 'string' ? route.query.category : '',
)
const category = computed(() => catalogStore.findCategory(categoryId.value))
const filteredProducts = computed(() =>
  categoryId.value ? catalogStore.productsForCategory(categoryId.value) : products.value,
)
const visibleProducts = computed(() => filteredProducts.value.slice(0, visibleCount.value))

watch(categoryId, () => {
  visibleCount.value = 4
})

function addProduct(product: CatalogProduct): void {
  cartStore.addToCart(product)
  announcement.value = `已将 ${product.title} 加入购物车`
}

function loadMore(): void {
  visibleCount.value += 4
}

onMounted(() => catalogStore.load().catch(() => undefined))
</script>

<template>
  <div class="recommendation-view">
    <PageHeader
      :title="category ? `${category.name}推荐` : '商品推荐'"
      subtitle="从分类和活动中继续发现"
    />

    <div v-if="loading" class="page-state" role="status">正在加载推荐…</div>
    <div v-else-if="errorMessage" class="page-state error" role="alert">
      <p>{{ errorMessage }}</p>
      <van-button size="small" type="danger" plain @click="catalogStore.load(true)">
        重新加载
      </van-button>
    </div>
    <main v-else>
      <div class="summary">
        <strong>{{ filteredProducts.length }}</strong>
        <span>件精选商品</span>
      </div>
      <section class="product-list" aria-label="推荐商品">
        <ProductCard
          v-for="product in visibleProducts"
          :key="product.id"
          :product="product"
          @add="addProduct(product)"
        />
      </section>
      <button
        v-if="visibleProducts.length < filteredProducts.length"
        type="button"
        class="load-more"
        @click="loadMore"
      >
        加载更多
      </button>
    </main>
    <p class="visually-hidden" aria-live="polite">{{ announcement }}</p>
  </div>
</template>

<style scoped>
.recommendation-view {
  min-height: 100vh;
  background: #f4f6f8;
}

main {
  padding: 14px 14px 28px;
}

.summary {
  display: flex;
  align-items: baseline;
  gap: 5px;
  margin-bottom: 12px;
  color: #64748b;
  font-size: 12px;
}

.summary strong {
  color: #d8182d;
  font-size: 22px;
}

.product-list {
  display: grid;
  gap: 12px;
}

.load-more {
  display: block;
  min-height: 42px;
  margin: 18px auto 0;
  padding: 0 24px;
  border: 1px solid #cbd5e1;
  border-radius: 999px;
  background: #fff;
  color: #475569;
}

.page-state {
  display: grid;
  min-height: 50vh;
  place-content: center;
  gap: 12px;
  padding: 24px;
  color: #64748b;
  text-align: center;
}

.page-state p {
  margin: 0;
}

.error {
  color: #b91c1c;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

@media (min-width: 540px) {
  .recommendation-view {
    width: 540px;
    margin: 0 auto;
  }
}
</style>
