import { http } from './http'
import type { ApiResponse } from './types'
import { unwrapApiResponse } from './types'
import type { CatalogData } from '@/types/catalog'

export async function getCatalogData(): Promise<CatalogData> {
  const response = await http.get<ApiResponse<CatalogData>>('/catalog')
  return unwrapApiResponse(response.data)
}
