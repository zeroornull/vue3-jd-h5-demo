import { http } from './http'
import { parseHotSearchTerms } from './payloads/home'
import { readApiData } from './types'
import type { HotSearchTerm } from '@/types/catalog'

export async function getHotSearchTerms(): Promise<HotSearchTerm[]> {
  return readApiData(http.get<unknown>('/search/hot'), parseHotSearchTerms)
}
