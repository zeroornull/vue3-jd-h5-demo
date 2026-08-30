<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'

import PageHeader from '@/components/PageHeader.vue'
import { useProfileStore } from '@/stores/profile'

defineOptions({ name: 'HelpCenterView' })

const profileStore = useProfileStore()
const { helpTopics } = storeToRefs(profileStore)

onMounted(() => {
  void profileStore.load().catch(() => undefined)
})
</script>

<template>
  <div class="mine-page">
    <PageHeader title="帮助中心" :show-search="false" />

    <nav class="mine-list">
      <RouterLink to="/mine/feedback">问题反馈</RouterLink>
      <RouterLink to="/mine/messageCenter">支持方式</RouterLink>
    </nav>

    <section class="mine-list" aria-label="产品帮助">
      <details v-for="topic in helpTopics" :key="topic.id" class="help-topic" open>
        <summary>{{ topic.title }}</summary>
        <ul>
          <li v-for="article in topic.articles" :key="article">{{ article }}</li>
        </ul>
      </details>
    </section>
  </div>
</template>
