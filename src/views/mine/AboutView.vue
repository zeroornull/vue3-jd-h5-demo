<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue'

defineOptions({ name: 'AboutView' })
</script>

<template>
  <div class="mine-page" style="background: #fff">
    <PageHeader title="关于我们" :show-search="false" />
    <section class="about-hero">
      <img src="/mock/auth/logo.png" alt="Chain Mall" />
      <h2>Chain Mall</h2>
      <p>版本 1.0.1</p>
    </section>
  </div>
</template>
