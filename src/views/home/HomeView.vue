<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { getHomeData } from '@/api/home'
import ProgressBar from '@/components/ProgressBar.vue'
import SvgIcon from '@/components/SvgIcon.vue'
import { useCartStore } from '@/stores/cart'
import type { HomeData, ProductSummary } from '@/types/catalog'

defineOptions({ name: 'HomeView' })

const router = useRouter()
const cartStore = useCartStore()
const home = ref<HomeData>()
const loading = ref(true)
const errorMessage = ref('')
const activeSection = ref(0)
const announcement = ref('')
const countdown = 10 * 60 * 60 * 1000

async function loadHome(): Promise<void> {
  loading.value = true
  errorMessage.value = ''

  try {
    home.value = await getHomeData()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '首页加载失败'
  } finally {
    loading.value = false
  }
}

function openBanner(to: string): void {
  void router.push(to)
}

function addProduct(product: ProductSummary): void {
  cartStore.addToCart(product)
  announcement.value = `已将 ${product.title} 加入购物车`
}

onMounted(loadHome)
</script>

<template>
  <div class="home-view">
    <header class="home-header">
      <RouterLink class="search-entry" to="/search" aria-label="打开商品搜索">
        <SvgIcon name="search" :size="18" />
        <span>搜索商品与关键词</span>
      </RouterLink>
      <span class="brand">JD H5</span>
    </header>

    <div v-if="loading" class="page-state" role="status">正在加载首页…</div>
    <div v-else-if="errorMessage" class="page-state error" role="alert">
      <p>{{ errorMessage }}</p>
      <van-button size="small" type="danger" plain @click="loadHome">重新加载</van-button>
    </div>

    <template v-else-if="home">
      <van-swipe class="banner" :autoplay="4000" lazy-render indicator-color="#d8182d">
        <van-swipe-item v-for="banner in home.banners" :key="banner.id">
          <button type="button" class="banner-button" @click="openBanner(banner.to)">
            <img :src="banner.image" :alt="banner.alt" />
          </button>
        </van-swipe-item>
      </van-swipe>

      <nav class="shortcut-grid" aria-label="首页快捷入口">
        <RouterLink v-for="shortcut in home.shortcuts" :key="shortcut.id" :to="shortcut.to">
          <span class="shortcut-icon"><SvgIcon :name="shortcut.icon" :size="24" /></span>
          <span>{{ shortcut.label }}</span>
        </RouterLink>
      </nav>

      <section class="flash-card" aria-labelledby="flash-title">
        <div>
          <p class="eyebrow">限时活动</p>
          <h2 id="flash-title">链猫秒杀</h2>
          <p>精选好物，售完即止</p>
        </div>
        <van-count-down :time="countdown" format="HH:mm:ss" />
      </section>

      <section class="catalog" aria-labelledby="catalog-title">
        <h2 id="catalog-title">好物推荐</h2>
        <van-tabs v-model:active="activeSection" shrink color="#d8182d" line-width="20">
          <van-tab
            v-for="section in home.sections"
            :key="section.id"
            :title="`${section.title} · ${section.subtitle}`"
          >
            <div class="product-grid">
              <article v-for="product in section.products" :key="product.id" class="product-card">
                <RouterLink :to="`/classify/product?id=${product.id}`" class="product-link">
                  <img :src="product.image" :alt="product.title" loading="lazy" />
                  <h3>{{ product.title }}</h3>
                  <p>{{ product.subtitle }}</p>
                </RouterLink>
                <ProgressBar :value="product.soldPercentage" />
                <footer>
                  <div class="price">
                    <strong>¥{{ product.price.toFixed(2) }}</strong>
                    <del v-if="product.originalPrice">¥{{ product.originalPrice.toFixed(2) }}</del>
                  </div>
                  <button
                    type="button"
                    class="add-button"
                    :aria-label="`将 ${product.title} 加入购物车`"
                    @click="addProduct(product)"
                  >
                    <SvgIcon name="add" :size="22" />
                  </button>
                </footer>
              </article>
            </div>
          </van-tab>
        </van-tabs>
      </section>
    </template>

    <p class="visually-hidden" aria-live="polite">{{ announcement }}</p>
  </div>
</template>

<style scoped lang="scss">
.home-view {
  min-height: 100vh;
  background: #f4f6f8;
}

.home-header {
  position: sticky;
  z-index: 20;
  top: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgb(255 255 255 / 94%);
  backdrop-filter: blur(12px);
}

.search-entry {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  background: #f8fafc;
  color: #64748b;
  font-size: 14px;
  text-decoration: none;
}

.brand {
  color: #d8182d;
  font-size: 13px;
  font-weight: 700;
}

.banner {
  margin: 0 16px;
  overflow: hidden;
  border-radius: 16px;
  box-shadow: 0 12px 32px rgb(15 23 42 / 12%);
}

.banner-button {
  display: block;
  width: 100%;
  height: 220px;
  padding: 0;
  border: 0;
  background: #e2e8f0;
}

.banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.shortcut-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin: 16px;
  padding: 16px 8px;
  border-radius: 16px;
  background: #fff;
}

.shortcut-grid a {
  display: grid;
  justify-items: center;
  gap: 8px;
  color: #334155;
  font-size: 12px;
  text-decoration: none;
}

.shortcut-icon {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: 14px;
  background: #fff1f2;
  color: #d8182d;
}

.flash-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 16px;
  padding: 18px;
  border-radius: 16px;
  background: linear-gradient(135deg, #7f1d1d, #d8182d);
  color: #fff;
}

.flash-card h2,
.flash-card p {
  margin: 0;
}

.flash-card h2 {
  margin-top: 2px;
  font-size: 22px;
}

.flash-card p:not(.eyebrow) {
  margin-top: 4px;
  opacity: 0.78;
  font-size: 12px;
}

.eyebrow {
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.flash-card :deep(.van-count-down) {
  color: #fff;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
}

.catalog {
  padding: 0 12px 24px;
}

.catalog > h2 {
  margin: 0 4px 8px;
  font-size: 20px;
}

.catalog :deep(.van-tabs__nav) {
  background: transparent;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  padding: 12px 4px;
}

.product-card {
  min-width: 0;
  padding: 10px;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 6px 20px rgb(15 23 42 / 6%);
}

.product-link {
  color: inherit;
  text-decoration: none;
}

.product-link img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: contain;
}

.product-link h3,
.product-link p {
  margin: 0;
}

.product-link h3 {
  overflow: hidden;
  margin-top: 8px;
  font-size: 15px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-link p {
  min-height: 34px;
  margin-top: 4px;
  color: #64748b;
  font-size: 11px;
  line-height: 1.5;
}

.product-card > footer {
  display: flex;
  align-items: end;
  justify-content: space-between;
  margin-top: 10px;
}

.price {
  display: grid;
}

.price strong {
  color: #d8182d;
  font-size: 16px;
}

.price del {
  color: #94a3b8;
  font-size: 10px;
}

.add-button {
  display: grid;
  width: 34px;
  height: 34px;
  padding: 0;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: #d8182d;
  color: #fff;
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
  .home-view {
    width: 540px;
    margin: 0 auto;
  }
}
</style>
