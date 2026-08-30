export type WalletAccountId = 'consumer' | 'balance'
export type PoolId = 'consumption' | 'advertisement' | 'node'
export type LedgerKind = 'deposit' | 'pool-release' | 'claim'

export interface WalletAccount {
  id: WalletAccountId
  name: string
  cm: number
  cny: number
}

export interface MiningPool {
  id: PoolId
  name: string
  amount: number
  hashpower: number
  accent: string
  path: string
}

export interface ProfitShare {
  id: string
  label: string
  cm: number
  color: string
}

export interface LedgerEntry {
  id: string
  accountId: WalletAccountId
  time: string
  month: string
  status: 'completed'
  kind: LedgerKind
  kindLabel: string
  orderNo: string
  amount: number
  txId: string
}

export interface PoolReward {
  id: string
  poolId: PoolId
  date: string
  title: string
  tag: string
  amount: number
  unit: string
}

export interface WalletSnapshot {
  accounts: WalletAccount[]
  pools: MiningPool[]
  profits: ProfitShare[]
  ledgers: LedgerEntry[]
  rewards: PoolReward[]
}

export const LEDGER_KIND_LABELS: Record<LedgerKind | 'all', string> = {
  all: '全部类型',
  deposit: '充币',
  'pool-release': '矿池释放',
  claim: '领取分红',
}

export const CM_TO_CNY = 0.1

export function formatCm(value: number): string {
  return `${value.toLocaleString('zh-CN', { maximumFractionDigits: 4 })} CM`
}

export function formatCny(value: number): string {
  return `≈${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CNY`
}
