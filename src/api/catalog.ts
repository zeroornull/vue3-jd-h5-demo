import { http } from './http'
import { parseCatalogData } from './payloads'
import { readApiData } from './types'
import type { CatalogData } from '@/types/catalog'

export async function getCatalogData(): Promise<CatalogData> {
  return readApiData(http.get<unknown>('/catalog'), parseCatalogData)
}
