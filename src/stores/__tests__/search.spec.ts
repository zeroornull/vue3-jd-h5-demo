import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import type { StorageLike } from '@/services/json-storage'
import { SEARCH_HISTORY_STORAGE_KEY, useSearchStore } from '../search'

class MemoryStorage implements StorageLike {
  readonly values = new Map<string, string>()

  getItem(key: string): string | null {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value)
  }

  removeItem(key: string): void {
    this.values.delete(key)
  }
}

describe('useSearchStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('hydrates the legacy searchHistory JSON contract', () => {
    const storage = new MemoryStorage()
    storage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(['手机', '手表']))
    const store = useSearchStore()

    store.hydrate(storage)

    expect(store.searchHistory).toEqual(['手机', '手表'])
  })

  it('self-heals malformed or wrongly shaped persisted data', () => {
    const storage = new MemoryStorage()
    const store = useSearchStore()

    storage.setItem(SEARCH_HISTORY_STORAGE_KEY, '{broken')
    store.hydrate(storage)
    expect(store.searchHistory).toEqual([])
    expect(storage.getItem(SEARCH_HISTORY_STORAGE_KEY)).toBeNull()

    storage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify([1, 2]))
    store.hydrate(storage)
    expect(storage.getItem(SEARCH_HISTORY_STORAGE_KEY)).toBeNull()
  })

  it('adds the newest keyword first, deduplicates, and persists', () => {
    const storage = new MemoryStorage()
    const store = useSearchStore()

    store.setHistory(['手机', '手表'], storage)
    expect(store.addHistory(' 手表 ', storage)).toBe(true)

    expect(store.searchHistory).toEqual(['手表', '手机'])
    expect(JSON.parse(storage.getItem(SEARCH_HISTORY_STORAGE_KEY) ?? 'null')).toEqual([
      '手表',
      '手机',
    ])
  })

  it('ignores blank keywords and clears persisted history explicitly', () => {
    const storage = new MemoryStorage()
    const store = useSearchStore()

    store.setHistory(['手机'], storage)
    expect(store.addHistory('   ', storage)).toBe(false)
    expect(store.searchHistory).toEqual(['手机'])

    expect(store.clearHistory(storage)).toBe(true)
    expect(store.searchHistory).toEqual([])
    expect(storage.getItem(SEARCH_HISTORY_STORAGE_KEY)).toBe('[]')
  })
})
