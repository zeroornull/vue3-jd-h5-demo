<script setup lang="ts">
import type { StoreSummary } from '@/types/catalog'

defineOptions({ name: 'StoreCard' })

defineProps<{
  store: StoreSummary
}>()
</script>

<template>
  <article class="store-card">
    <header>
      <img :src="store.logo" :alt="`${store.name} 标志`" />
      <div>
        <h2>{{ store.name }}</h2>
        <p>{{ store.tagline }}</p>
      </div>
      <RouterLink :to="`/storeDetail?id=${store.id}`">进店</RouterLink>
    </header>
    <div class="store-gallery">
      <img class="hero" :src="store.heroImage" :alt="`${store.name} 店铺精选`" />
      <img v-for="image in store.productImages" :key="image" :src="image" alt="店铺商品" />
    </div>
    <footer>{{ store.followers.toLocaleString() }} 人关注</footer>
  </article>
</template>

<style scoped>
.store-card {
  padding: 14px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 6px 22px rgb(15 23 42 / 7%);
}

header {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
}

header > img {
  width: 40px;
  height: 40px;
  border-radius: 10px;
}

h2,
p {
  margin: 0;
}

h2 {
  font-size: 14px;
}

p,
footer {
  margin-top: 3px;
  color: #64748b;
  font-size: 10px;
}

header a {
  padding: 7px 12px;
  border: 1px solid #d8182d;
  border-radius: 999px;
  color: #d8182d;
  font-size: 11px;
  text-decoration: none;
}

.store-gallery {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 6px;
  margin-top: 12px;
}

.store-gallery img {
  width: 100%;
  height: 92px;
  border-radius: 10px;
  background: #f8fafc;
  object-fit: cover;
}

.store-gallery .hero {
  object-fit: contain;
}
</style>
