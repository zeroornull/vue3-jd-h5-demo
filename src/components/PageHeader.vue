<script setup lang="ts">
import { useRouter } from 'vue-router'

import SvgIcon from './SvgIcon.vue'

defineOptions({ name: 'PageHeader' })

withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    showBack?: boolean
    showSearch?: boolean
    actionLabel?: string
    actionTo?: string
  }>(),
  {
    subtitle: undefined,
    showBack: true,
    showSearch: true,
    actionLabel: undefined,
    actionTo: undefined,
  },
)

const router = useRouter()
</script>

<template>
  <header class="page-header">
    <button
      v-if="showBack"
      type="button"
      class="back"
      aria-label="返回上一页"
      @click="router.back()"
    >
      <SvgIcon name="left-btn" :size="22" />
    </button>
    <span v-else class="spacer" />
    <div class="heading">
      <h1>{{ title }}</h1>
      <p v-if="subtitle">{{ subtitle }}</p>
    </div>
    <RouterLink v-if="actionLabel && actionTo" class="action" :to="actionTo">
      {{ actionLabel }}
    </RouterLink>
    <RouterLink v-else-if="showSearch" class="search" to="/search" aria-label="搜索商品">
      <SvgIcon name="search" :size="20" />
    </RouterLink>
    <span v-else class="spacer" />
  </header>
</template>

<style scoped>
.page-header {
  position: sticky;
  z-index: 30;
  top: 0;
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) minmax(44px, auto);
  align-items: center;
  min-height: 60px;
  padding: 8px 10px;
  border-bottom: 1px solid #e2e8f0;
  background: rgb(255 255 255 / 94%);
  backdrop-filter: blur(12px);
}

.back,
.search {
  display: grid;
  width: 44px;
  height: 44px;
  padding: 0;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: #334155;
}

.search,
.action {
  text-decoration: none;
}

.action {
  padding: 0 8px;
  color: #d8182d;
  font-size: 13px;
  white-space: nowrap;
}

.heading {
  min-width: 0;
  text-align: center;
}

h1,
p {
  overflow: hidden;
  margin: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
}

h1 {
  font-size: 17px;
}

p {
  margin-top: 2px;
  color: #64748b;
  font-size: 10px;
}
</style>
