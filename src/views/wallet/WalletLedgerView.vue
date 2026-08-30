<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'

import PageHeader from '@/components/PageHeader.vue'
import { useWalletStore } from '@/stores/wallet'
import type { LedgerKind, WalletAccountId } from '@/types/wallet'
import { formatCm, formatCny, LEDGER_KIND_LABELS } from '@/types/wallet'

defineOptions({ name: 'WalletLedgerView' })

const route = useRoute()
const walletStore = useWalletStore()
const { profits, ledgerMonths } = storeToRefs(walletStore)
const month = ref('')
const kind = ref<LedgerKind | 'all'>('all')

const accountId = computed<WalletAccountId>(() =>
  route.name === 'consumerWallet' ? 'consumer' : 'balance',
)
const account = computed(() => walletStore.findAccount(accountId.value))
const entries = computed(() => walletStore.ledgersFor(accountId.value, month.value, kind.value))
const filteredTotal = computed(() => entries.value.reduce((sum, entry) => sum + entry.amount, 0))
const title = computed(() => account.value?.name ?? '钱包明细')

onMounted(() => {
  void walletStore.load().catch(() => undefined)
})
</script>

<template>
  <div class="wallet-page">
    <PageHeader :title="title" :show-search="false" />
    <section class="wallet-hero">
      <p>钱包总额</p>
      <h2>{{ formatCm(account?.cm ?? 0) }}</h2>
      <p>{{ formatCny(account?.cny ?? 0) }}</p>
    </section>

    <section class="wallet-sheet" aria-label="收益占比">
      <strong>收益占比</strong>
      <ul class="profit-list">
        <li v-for="item in profits" :key="item.id">
          <span>
            <i :style="{ background: item.color, display: 'inline-block', marginRight: '8px' }" />
            {{ item.label }}
          </span>
          <span>{{ formatCm(item.cm) }}</span>
        </li>
      </ul>
    </section>

    <div class="wallet-filters">
      <select v-model="month" aria-label="筛选月份">
        <option value="">全部月份</option>
        <option v-for="value in ledgerMonths" :key="value" :value="value">{{ value }}</option>
      </select>
      <select v-model="kind" aria-label="筛选类型">
        <option v-for="(label, key) in LEDGER_KIND_LABELS" :key="key" :value="key">{{ label }}</option>
      </select>
      <span>总明细: {{ formatCm(filteredTotal) }}</span>
    </div>

    <van-empty v-if="entries.length === 0" description="这个筛选下没有明细" />
    <article v-for="entry in entries" :key="entry.id" class="ledger-card">
      <header>
        <strong>{{ entry.time }}</strong>
        <span
          class="kind-chip"
          :class="{ release: entry.kind === 'pool-release', claim: entry.kind === 'claim' }"
        >
          {{ entry.kindLabel }}
        </span>
      </header>
      <p>单号：{{ entry.orderNo }}　金额：{{ entry.amount }}</p>
      <p>转换ID：{{ entry.txId }}　{{ entry.status === 'completed' ? '已完成' : entry.status }}</p>
    </article>
  </div>
</template>
