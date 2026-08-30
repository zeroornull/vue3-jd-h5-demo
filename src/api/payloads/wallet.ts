import { expectArray, expectNumber, expectOneOf, expectRecord, expectString } from '../types'
import type {
  LedgerEntry,
  LedgerKind,
  MiningPool,
  PoolId,
  PoolReward,
  ProfitShare,
  WalletAccount,
  WalletAccountId,
  WalletSnapshot,
} from '@/types/wallet'

const WALLET_ACCOUNT_IDS = ['consumer', 'balance'] as const satisfies readonly WalletAccountId[]
const POOL_IDS = ['consumption', 'advertisement', 'node'] as const satisfies readonly PoolId[]
const LEDGER_KINDS = ['deposit', 'pool-release', 'claim'] as const satisfies readonly LedgerKind[]

function parseWalletAccount(value: unknown): WalletAccount {
  const record = expectRecord(value, 'account')
  return {
    id: expectOneOf(record.id, WALLET_ACCOUNT_IDS, 'account.id'),
    name: expectString(record.name, 'account.name'),
    cm: expectNumber(record.cm, 'account.cm'),
    cny: expectNumber(record.cny, 'account.cny'),
  }
}

function parsePool(value: unknown): MiningPool {
  const record = expectRecord(value, 'pool')
  return {
    id: expectOneOf(record.id, POOL_IDS, 'pool.id'),
    name: expectString(record.name, 'pool.name'),
    amount: expectNumber(record.amount, 'pool.amount'),
    hashpower: expectNumber(record.hashpower, 'pool.hashpower'),
    accent: expectString(record.accent, 'pool.accent'),
    path: expectString(record.path, 'pool.path'),
  }
}

function parseProfit(value: unknown): ProfitShare {
  const record = expectRecord(value, 'profit')
  return {
    id: expectString(record.id, 'profit.id'),
    label: expectString(record.label, 'profit.label'),
    cm: expectNumber(record.cm, 'profit.cm'),
    color: expectString(record.color, 'profit.color'),
  }
}

export function parseLedgerEntry(value: unknown): LedgerEntry {
  const record = expectRecord(value, 'ledger')
  return {
    id: expectString(record.id, 'ledger.id'),
    accountId: expectOneOf(record.accountId, WALLET_ACCOUNT_IDS, 'ledger.accountId'),
    time: expectString(record.time, 'ledger.time'),
    month: expectString(record.month, 'ledger.month'),
    status: expectOneOf(record.status, ['completed'] as const, 'ledger.status'),
    kind: expectOneOf(record.kind, LEDGER_KINDS, 'ledger.kind'),
    kindLabel: expectString(record.kindLabel, 'ledger.kindLabel'),
    orderNo: expectString(record.orderNo, 'ledger.orderNo'),
    amount: expectNumber(record.amount, 'ledger.amount'),
    txId: expectString(record.txId, 'ledger.txId'),
  }
}

function parseReward(value: unknown): PoolReward {
  const record = expectRecord(value, 'reward')
  return {
    id: expectString(record.id, 'reward.id'),
    poolId: expectOneOf(record.poolId, POOL_IDS, 'reward.poolId'),
    date: expectString(record.date, 'reward.date'),
    title: expectString(record.title, 'reward.title'),
    tag: expectString(record.tag, 'reward.tag'),
    amount: expectNumber(record.amount, 'reward.amount'),
    unit: expectString(record.unit, 'reward.unit'),
  }
}

export function parseWalletSnapshot(value: unknown): WalletSnapshot {
  const record = expectRecord(value, 'wallet')
  return {
    accounts: expectArray(record.accounts, parseWalletAccount, 'accounts'),
    pools: expectArray(record.pools, parsePool, 'pools'),
    profits: expectArray(record.profits, parseProfit, 'profits'),
    ledgers: expectArray(record.ledgers, parseLedgerEntry, 'ledgers'),
    rewards: expectArray(record.rewards, parseReward, 'rewards'),
  }
}
