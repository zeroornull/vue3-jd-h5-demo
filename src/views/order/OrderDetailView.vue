<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import type { PickerColumn, PickerOption } from 'vant'
import { useRoute, useRouter } from 'vue-router'

import AppPicker from '@/components/AppPicker.vue'
import OrderCard from '@/components/OrderCard.vue'
import PageHeader from '@/components/PageHeader.vue'
import { useOrderStore } from '@/stores/order'
import type { OrderStatus } from '@/types/order'
import { ORDER_STATUS_LABELS, orderItemCount, PAYMENT_METHODS } from '@/types/order'
import { formatPrice } from '@/utils/money'

defineOptions({ name: 'OrderDetailView' })

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()
const { loading, errorMessage } = storeToRefs(orderStore)
const paymentPickerOpen = ref(false)
const paying = ref(false)
const announcement = ref('')

const paymentOptions: PickerColumn = PAYMENT_METHODS.map((method) => ({
  text: method,
  value: method,
}))

const routeStatus = computed<OrderStatus | undefined>(() => {
  if (route.name === 'toBeDelivered') {
    return 'to_ship'
  }

  if (route.name === 'pendingReceipt') {
    return 'to_receive'
  }

  if (route.name === 'home') {
    return 'unpaid'
  }

  return undefined
})

const order = computed(() => {
  const id = typeof route.query.id === 'string' ? route.query.id : ''
  if (id) {
    return orderStore.findOrder(id)
  }

  return routeStatus.value ? orderStore.firstOrderByStatus(routeStatus.value) : orderStore.orders[0]
})

const title = computed(() =>
  order.value ? ORDER_STATUS_LABELS[order.value.status] : '订单详情',
)

async function confirmPayment(options: PickerOption[]): Promise<void> {
  if (!order.value) {
    return
  }

  paying.value = true
  announcement.value = '支付中…'

  try {
    const paid = await orderStore.payOrder(order.value.id, {
      paymentMethod: String(options[0]?.text ?? order.value.paymentMethod ?? 'Top-Pay'),
    })
    await router.replace({ path: '/order/transactionDetails', query: { id: paid.id } })
  } catch (error) {
    announcement.value = error instanceof Error ? error.message : '支付失败'
  } finally {
    paying.value = false
  }
}

async function confirmReceive(): Promise<void> {
  if (!order.value) {
    return
  }

  try {
    await orderStore.confirmReceipt(order.value.id)
    announcement.value = '已确认收货'
  } catch (error) {
    announcement.value = error instanceof Error ? error.message : '确认收货失败'
  }
}

onMounted(() => {
  void orderStore.load().catch(() => undefined)
})
</script>

<template>
  <div class="order-page">
    <PageHeader :title="title" subtitle="订单详情" :show-search="false" />

    <div v-if="loading && !order" class="page-state" role="status">正在加载订单…</div>
    <div v-else-if="errorMessage && !order" class="page-state error" role="alert">
      {{ errorMessage }}
    </div>
    <div v-else-if="!order" class="page-state" role="alert">订单不存在</div>

    <template v-else>
      <OrderCard :order="order">
        <template
          v-if="order.status === 'to_receive' || order.status === 'completed' || order.status === 'to_ship'"
          #actions
        >
          <RouterLink
            v-if="order.logistics"
            :to="`/order/viewLogistics?id=${order.id}`"
          >
            查看物流
          </RouterLink>
          <button
            v-if="order.status === 'to_receive'"
            type="button"
            class="primary"
            @click="confirmReceive"
          >
            确认收货
          </button>
        </template>
      </OrderCard>

      <section class="order-meta-card" aria-label="订单信息">
        <p><strong>订单信息</strong></p>
        <p class="order-meta">订单编号：{{ order.number }}</p>
        <p v-if="order.paymentNumber" class="order-meta">支付单号：{{ order.paymentNumber }}</p>
        <p class="order-meta">创建时间：{{ order.createdAt }}</p>
        <p v-if="order.paidAt" class="order-meta">付款时间：{{ order.paidAt }}</p>
        <p v-if="order.cancelReason" class="order-meta">取消原因：{{ order.cancelReason }}</p>
        <p class="order-meta">
          收货人：{{ order.address.receiver }} {{ order.address.phone }}
        </p>
        <p class="order-meta">{{ order.address.detail }}</p>
      </section>

      <div v-if="order.status === 'unpaid'" class="order-footer">
        <div class="summary">
          <span>
            共{{ orderItemCount(order.items) }}件商品，小计：
            <strong>{{ formatPrice(order.payable) }}</strong>
          </span>
          <span>请尽快完成支付</span>
        </div>
        <button
          type="button"
          class="order-primary"
          :disabled="paying"
          @click="paymentPickerOpen = true"
        >
          {{ paying ? '支付中…' : '立即支付' }}
        </button>
      </div>
    </template>

    <AppPicker
      v-model="paymentPickerOpen"
      title="选择支付方式"
      :columns="paymentOptions"
      @confirm="confirmPayment"
    />
    <p class="visually-hidden" aria-live="polite">{{ announcement }}</p>
  </div>
</template>

<style scoped>
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.order-meta-card p {
  margin: 0 0 8px;
}

.order-footer strong {
  color: #d8182d;
}
</style>
