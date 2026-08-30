import { http } from './http'
import type { ApiResponse } from './types'
import { unwrapApiResponse } from './types'
import type { HotSearchTerm } from '@/types/catalog'

export async function getHotSearchTerms(): Promise<HotSearchTerm[]> {
  const response = await http.get<ApiResponse<HotSearchTerm[]>>('/search/hot')
  return unwrapApiResponse(response.data)
}
