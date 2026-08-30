import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createNodeSeed } from '@/mocks/node-data'
import type { NodeApplication, NodeSnapshot } from '@/types/node'

const api = vi.hoisted(() => ({
  getNodeSnapshot: vi.fn<() => Promise<NodeSnapshot>>(),
  applyNode: vi.fn<(input: unknown) => Promise<NodeApplication>>(),
}))

vi.mock('@/api/node', () => api)

import { useNodeStore } from '../node'

describe('useNodeStore', () => {
  const seed = createNodeSeed()

  beforeEach(() => {
    setActivePinia(createPinia())
    api.getNodeSnapshot.mockReset()
    api.applyNode.mockReset()
    api.getNodeSnapshot.mockResolvedValue({
      products: structuredClone(seed.products),
      applications: [],
    })
  })

  it('loads once and exposes typed node products', async () => {
    const store = useNodeStore()
    await store.load()
    await store.load()

    expect(api.getNodeSnapshot).toHaveBeenCalledTimes(1)
    expect(store.findProduct('area')?.title).toBe('区域节点申请')
    expect(store.products).toHaveLength(6)
  })

  it('applies a node and decreases remaining shares', async () => {
    const store = useNodeStore()
    await store.load()
    const remaining = store.findProduct('share')?.remainingShares ?? 0

    api.applyNode.mockResolvedValue({
      id: 'node-app-1',
      kind: 'share',
      kindName: '分享节点',
      shares: 1,
      amount: 1003,
      paymentMethod: 'CoinPay',
      createdAt: '2026-08-30 12:00:00',
    })

    await store.apply({ kind: 'share', shares: 1, paymentMethod: 'CoinPay' })
    expect(store.findProduct('share')?.remainingShares).toBe(remaining - 1)
    expect(store.applications[0]?.id).toBe('node-app-1')
  })
})
