<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import PageHeader from '@/components/PageHeader.vue'
import { useProfileStore } from '@/stores/profile'
import type { FeedbackType } from '@/types/profile'
import { FEEDBACK_TYPES } from '@/types/profile'

defineOptions({ name: 'FeedbackView' })

const router = useRouter()
const profileStore = useProfileStore()
const submitting = ref(false)
const errorMessage = ref('')
const form = reactive({
  type: 'bug' as FeedbackType,
  content: '',
})
const count = computed(() => form.content.length)

async function submit(): Promise<void> {
  if (!form.content.trim()) {
    errorMessage.value = '请填写问题描述'
    return
  }

  submitting.value = true
  errorMessage.value = ''

  try {
    await profileStore.submitFeedback({
      type: form.type,
      content: form.content.trim(),
    })
    await router.replace('/mine/messageCenter')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '提交失败'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="mine-page">
    <PageHeader title="问题反馈" :show-search="false" />
    <form class="mine-form" @submit.prevent="submit">
      <p>选择类型</p>
      <label v-for="item in FEEDBACK_TYPES" :key="item.id" class="order-reason">
        <span>{{ item.label }}</span>
        <input v-model="form.type" type="radio" name="feedback-type" :value="item.id" />
      </label>
      <label>
        问题描述
        <textarea v-model="form.content" maxlength="200" placeholder="请填写问题描述" />
        <span class="order-hint">{{ count }}/200</span>
      </label>
      <p v-if="errorMessage" class="page-state error" role="alert">{{ errorMessage }}</p>
      <button class="order-primary" type="submit" :disabled="submitting">
        {{ submitting ? '提交中…' : '提交' }}
      </button>
    </form>
  </div>
</template>
