import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createWalletSeed } from '@/mocks/wallet-data'
import type { LedgerEntry, WalletSnapshot } from '@/types/wallet'

const api = vi.hoisted(() => ({
  getWalletSnapshot: vi.fn<() => Promise<WalletSnapshot>>(),
  claimPoolReward: vi.fn<(poolId: string) => Promise<LedgerEntry>>(),
}))

vi.mock('@/api/wallet', () => api)

import { useWalletStore } from '../wallet'

describe('useWalletStore', () => {
  const seed = createWalletSeed()

  beforeEach(() => {
    setActivePinia(createPinia())
    api.getWalletSnapshot.mockReset()
    api.claimPoolReward.mockReset()
    api.getWalletSnapshot.mockResolvedValue(structuredClone(seed))
  })

  it('loads once and filters ledgers by account and kind', async () => {
    const store = useWalletStore()

    await store.load()
    await store.load()

    expect(api.getWalletSnapshot).toHaveBeenCalledTimes(1)
    expect(store.findAccount('consumer')?.name).toBe('消费钱包')
    expect(store.findPool('advertisement')?.path).toBe('/pool/advertisementPool')
    expect(store.ledgersFor('balance', '', 'all')).toHaveLength(3)
    expect(store.ledgersFor('consumer', '2026-08', 'deposit')).toHaveLength(1)
    expect(store.rewardsFor('node')).toHaveLength(2)
  })

  it('claims a pool reward into the balance wallet', async () => {
    const store = useWalletStore()
    await store.load()
    const before = store.findAccount('balance')?.cm ?? 0

    api.claimPoolReward.mockResolvedValue({
      id: 'ledger-claim-x',
      accountId: 'balance',
      time: '2026-08-30 12:00:00',
      month: '2026-08',
      status: 'completed',
      kind: 'claim',
      kindLabel: '消费矿池领取',
      orderNo: 'CL000099',
      amount: 69,
      txId: '0xcl…63',
    })

    await store.claim('consumption')
    expect(store.findAccount('balance')?.cm).toBe(before + 69)
    expect(store.ledgers[0]?.kind).toBe('claim')
  })

  it('recovers from a failed load', async () => {
    const store = useWalletStore()
    api.getWalletSnapshot.mockRejectedValueOnce(new Error('offline'))
    await expect(store.load()).rejects.toThrow('offline')
    await store.load(true)
    expect(store.pools).toHaveLength(3)
  })
})
