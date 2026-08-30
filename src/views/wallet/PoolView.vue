<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import PageHeader from '@/components/PageHeader.vue'
import { useWalletStore } from '@/stores/wallet'
import type { PoolId } from '@/types/wallet'

defineOptions({ name: 'PoolView' })

const route = useRoute()
const router = useRouter()
const walletStore = useWalletStore()
const claiming = ref(false)
const announcement = ref('')

const poolId = computed<PoolId>(() => {
  if (route.name === 'advertisementPool') {
    return 'advertisement'
  }

  if (route.name === 'nodePool') {
    return 'node'
  }

  return 'consumption'
})

const pool = computed(() => walletStore.findPool(poolId.value))
const rewards = computed(() => walletStore.rewardsFor(poolId.value))
const heroClass = computed(() => `pool-${poolId.value}`)

async function claim(): Promise<void> {
  claiming.value = true
  announcement.value = ''

  try {
    const entry = await walletStore.claim(poolId.value)
    announcement.value = `已领取 ${entry.amount} CM 到余额钱包`
    await router.push('/wallet/balanceWallet')
  } catch (error) {
    announcement.value = error instanceof Error ? error.message : '领取失败'
  } finally {
    claiming.value = false
  }
}

onMounted(() => {
  void walletStore.load().catch(() => undefined)
})
</script>

<template>
  <div class="wallet-page">
    <PageHeader :title="pool?.name ?? '矿池'" :show-search="false" />
    <section class="wallet-hero" :class="heroClass">
      <p>社区算力总额</p>
      <h2>{{ (pool?.hashpower ?? 0).toLocaleString('zh-CN') }} 算力</h2>
    </section>

    <article v-for="reward in rewards" :key="reward.id" class="reward-card">
      <div style="display: flex; gap: 10px; align-items: center">
        <span class="reward-mark" :class="{ week: reward.tag === '周' }">{{ reward.tag }}</span>
        <div>
          <p>{{ reward.date }}</p>
          <strong style="color: #0f172a">{{ reward.title }}</strong>
        </div>
      </div>
      <strong>+{{ reward.amount }} {{ reward.unit }}</strong>
    </article>

    <div class="order-footer" style="margin: 20px 16px">
      <p class="order-hint" role="status">{{ announcement }}</p>
      <button class="order-primary" type="button" :disabled="claiming" @click="claim">
        {{ claiming ? '领取中…' : `领取${pool?.name ?? ''}分红` }}
      </button>
    </div>
  </div>
</template>
