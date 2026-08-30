<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'

import PageHeader from '@/components/PageHeader.vue'
import ProgressBar from '@/components/ProgressBar.vue'
import { useCartStore } from '@/stores/cart'
import { useCatalogStore } from '@/stores/catalog'

defineOptions({ name: 'ProductDetailView' })

const route = useRoute()
const router = useRouter()
const catalogStore = useCatalogStore()
const cartStore = useCartStore()
const { loading, errorMessage } = storeToRefs(catalogStore)
const specificationOpen = ref(false)
const selectedVariantId = ref('')
const quantity = ref(1)
const favorite = ref(false)
const announcement = ref('')

const productId = computed(() =>
  typeof route.query.id === 'string' ? route.query.id : 'product-1',
)
const product = computed(() => catalogStore.findProduct(productId.value))
const selectedVariant = computed(() =>
  product.value?.variants.find((variant) => variant.id === selectedVariantId.value),
)
const maxQuantity = computed(() => selectedVariant.value?.stock ?? product.value?.stock ?? 1)

watch(
  product,
  (value) => {
    selectedVariantId.value = value?.variants[0]?.id ?? ''
    quantity.value = 1
  },
  { immediate: true },
)

function addSelection(): void {
  if (!product.value) {
    return
  }

  cartStore.addToCart(product.value, quantity.value)
  specificationOpen.value = false
  announcement.value = `已将 ${quantity.value} 件 ${product.value.title} 加入购物车`
}

function buyNow(): void {
  addSelection()
  void router.push('/shopCart')
}

onMounted(() => catalogStore.load().catch(() => undefined))
</script>

<template>
  <div class="product-detail-view">
    <PageHeader title="商品详情" subtitle="规格、配送与服务" />

    <div v-if="loading" class="page-state" role="status">正在加载商品…</div>
    <div v-else-if="errorMessage" class="page-state error" role="alert">
      <p>{{ errorMessage }}</p>
      <van-button size="small" type="danger" plain @click="catalogStore.load(true)">
        重新加载
      </van-button>
    </div>
    <div v-else-if="!product" class="page-state" role="alert">
      <p>商品不存在或已经下架</p>
      <RouterLink to="/classify">返回商品分类</RouterLink>
    </div>

    <template v-else>
      <van-swipe class="gallery" :autoplay="3500" indicator-color="#d8182d">
        <van-swipe-item v-for="image in product.gallery" :key="image">
          <img :src="image" :alt="product.title" />
        </van-swipe-item>
      </van-swipe>

      <main>
        <section class="product-summary">
          <div class="summary-heading">
            <div>
              <p class="brand">{{ product.brand }}</p>
              <h1>{{ product.title }}</h1>
            </div>
            <button
              type="button"
              class="favorite"
              :aria-label="favorite ? '取消收藏' : '收藏商品'"
              :aria-pressed="favorite"
              @click="favorite = !favorite"
            >
              <van-icon :name="favorite ? 'like' : 'like-o'" size="22" />
            </button>
          </div>
          <p class="subtitle">{{ product.subtitle }}</p>
          <div class="price-row">
            <strong>¥{{ product.price.toFixed(2) }}</strong>
            <del v-if="product.originalPrice">¥{{ product.originalPrice.toFixed(2) }}</del>
          </div>
          <ProgressBar :value="product.soldPercentage" />
          <ul class="meta-list">
            <li>月销 {{ product.monthlySales.toLocaleString() }}</li>
            <li>{{ product.rating.toFixed(1) }} 分</li>
            <li>{{ product.shippingFrom }} 发货</li>
          </ul>
          <ul class="tag-list" aria-label="商品服务">
            <li v-for="tag in product.tags" :key="tag">{{ tag }}</li>
          </ul>
        </section>

        <button type="button" class="specification-row" @click="specificationOpen = true">
          <span>已选</span>
          <strong>{{ selectedVariant?.label ?? '请选择规格' }} × {{ quantity }}</strong>
          <van-icon name="arrow" />
        </button>

        <section class="description">
          <h2>商品介绍</h2>
          <p>{{ product.description }}</p>
        </section>
      </main>

      <footer class="product-actions">
        <RouterLink to="/shopCart" aria-label="查看购物车">
          <van-icon name="shopping-cart-o" size="22" :badge="cartStore.count || undefined" />
          <span>购物车</span>
        </RouterLink>
        <button type="button" class="secondary" @click="specificationOpen = true">
          加入购物车
        </button>
        <button type="button" class="primary" @click="buyNow">立即购买</button>
      </footer>

      <van-popup v-model:show="specificationOpen" position="bottom" round safe-area-inset-bottom>
        <section class="specification-panel" aria-labelledby="specification-title">
          <header>
            <img :src="product.image" :alt="product.title" />
            <div>
              <h2 id="specification-title">选择规格</h2>
              <strong>¥{{ product.price.toFixed(2) }}</strong>
            </div>
          </header>
          <div class="variant-list">
            <button
              v-for="variant in product.variants"
              :key="variant.id"
              type="button"
              :class="{ active: variant.id === selectedVariantId }"
              @click="selectedVariantId = variant.id"
            >
              {{ variant.label }} · 库存 {{ variant.stock }}
            </button>
          </div>
          <div class="quantity-row">
            <span>数量</span>
            <van-stepper v-model="quantity" :min="1" :max="maxQuantity" integer />
          </div>
          <van-button block round type="danger" @click="addSelection">确认加入购物车</van-button>
        </section>
      </van-popup>
      <p class="visually-hidden" aria-live="polite">{{ announcement }}</p>
    </template>
  </div>
</template>

<style scoped lang="scss">
.product-detail-view {
  min-height: 100vh;
  padding-bottom: calc(72px + env(safe-area-inset-bottom));
  background: #f4f6f8;
}

.gallery {
  height: 360px;
  background: #fff;
}

.gallery img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

main {
  display: grid;
  gap: 12px;
  padding: 12px;
}

.product-summary,
.description,
.specification-row {
  border-radius: 16px;
  background: #fff;
}

.product-summary,
.description {
  padding: 16px;
}

.summary-heading {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
}

.brand,
h1,
.subtitle,
.description h2,
.description p {
  margin: 0;
}

.brand {
  color: #d8182d;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

h1 {
  margin-top: 4px;
  font-size: 22px;
}

.subtitle,
.description p {
  margin-top: 8px;
  color: #64748b;
  font-size: 13px;
  line-height: 1.6;
}

.favorite {
  display: grid;
  width: 42px;
  height: 42px;
  padding: 0;
  place-items: center;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  background: #fff;
  color: #d8182d;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 14px 0 10px;
}

.price-row strong {
  color: #d8182d;
  font-size: 25px;
}

.price-row del {
  color: #94a3b8;
  font-size: 12px;
}

.meta-list,
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  margin: 12px 0 0;
  padding: 0;
  color: #64748b;
  font-size: 11px;
  list-style: none;
}

.tag-list li {
  padding: 4px 8px;
  border-radius: 999px;
  background: #fff1f2;
  color: #be123c;
}

.specification-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  width: 100%;
  padding: 16px;
  border: 0;
  color: #64748b;
  text-align: left;
}

.specification-row strong {
  overflow: hidden;
  color: #334155;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.description h2 {
  font-size: 16px;
}

.product-actions {
  position: fixed;
  z-index: 40;
  right: 0;
  bottom: 0;
  left: 0;
  display: grid;
  grid-template-columns: 72px 1fr 1fr;
  min-height: 64px;
  padding: 8px 12px calc(8px + env(safe-area-inset-bottom));
  border-top: 1px solid #e2e8f0;
  background: #fff;
}

.product-actions a {
  display: grid;
  place-content: center;
  color: #475569;
  font-size: 10px;
  text-align: center;
  text-decoration: none;
}

.product-actions button {
  border: 0;
  color: #fff;
  font-weight: 600;
}

.secondary {
  border-radius: 999px 0 0 999px;
  background: #fb923c;
}

.primary {
  border-radius: 0 999px 999px 0;
  background: #d8182d;
}

.specification-panel {
  padding: 20px 18px calc(18px + env(safe-area-inset-bottom));
}

.specification-panel header {
  display: flex;
  gap: 12px;
  align-items: center;
}

.specification-panel header img {
  width: 72px;
  height: 72px;
  border-radius: 12px;
  background: #f8fafc;
  object-fit: contain;
}

.specification-panel h2 {
  margin: 0;
  font-size: 17px;
}

.specification-panel header strong {
  display: block;
  margin-top: 5px;
  color: #d8182d;
}

.variant-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}

.variant-list button {
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 999px;
  background: #fff;
  color: #475569;
  font-size: 12px;
}

.variant-list button.active {
  border-color: #d8182d;
  background: #fff1f2;
  color: #d8182d;
}

.quantity-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 22px 0;
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
  .product-detail-view {
    width: 540px;
    margin: 0 auto;
  }

  .product-actions {
    right: auto;
    left: 50%;
    width: 540px;
    transform: translateX(-50%);
  }
}
</style>
