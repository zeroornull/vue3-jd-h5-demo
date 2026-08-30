<script setup lang="ts">
import { computed, onMounted } from 'vue'

import OrderCard from '@/components/OrderCard.vue'
import PageHeader from '@/components/PageHeader.vue'
import { useOrderStore } from '@/stores/order'

defineOptions({ name: 'AppealRecordView' })

const orderStore = useOrderStore()
const records = computed(() =>
  orderStore.appeals.flatMap((appeal) => {
    const order = orderStore.findOrder(appeal.orderId)
    return order ? [{ appeal, order }] : []
  }),
)

onMounted(() => {
  void orderStore.load().catch(() => undefined)
})
</script>

<template>
  <div class="order-page">
    <PageHeader title="申诉记录" :show-search="false" />

    <div v-if="orderStore.loading && records.length === 0" class="page-state">正在加载申诉…</div>
    <van-empty v-else-if="records.length === 0" description="还没有申诉记录" />

    <OrderCard v-for="{ appeal, order } in records" :key="appeal.id" :order="order">
      <template #actions>
        <span class="order-hint">申诉时间:{{ appeal.createdAt }}</span>
        <RouterLink :to="`/order/appealDetail?id=${appeal.id}`">查看详情</RouterLink>
      </template>
    </OrderCard>
  </div>
</template>
