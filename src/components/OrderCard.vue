<script setup lang="ts">
import { computed } from 'vue'

import type { Order } from '@/types/order'
import { ORDER_STATUS_LABELS, orderDetailPath, orderItemCount } from '@/types/order'
import { formatPrice } from '@/utils/money'

defineOptions({ name: 'OrderCard' })

const props = defineProps<{
  order: Order
}>()

const count = computed(() => orderItemCount(props.order.items))
const detailTo = computed(() => orderDetailPath(props.order))
</script>

<template>
  <article class="order-card">
    <header>
      <div class="store">
        <img :src="order.storeLogo" :alt="order.storeName" />
        <div>
          <strong>{{ order.storeName }}</strong>
          <p>订单号:{{ order.number }}</p>
        </div>
      </div>
      <span class="status">{{ ORDER_STATUS_LABELS[order.status] }}</span>
    </header>

    <RouterLink
      v-for="item in order.items"
      :key="`${order.id}-${item.productId}`"
      class="item"
      :to="detailTo"
    >
      <img :src="item.image" alt="" />
      <div>
        <p class="title-row">
          <span>{{ item.title }}</span>
          <strong>{{ formatPrice(item.price) }}</strong>
        </p>
        <p class="spec-row">
          <span>{{ item.spec }}</span>
          <span>×{{ item.quantity }}</span>
        </p>
      </div>
    </RouterLink>

    <p class="total">
      共{{ count }}件商品,小计:
      <i>{{ formatPrice(order.payable) }}</i>
    </p>
    <div v-if="$slots.actions" class="actions">
      <slot name="actions" />
    </div>
  </article>
</template>
