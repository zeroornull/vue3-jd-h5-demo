<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import PageHeader from '@/components/PageHeader.vue'
import { useOrderStore } from '@/stores/order'

defineOptions({ name: 'LogisticsView' })

const route = useRoute()
const orderStore = useOrderStore()
const orderId = computed(() => (typeof route.query.id === 'string' ? route.query.id : ''))
const order = computed(
  () =>
    orderStore.findOrder(orderId.value) ??
    orderStore.firstOrderByStatus('to_receive') ??
    orderStore.firstOrderByStatus('completed'),
)
const logistics = computed(() => order.value?.logistics)

onMounted(() => {
  void orderStore.load().catch(() => undefined)
})
</script>

<template>
  <div class="order-page">
    <PageHeader title="查看物流" :show-search="false" />

    <div v-if="!order" class="page-state" role="alert">订单不存在</div>
    <div v-else-if="!logistics" class="page-state">该订单还没有物流信息</div>
    <template v-else>
      <section class="order-card">
        <div class="logistics-summary">
          <span class="logistics-mark">物流</span>
          <div>
            <p><strong>【{{ logistics.trackingNumber }}】</strong></p>
            <p class="order-meta">出发点：{{ logistics.from }}　件数：{{ logistics.pieceCount }}</p>
            <p class="order-meta">目的地：{{ logistics.to }}　状态：{{ logistics.statusLabel }}</p>
          </div>
        </div>
      </section>

      <section class="order-meta-card" aria-label="物流轨迹">
        <ol class="logistics-timeline">
          <li v-for="event in logistics.events" :key="`${event.time}-${event.title}`">
            <time>{{ event.time }}</time>
            <div>
              <h3>{{ event.title }}</h3>
              <p>{{ event.description }}</p>
            </div>
          </li>
        </ol>
      </section>
    </template>
  </div>
</template>
