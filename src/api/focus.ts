import { http } from './http'
import type { ApiResponse } from './types'
import { unwrapApiResponse } from './types'
import type { FocusSnapshot, ToggleFocusInput, ToggleFocusResult } from '@/types/focus'

export async function getFocusSnapshot(): Promise<FocusSnapshot> {
  const response = await http.get<ApiResponse<FocusSnapshot>>('/focus')
  return unwrapApiResponse(response.data)
}

export async function toggleFocus(input: ToggleFocusInput): Promise<ToggleFocusResult> {
  const response = await http.post<ApiResponse<ToggleFocusResult>>('/focus/toggle', input)
  return unwrapApiResponse(response.data)
}
