<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import type { PickerColumn, PickerOption } from 'vant'

import AppPicker from '@/components/AppPicker.vue'
import PageHeader from '@/components/PageHeader.vue'
import { useNodeStore } from '@/stores/node'
import { NODE_PAYMENT_METHODS } from '@/types/node'

defineOptions({ name: 'NodeHubView' })

const nodeStore = useNodeStore()
const { products, applications, loading, errorMessage } = storeToRefs(nodeStore)
const paymentOpen = ref(false)
const announcement = ref('')
const paymentOptions: PickerColumn = NODE_PAYMENT_METHODS.map((method) => ({
  text: method,
  value: method,
}))

const share = computed(() => nodeStore.findProduct('share'))
const catalog = computed(() => products.value.filter((product) => product.id !== 'share'))

async function confirmShare(options: PickerOption[]): Promise<void> {
  if (!share.value) {
    return
  }

  try {
    const application = await nodeStore.apply({
      kind: 'share',
      shares: 1,
      paymentMethod: String(options[0]?.text ?? 'CoinPay'),
    })
    announcement.value = `已支付 ${application.amount} USDT，成为分享节点`
  } catch (error) {
    announcement.value = error instanceof Error ? error.message : '申请失败'
  }
}

onMounted(() => {
  void nodeStore.load().catch(() => undefined)
})
</script>

<template>
  <div class="node-page">
    <PageHeader title="节点申请" subtitle="分享、区域与超级节点" :show-search="false" />

    <div v-if="loading && !nodeStore.loaded" class="page-state">正在加载节点…</div>
    <div v-else-if="errorMessage && !nodeStore.loaded" class="page-state error">{{ errorMessage }}</div>
    <template v-else>
      <section class="node-grid" aria-label="节点类型">
        <button
          v-if="share"
          type="button"
          class="node-tile"
          :style="{ background: share.accent }"
          @click="paymentOpen = true"
        >
          {{ share.name }}
          <small>剩余 {{ share.remainingShares }} 份</small>
        </button>
        <RouterLink
          v-for="product in catalog"
          :key="product.id"
          class="node-tile"
          :to="product.path"
          :style="{ background: product.accent }"
        >
          {{ product.name }}
          <small>剩余 {{ product.remainingShares }} 份</small>
        </RouterLink>
      </section>

      <p class="order-hint" style="margin: 0 16px" role="status">{{ announcement }}</p>

      <article v-for="item in applications" :key="item.id" class="node-record">
        <h3>{{ item.kindName }} · {{ item.shares }} 份</h3>
        <p>{{ item.amount }} USDT · {{ item.paymentMethod }} · {{ item.createdAt }}</p>
      </article>
    </template>

    <AppPicker
      v-model="paymentOpen"
      title="选择支付方式"
      :columns="paymentOptions"
      @confirm="confirmShare"
    />
  </div>
</template>
