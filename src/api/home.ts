import { http } from './http'
import { parseHomeData } from './payloads/home'
import { readApiData } from './types'
import type { HomeData } from '@/types/catalog'

export async function getHomeData(): Promise<HomeData> {
  return readApiData(http.get<unknown>('/home'), parseHomeData)
}
