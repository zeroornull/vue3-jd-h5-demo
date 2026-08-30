<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import PageHeader from '@/components/PageHeader.vue'
import SvgIcon from '@/components/SvgIcon.vue'
import { useOrderStore } from '@/stores/order'
import { formatPrice } from '@/utils/money'

defineOptions({ name: 'TransactionDetailsView' })

const route = useRoute()
const orderStore = useOrderStore()
const orderId = computed(() => (typeof route.query.id === 'string' ? route.query.id : ''))
const order = computed(
  () => orderStore.findOrder(orderId.value) ?? orderStore.firstOrderByStatus('paid'),
)
const itemTitle = computed(() => order.value?.items.map((item) => item.title).join('、') ?? '')

onMounted(() => {
  void orderStore.load().catch(() => undefined)
})
</script>

<template>
  <div class="order-page">
    <PageHeader title="交易详情" :show-search="false" />

    <div v-if="!order" class="page-state" role="alert">订单不存在</div>
    <section v-else class="order-pay-success">
      <SvgIcon name="check" :size="36" />
      <h2>{{ formatPrice(order.payable) }}</h2>
      <p>{{ order.status === 'unpaid' ? '待支付' : '支付成功' }}</p>
      <dl>
        <div>
          <dt>商品</dt>
          <dd>{{ itemTitle }}</dd>
        </div>
        <div>
          <dt>支付方式</dt>
          <dd>{{ order.paymentMethod ?? '未选择' }}</dd>
        </div>
        <div>
          <dt>支付单号</dt>
          <dd>{{ order.paymentNumber ?? order.number }}</dd>
        </div>
        <div>
          <dt>成交时间</dt>
          <dd>{{ order.paidAt ?? order.createdAt }}</dd>
        </div>
      </dl>
      <div class="pair-actions">
        <RouterLink class="order-ghost" to="/classify">完成</RouterLink>
        <RouterLink class="order-primary" to="/storeDetail">返回商家</RouterLink>
      </div>
    </section>
  </div>
</template>
