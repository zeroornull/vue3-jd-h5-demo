<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'

import PageHeader from '@/components/PageHeader.vue'
import { useWalletStore } from '@/stores/wallet'
import { formatCm, formatCny } from '@/types/wallet'

defineOptions({ name: 'WalletHomeView' })

const walletStore = useWalletStore()
const { pools, loading, errorMessage } = storeToRefs(walletStore)

onMounted(() => {
  void walletStore.load().catch(() => undefined)
})
</script>

<template>
  <div class="wallet-page">
    <PageHeader title="我的钱包" subtitle="消费、余额与矿池" :show-search="false" />

    <div v-if="loading && !walletStore.loaded" class="page-state">正在加载钱包…</div>
    <div v-else-if="errorMessage && !walletStore.loaded" class="page-state error">{{ errorMessage }}</div>
    <template v-else>
      <section class="wallet-grid" aria-label="矿池">
        <RouterLink
          v-for="pool in pools"
          :key="pool.id"
          class="pool-tile"
          :to="pool.path"
          :style="{ background: `${pool.accent}33` }"
        >
          <strong>{{ pool.name }}</strong>
          <span>{{ formatCm(pool.amount) }}</span>
        </RouterLink>
      </section>

      <RouterLink
        v-for="account in walletStore.accounts"
        :key="account.id"
        class="wallet-account"
        :to="account.id === 'consumer' ? '/wallet/consumerWallet' : '/wallet/balanceWallet'"
      >
        <div>
          <b>{{ account.name }}</b>
          <div class="cm">{{ formatCm(account.cm) }}</div>
          <div class="cny">{{ formatCny(account.cny) }}</div>
        </div>
        <span>查看明细</span>
      </RouterLink>
    </template>
  </div>
</template>
