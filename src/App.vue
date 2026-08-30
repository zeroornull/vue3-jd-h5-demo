<script setup lang="ts">
import { RouterView } from 'vue-router'

import AppTabbar from '@/components/AppTabbar.vue'
</script>

<template>
  <main class="app-shell">
    <h1 class="visually-hidden">vue3-jd-h5-demo</h1>
    <RouterView />
  </main>
  <AppTabbar />
</template>

<style scoped>
.app-shell {
  box-sizing: border-box;
  min-height: 100vh;
  padding-bottom: calc(50px + env(safe-area-inset-bottom));
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
