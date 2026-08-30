<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import ListScroll from '@/components/ListScroll.vue'
import PageHeader from '@/components/PageHeader.vue'
import { useCatalogStore } from '@/stores/catalog'

defineOptions({ name: 'CategoryView' })

const catalogStore = useCatalogStore()
const { categories, loading, errorMessage } = storeToRefs(catalogStore)
const activeCategoryId = ref('')

const activeCategory = computed(() => catalogStore.findCategory(activeCategoryId.value))

watch(
  categories,
  (value) => {
    if (!activeCategoryId.value && value[0]) {
      activeCategoryId.value = value[0].id
    }
  },
  { immediate: true },
)

function groupProducts(productIds: readonly string[]) {
  return catalogStore.productsByIds(productIds)
}

onMounted(() => catalogStore.load().catch(() => undefined))
</script>

<template>
  <div class="category-view">
    <PageHeader title="商品分类" subtitle="按生活场景探索商品" :show-back="false" />

    <div v-if="loading" class="page-state" role="status">正在加载分类…</div>
    <div v-else-if="errorMessage" class="page-state error" role="alert">
      <p>{{ errorMessage }}</p>
      <van-button size="small" type="danger" plain @click="catalogStore.load(true)">
        重新加载
      </van-button>
    </div>

    <section v-else-if="activeCategory" class="category-layout">
      <ListScroll class="category-sidebar" :data="categories">
        <nav aria-label="商品分类">
          <button
            v-for="category in categories"
            :key="category.id"
            type="button"
            :class="{ active: category.id === activeCategory.id }"
            @click="activeCategoryId = category.id"
          >
            {{ category.name }}
          </button>
        </nav>
      </ListScroll>

      <ListScroll class="category-content" :data="activeCategory">
        <div class="content-inner">
          <RouterLink
            class="category-hero"
            :to="`/classify/recommend?category=${activeCategory.id}`"
          >
            <img :src="activeCategory.heroImage" :alt="activeCategory.name" />
            <span>查看 {{ activeCategory.name }} 全部推荐</span>
          </RouterLink>

          <section v-for="group in activeCategory.groups" :key="group.id" class="category-group">
            <h2>{{ group.title }}</h2>
            <div class="category-products">
              <RouterLink
                v-for="product in groupProducts(group.productIds)"
                :key="product.id"
                :to="`/classify/product?id=${product.id}`"
              >
                <img :src="product.image" :alt="product.title" />
                <span>{{ product.title }}</span>
              </RouterLink>
            </div>
          </section>
        </div>
      </ListScroll>
    </section>
  </div>
</template>

<style scoped>
.category-view {
  min-height: 100vh;
  background: #f4f6f8;
}

.category-layout {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr);
  height: calc(100vh - 110px - env(safe-area-inset-bottom));
}

.category-sidebar {
  background: #eef2f6;
}

.category-sidebar nav {
  padding-bottom: 20px;
}

.category-sidebar button {
  position: relative;
  width: 100%;
  min-height: 54px;
  padding: 8px;
  border: 0;
  background: transparent;
  color: #64748b;
  font-size: 13px;
}

.category-sidebar button.active {
  background: #fff;
  color: #d8182d;
  font-weight: 700;
}

.category-sidebar button.active::before {
  position: absolute;
  top: 14px;
  bottom: 14px;
  left: 0;
  width: 3px;
  border-radius: 0 999px 999px 0;
  background: #d8182d;
  content: '';
}

.category-content {
  background: #fff;
}

.content-inner {
  padding: 12px 14px 28px;
}

.category-hero {
  position: relative;
  display: block;
  overflow: hidden;
  height: 112px;
  border-radius: 14px;
  background: #e2e8f0;
  color: #fff;
}

.category-hero::after {
  position: absolute;
  inset: 0;
  background: linear-gradient(transparent 35%, rgb(15 23 42 / 72%));
  content: '';
}

.category-hero img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-hero span {
  position: absolute;
  z-index: 1;
  right: 12px;
  bottom: 10px;
  left: 12px;
  font-size: 12px;
  font-weight: 600;
}

.category-group {
  margin-top: 20px;
}

.category-group h2 {
  margin: 0;
  font-size: 15px;
}

.category-products {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 12px;
}

.category-products a {
  display: grid;
  min-width: 0;
  justify-items: center;
  gap: 6px;
  padding: 10px 6px;
  border-radius: 12px;
  background: #f8fafc;
  color: #334155;
  font-size: 11px;
  text-align: center;
  text-decoration: none;
}

.category-products img {
  width: 72px;
  height: 72px;
  object-fit: contain;
}

.category-products span {
  overflow: hidden;
  max-width: 100%;
  text-overflow: ellipsis;
  white-space: nowrap;
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

@media (min-width: 540px) {
  .category-view {
    width: 540px;
    margin: 0 auto;
  }
}
</style>
