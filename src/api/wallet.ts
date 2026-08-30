import { http } from './http'
import { parseLedgerEntry, parseWalletSnapshot } from './payloads'
import { readApiData } from './types'
import type { LedgerEntry, PoolId, WalletSnapshot } from '@/types/wallet'

export async function getWalletSnapshot(): Promise<WalletSnapshot> {
  return readApiData(http.get<unknown>('/wallet'), parseWalletSnapshot)
}

export async function claimPoolReward(poolId: PoolId): Promise<LedgerEntry> {
  return readApiData(http.post<unknown>('/wallet/claim', { poolId }), parseLedgerEntry)
}
