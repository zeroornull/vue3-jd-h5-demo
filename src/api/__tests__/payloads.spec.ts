import { describe, expect, it } from 'vitest'

import { HttpError } from '../http'
import {
  parseAuthSession,
  parseCatalogData,
  parseFocusSnapshot,
  parseHomeData,
  parseNodeSnapshot,
  parseOrderSnapshot,
  parseProfileSnapshot,
  parseToggleFocusResult,
  parseWalletSnapshot,
} from '../payloads'
import { catalogData, homeData } from '@/mocks/catalog-data'
import { createFocusSeed } from '@/mocks/focus-data'
import { createNodeSeed } from '@/mocks/node-data'
import { createOrderSeed } from '@/mocks/order-data'
import { createProfileSeed } from '@/mocks/profile-data'
import { createWalletSeed } from '@/mocks/wallet-data'

describe('API payload parsers', () => {
  it('accepts current mock catalog, home, order, profile, wallet, node and focus snapshots', () => {
    expect(parseCatalogData(catalogData).products).toHaveLength(8)
    expect(parseHomeData(homeData).banners[0]?.id).toBe('banner-1')
    expect(parseOrderSnapshot(createOrderSeed()).orders.length).toBeGreaterThan(0)
    expect(parseProfileSnapshot(createProfileSeed()).profile.displayName).toBe('演示用户')
    expect(parseWalletSnapshot(createWalletSeed()).accounts).toHaveLength(2)
    expect(parseNodeSnapshot({ products: createNodeSeed().products, applications: [] }).products).toHaveLength(6)
    expect(parseFocusSnapshot(createFocusSeed()).storeIds).toEqual(['store-1'])
    expect(
      parseToggleFocusResult({ ...createFocusSeed(), followed: true }).followed,
    ).toBe(true)
  })

  it('rejects a successful envelope whose data is the wrong shape', () => {
    expect(() => parseAuthSession({ token: 'x' })).toThrow(HttpError)
    expect(() => parseCatalogData({ products: [] })).toThrow(/Invalid API payload/)
    expect(() => parseOrderSnapshot({ orders: [{ id: 'order-1' }], appeals: [] })).toThrow(
      HttpError,
    )
  })
})
