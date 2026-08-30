<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'

import PageHeader from '@/components/PageHeader.vue'
import { useProfileStore } from '@/stores/profile'
import { MESSAGE_KIND_LABELS } from '@/types/profile'

defineOptions({ name: 'MessageCenterView' })

const profileStore = useProfileStore()
const { messages } = storeToRefs(profileStore)

onMounted(() => {
  void profileStore.load().catch(() => undefined)
})
</script>

<template>
  <div class="mine-page">
    <PageHeader title="消息中心" :show-search="false" />
    <van-empty v-if="messages.length === 0" description="还没有消息" />
    <article v-for="message in messages" :key="message.id" class="message-card">
      <header>
        <span class="kind" :class="message.kind">{{ MESSAGE_KIND_LABELS[message.kind] }}</span>
        <time>{{ message.createdAt }}</time>
      </header>
      <p>{{ message.body }}</p>
    </article>
  </div>
</template>
