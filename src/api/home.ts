import { http } from './http'
import type { ApiResponse } from './types'
import { unwrapApiResponse } from './types'
import type { HomeData } from '@/types/catalog'

export async function getHomeData(): Promise<HomeData> {
  const response = await http.get<ApiResponse<HomeData>>('/home')
  return unwrapApiResponse(response.data)
}
