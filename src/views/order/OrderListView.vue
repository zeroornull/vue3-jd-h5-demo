<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'

import OrderCard from '@/components/OrderCard.vue'
import PageHeader from '@/components/PageHeader.vue'
import ProductCard from '@/components/ProductCard.vue'
import { useCartStore } from '@/stores/cart'
import { useCatalogStore } from '@/stores/catalog'
import { useOrderStore } from '@/stores/order'
import type { Order, OrderTab } from '@/types/order'
import { ORDER_TABS } from '@/types/order'

defineOptions({ name: 'OrderListView' })

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()
const catalogStore = useCatalogStore()
const cartStore = useCartStore()
const { loading, errorMessage, counts } = storeToRefs(orderStore)

const activeTab = computed({
  get(): number {
    const tab = typeof route.query.tab === 'string' ? route.query.tab : 'all'
    const index = ORDER_TABS.findIndex((item) => item.id === tab)
    return index >= 0 ? index : 0
  },
  set(index: number) {
    const tab = ORDER_TABS[index]?.id ?? 'all'
    void router.replace({ query: tab === 'all' ? {} : { tab } })
  },
})

const currentTab = computed<OrderTab>(() => ORDER_TABS[activeTab.value]?.id ?? 'all')
const visibleOrders = computed(() => orderStore.ordersByTab(currentTab.value))
const recommendations = computed(() => catalogStore.products.slice(0, 2))

function tabTitle(tab: (typeof ORDER_TABS)[number]): string {
  return `${tab.label}(${counts.value[tab.id]})`
}

function cancelTo(order: Order): string {
  return `/order/cancelOrder?id=${order.id}`
}

function payTo(order: Order): string {
  return `/order/orderDetail?id=${order.id}`
}

function logisticsTo(order: Order): string {
  return `/order/viewLogistics?id=${order.id}`
}

function appealTo(order: Order): string {
  return `/order/appeal?id=${order.id}`
}

onMounted(() => {
  void orderStore.load().catch(() => undefined)
  void catalogStore.load().catch(() => undefined)
})
</script>

<template>
  <div class="order-page">
    <PageHeader title="我的订单" subtitle="支付、物流与售后" :show-search="false" />

    <div v-if="loading && !orderStore.loaded" class="page-state" role="status">正在加载订单…</div>
    <div v-else-if="errorMessage && !orderStore.loaded" class="page-state error" role="alert">
      <p>{{ errorMessage }}</p>
      <van-button size="small" type="danger" plain @click="orderStore.load(true)">
        重新加载
      </van-button>
    </div>

    <template v-else>
      <van-tabs v-model:active="activeTab" shrink color="#d8182d" line-width="20">
        <van-tab v-for="tab in ORDER_TABS" :key="tab.id" :title="tabTitle(tab)" />
      </van-tabs>

      <van-empty v-if="visibleOrders.length === 0" description="这个分类还没有订单" />

      <OrderCard v-for="order in visibleOrders" :key="order.id" :order="order">
        <template #actions>
          <RouterLink v-if="order.status === 'unpaid'" :to="cancelTo(order)">取消订单</RouterLink>
          <RouterLink v-if="order.status === 'unpaid'" class="primary" :to="payTo(order)">
            去支付
          </RouterLink>
          <RouterLink
            v-if="order.status === 'to_receive' || order.status === 'completed'"
            :to="logisticsTo(order)"
          >
            查看物流
          </RouterLink>
          <RouterLink v-if="order.status !== 'unpaid'" :to="appealTo(order)">
            {{ order.status === 'to_receive' || order.status === 'completed' ? '商品申诉' : '申诉' }}
          </RouterLink>
        </template>
      </OrderCard>

      <section v-if="recommendations.length" class="order-recommend" aria-label="猜你喜欢">
        <h2>猜你喜欢</h2>
        <ProductCard
          v-for="product in recommendations"
          :key="product.id"
          :product="product"
          action-label="加入购物车"
          @add="cartStore.addToCart(product)"
        />
      </section>
    </template>
  </div>
</template>
