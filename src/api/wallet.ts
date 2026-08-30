import { http } from './http'
import type { ApiResponse } from './types'
import { unwrapApiResponse } from './types'
import type { LedgerEntry, PoolId, WalletSnapshot } from '@/types/wallet'

export async function getWalletSnapshot(): Promise<WalletSnapshot> {
  const response = await http.get<ApiResponse<WalletSnapshot>>('/wallet')
  return unwrapApiResponse(response.data)
}

export async function claimPoolReward(poolId: PoolId): Promise<LedgerEntry> {
  const response = await http.post<ApiResponse<LedgerEntry>>('/wallet/claim', { poolId })
  return unwrapApiResponse(response.data)
}
