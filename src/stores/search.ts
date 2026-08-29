import { ref } from 'vue'
import { defineStore } from 'pinia'

import { readJson, writeJson } from '@/services/json-storage'
import type { StorageLike } from '@/services/json-storage'

export const SEARCH_HISTORY_STORAGE_KEY = 'searchHistory'

function isSearchHistory(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

export const useSearchStore = defineStore('search', () => {
  const searchHistory = ref<string[]>([])

  function hydrate(storage?: StorageLike): void {
    searchHistory.value =
      readJson(SEARCH_HISTORY_STORAGE_KEY, isSearchHistory, storage) ?? []
  }

  function setHistory(history: readonly string[], storage?: StorageLike): boolean {
    searchHistory.value = [...history]
    return writeJson(SEARCH_HISTORY_STORAGE_KEY, searchHistory.value, storage)
  }

  function addHistory(keyword: string, storage?: StorageLike): boolean {
    const normalizedKeyword = keyword.trim()

    if (!normalizedKeyword) {
      return false
    }

    const deduplicated = Array.from(
      new Set([normalizedKeyword, ...searchHistory.value]),
    )

    return setHistory(deduplicated, storage)
  }

  function clearHistory(storage?: StorageLike): boolean {
    return setHistory([], storage)
  }

  return {
    searchHistory,
    hydrate,
    setHistory,
    addHistory,
    clearHistory,
  }
})
