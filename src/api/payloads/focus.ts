import { expectBoolean, expectRecord, expectStringArray } from '../types'
import type { FocusSnapshot, ToggleFocusResult } from '@/types/focus'

export function parseFocusSnapshot(value: unknown): FocusSnapshot {
  const record = expectRecord(value, 'focus')
  return {
    productIds: expectStringArray(record.productIds, 'focus.productIds'),
    storeIds: expectStringArray(record.storeIds, 'focus.storeIds'),
  }
}

export function parseToggleFocusResult(value: unknown): ToggleFocusResult {
  const snapshot = parseFocusSnapshot(value)
  const record = expectRecord(value, 'focus')
  return {
    ...snapshot,
    followed: expectBoolean(record.followed, 'focus.followed'),
  }
}
