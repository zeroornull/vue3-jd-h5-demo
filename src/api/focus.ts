import { http } from './http'
import { parseFocusSnapshot, parseToggleFocusResult } from './payloads/focus'
import { readApiData } from './types'
import type { FocusSnapshot, ToggleFocusInput, ToggleFocusResult } from '@/types/focus'

export async function getFocusSnapshot(): Promise<FocusSnapshot> {
  return readApiData(http.get<unknown>('/focus'), parseFocusSnapshot)
}

export async function toggleFocus(input: ToggleFocusInput): Promise<ToggleFocusResult> {
  return readApiData(http.post<unknown>('/focus/toggle', input), parseToggleFocusResult)
}
