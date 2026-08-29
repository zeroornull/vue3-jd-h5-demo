<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <main class="app-shell">
    <h1>vue3-jd-h5-demo</h1>
    <p>第 3 轮已建立旧路由 URL 契约，业务页面将在后续轮次按模块迁移。</p>
    <RouterView />
  </main>
</template>

<style scoped>
.app-shell {
  box-sizing: border-box;
  min-height: 100vh;
  padding: 2rem;
  font-family: system-ui, sans-serif;
}

h1,
p {
  margin: 0;
}

p {
  margin-top: 1rem;
}
</style>
