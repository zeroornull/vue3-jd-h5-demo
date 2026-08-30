export type FocusKind = 'product' | 'store'

export interface FocusSnapshot {
  productIds: string[]
  storeIds: string[]
}

export interface ToggleFocusInput {
  kind: FocusKind
  id: string
}

export interface ToggleFocusResult extends FocusSnapshot {
  followed: boolean
}
