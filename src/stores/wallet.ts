import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { claimPoolReward, getWalletSnapshot } from '@/api/wallet'
import type {
  LedgerEntry,
  LedgerKind,
  MiningPool,
  PoolId,
  ProfitShare,
  WalletAccount,
  WalletAccountId,
  WalletSnapshot,
} from '@/types/wallet'
import { CM_TO_CNY } from '@/types/wallet'

export const useWalletStore = defineStore('wallet', () => {
  const accounts = ref<WalletAccount[]>([])
  const pools = ref<MiningPool[]>([])
  const profits = ref<ProfitShare[]>([])
  const ledgers = ref<LedgerEntry[]>([])
  const rewards = ref<WalletSnapshot['rewards']>([])
  const loaded = ref(false)
  const loading = ref(false)
  const errorMessage = ref('')

  function applySnapshot(snapshot: WalletSnapshot): void {
    accounts.value = snapshot.accounts
    pools.value = snapshot.pools
    profits.value = snapshot.profits
    ledgers.value = snapshot.ledgers
    rewards.value = snapshot.rewards
    loaded.value = true
    errorMessage.value = ''
  }

  async function load(force = false): Promise<void> {
    if (loaded.value && !force) {
      return
    }

    loading.value = true
    errorMessage.value = ''

    try {
      applySnapshot(await getWalletSnapshot())
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '钱包数据加载失败'
      throw error
    } finally {
      loading.value = false
    }
  }

  function findAccount(accountId: WalletAccountId): WalletAccount | undefined {
    return accounts.value.find((account) => account.id === accountId)
  }

  function findPool(poolId: PoolId): MiningPool | undefined {
    return pools.value.find((pool) => pool.id === poolId)
  }

  const ledgerMonths = computed(() =>
    [...new Set(ledgers.value.map((entry) => entry.month))].sort().reverse(),
  )

  function ledgersFor(
    accountId: WalletAccountId,
    month: string,
    kind: LedgerKind | 'all',
  ): LedgerEntry[] {
    return ledgers.value.filter((entry) => {
      if (entry.accountId !== accountId) {
        return false
      }

      if (month && entry.month !== month) {
        return false
      }

      return kind === 'all' || entry.kind === kind
    })
  }

  function rewardsFor(poolId: PoolId) {
    return rewards.value.filter((reward) => reward.poolId === poolId)
  }

  async function claim(poolId: PoolId): Promise<LedgerEntry> {
    const entry = await claimPoolReward(poolId)
    ledgers.value = [entry, ...ledgers.value]
    accounts.value = accounts.value.map((account) =>
      account.id === 'balance'
        ? {
            ...account,
            cm: account.cm + entry.amount,
            cny: Number(((account.cm + entry.amount) * CM_TO_CNY).toFixed(2)),
          }
        : account,
    )
    return entry
  }

  return {
    accounts,
    pools,
    profits,
    ledgers,
    rewards,
    loaded,
    loading,
    errorMessage,
    ledgerMonths,
    applySnapshot,
    load,
    findAccount,
    findPool,
    ledgersFor,
    rewardsFor,
    claim,
  }
})
