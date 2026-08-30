<script setup lang="ts">
import ProgressBar from './ProgressBar.vue'
import SvgIcon from './SvgIcon.vue'
import type { CatalogProduct } from '@/types/catalog'

defineOptions({ name: 'ProductCard' })

withDefaults(
  defineProps<{
    product: CatalogProduct
    rank?: number
    showProgress?: boolean
    showFavorite?: boolean
    favorite?: boolean
    actionLabel?: string
  }>(),
  {
    rank: undefined,
    showProgress: false,
    showFavorite: false,
    favorite: false,
    actionLabel: '加入购物车',
  },
)

defineEmits<{
  add: []
  toggleFavorite: []
}>()
</script>

<template>
  <article class="product-card">
    <span v-if="rank" class="rank" :aria-label="`第 ${rank} 名`">{{ rank }}</span>
    <RouterLink :to="`/classify/product?id=${product.id}`" class="product-link">
      <img :src="product.image" :alt="product.title" loading="lazy" />
      <div class="product-copy">
        <p class="brand">{{ product.brand }}</p>
        <h2>{{ product.title }}</h2>
        <p class="subtitle">{{ product.subtitle }}</p>
        <ul class="tags" aria-label="商品特点">
          <li v-for="tag in product.tags.slice(0, 2)" :key="tag">{{ tag }}</li>
        </ul>
      </div>
    </RouterLink>
    <ProgressBar v-if="showProgress" :value="product.soldPercentage" />
    <footer>
      <div class="price">
        <strong>¥{{ product.price.toFixed(2) }}</strong>
        <del v-if="product.originalPrice">¥{{ product.originalPrice.toFixed(2) }}</del>
      </div>
      <button
        v-if="showFavorite"
        type="button"
        class="favorite"
        :aria-label="favorite ? `取消关注 ${product.title}` : `关注 ${product.title}`"
        :aria-pressed="favorite"
        @click="$emit('toggleFavorite')"
      >
        <van-icon :name="favorite ? 'like' : 'like-o'" :color="favorite ? '#d8182d' : '#64748b'" />
      </button>
      <button type="button" class="add" @click="$emit('add')">
        <SvgIcon name="add" :size="18" />
        <span>{{ actionLabel }}</span>
      </button>
    </footer>
  </article>
</template>

<style scoped>
.product-card {
  position: relative;
  min-width: 0;
  padding: 12px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 6px 22px rgb(15 23 42 / 7%);
}

.rank {
  position: absolute;
  z-index: 2;
  top: 8px;
  left: 8px;
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border-radius: 9px;
  background: #d8182d;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
}

.product-link {
  display: grid;
  grid-template-columns: 104px minmax(0, 1fr);
  gap: 12px;
  color: inherit;
  text-decoration: none;
}

.product-link > img {
  width: 104px;
  height: 104px;
  border-radius: 12px;
  background: #f8fafc;
  object-fit: contain;
}

.product-copy {
  min-width: 0;
}

.brand,
h2,
.subtitle {
  margin: 0;
}

.brand {
  color: #d8182d;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

h2 {
  overflow: hidden;
  margin-top: 3px;
  font-size: 15px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.subtitle {
  display: -webkit-box;
  overflow: hidden;
  margin-top: 5px;
  color: #64748b;
  font-size: 11px;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.tags {
  display: flex;
  gap: 4px;
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
}

.tags li {
  padding: 2px 6px;
  border-radius: 999px;
  background: #fff1f2;
  color: #be123c;
  font-size: 9px;
}

.product-card > :deep(.progress) {
  margin-top: 10px;
}

footer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}

.price {
  display: grid;
  margin-right: auto;
}

.price strong {
  color: #d8182d;
  font-size: 16px;
}

.price del {
  color: #94a3b8;
  font-size: 10px;
}

.favorite {
  display: grid;
  width: 36px;
  height: 36px;
  padding: 0;
  place-items: center;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  background: #fff;
}

.add {
  display: inline-flex;
  min-height: 36px;
  align-items: center;
  gap: 5px;
  padding: 0 12px;
  border: 0;
  border-radius: 999px;
  background: #d8182d;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
}

@media (max-width: 374px) {
  .add span {
    display: none;
  }
}
</style>
