<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import OrderCard from '@/components/OrderCard.vue'
import PageHeader from '@/components/PageHeader.vue'
import { useOrderStore } from '@/stores/order'

defineOptions({ name: 'AppealDetailView' })

const route = useRoute()
const orderStore = useOrderStore()
const supplement = ref('')
const submitting = ref(false)
const errorMessage = ref('')
const statusMessage = ref('')

const appealId = computed(() => (typeof route.query.id === 'string' ? route.query.id : ''))
const appeal = computed(
  () => orderStore.findAppeal(appealId.value) ?? orderStore.appeals[0],
)
const order = computed(() => (appeal.value ? orderStore.findOrder(appeal.value.orderId) : undefined))

async function submitSupplement(): Promise<void> {
  if (!appeal.value) {
    return
  }

  if (!supplement.value.trim()) {
    errorMessage.value = '请输入补充内容'
    return
  }

  submitting.value = true
  errorMessage.value = ''

  try {
    await orderStore.supplementAppeal(appeal.value.id, { content: supplement.value.trim() })
    supplement.value = ''
    statusMessage.value = '补充信息已提交'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '补充失败'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  void orderStore.load().catch(() => undefined)
})
</script>

<template>
  <div class="order-page">
    <PageHeader
      title="申诉详情"
      :show-search="false"
      action-label="申诉记录"
      action-to="/order/appealRecord"
    />

    <div v-if="!appeal || !order" class="page-state">申诉不存在</div>
    <template v-else>
      <OrderCard :order="order" />
      <section class="order-meta-card">
        <p class="order-meta">用户名：{{ appeal.contactName }}</p>
        <p class="order-meta">手机号：{{ appeal.contactPhone }}</p>
        <p class="order-meta">申诉时间：{{ appeal.createdAt }}</p>
        <p>{{ appeal.content }}</p>
        <div v-if="appeal.images.length" class="order-images">
          <img v-for="image in appeal.images" :key="image" :src="image" alt="申诉图片" />
        </div>
      </section>
      <form class="order-form" @submit.prevent="submitSupplement">
        <label>
          补充申诉信息
          <textarea v-model="supplement" placeholder="补充说明、凭证描述等" />
        </label>
        <p v-if="statusMessage" class="order-hint" role="status">{{ statusMessage }}</p>
        <p v-if="errorMessage" class="page-state error" role="alert">{{ errorMessage }}</p>
        <div class="order-footer">
          <button class="order-primary" type="submit" :disabled="submitting">
            {{ submitting ? '提交中…' : '补充申诉信息' }}
          </button>
        </div>
      </form>
    </template>
  </div>
</template>
