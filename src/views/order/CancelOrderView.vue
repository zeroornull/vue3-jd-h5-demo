<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import PageHeader from '@/components/PageHeader.vue'
import { useOrderStore } from '@/stores/order'
import { CANCEL_REASONS } from '@/types/order'

defineOptions({ name: 'CancelOrderView' })

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()
const submitting = ref(false)
const errorMessage = ref('')
const form = reactive({
  reasonId: CANCEL_REASONS[0]!.id,
  note: '',
})

const orderId = computed(() => (typeof route.query.id === 'string' ? route.query.id : ''))
const order = computed(() => orderStore.findOrder(orderId.value) ?? orderStore.firstOrderByStatus('unpaid'))
const noteCount = computed(() => form.note.length)
const selectedReason = computed(
  () => CANCEL_REASONS.find((reason) => reason.id === form.reasonId)?.label ?? CANCEL_REASONS[0]!.label,
)

async function submit(): Promise<void> {
  if (!order.value) {
    errorMessage.value = '订单不存在'
    return
  }

  submitting.value = true
  errorMessage.value = ''

  try {
    await orderStore.cancelOrder(order.value.id, {
      reason: selectedReason.value,
      note: form.note.trim() || undefined,
    })
    await router.replace({ path: '/order', query: { tab: 'cancelled' } })
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '取消订单失败'
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
      title="取消原因"
      :show-search="false"
      action-label="申诉记录"
      action-to="/order/appealRecord"
    />

    <div class="page-state">
      <p>{{ order ? `准备取消订单 ${order.number}` : '订单取消后无法恢复' }}</p>
    </div>

    <form class="order-form" @submit.prevent="submit">
      <label v-for="reason in CANCEL_REASONS" :key="reason.id" class="order-reason">
        <span>{{ reason.label }}</span>
        <input v-model="form.reasonId" type="radio" name="cancel-reason" :value="reason.id" />
      </label>
      <label>
        补充说明
        <textarea
          v-model="form.note"
          maxlength="100"
          placeholder="请输入原因"
        />
        <span class="order-hint">{{ noteCount }}/100</span>
      </label>
      <p v-if="errorMessage" class="page-state error" role="alert">{{ errorMessage }}</p>
      <div class="order-footer">
        <p class="order-hint">请选择取消订单原因，帮助我们改进，提高服务</p>
        <button class="order-primary" type="submit" :disabled="submitting">
          {{ submitting ? '提交中…' : '提交' }}
        </button>
      </div>
    </form>
  </div>
</template>
