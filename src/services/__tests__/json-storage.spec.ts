import { describe, expect, it } from 'vitest'

import { readJson, writeJson, type StorageLike } from '../json-storage'

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

function isUser(value: unknown): value is { id: string } {
  return typeof value === 'object' && value !== null && 'id' in value && typeof value.id === 'string'
}

describe('json-storage', () => {
  it('writes JSON and reads it back when the guard passes', () => {
    const storage = new MemoryStorage()

    expect(writeJson('authUser', { id: 'user-1' }, storage)).toBe(true)
    expect(readJson('authUser', isUser, storage)).toEqual({ id: 'user-1' })
  })

  it('clears invalid JSON or rejected shapes so later hydration can recover', () => {
    const storage = new MemoryStorage()
    storage.setItem('authUser', '{not-json')
    expect(readJson('authUser', isUser, storage)).toBeUndefined()
    expect(storage.getItem('authUser')).toBeNull()

    writeJson('authUser', { name: 'x' }, storage)
    expect(readJson('authUser', isUser, storage)).toBeUndefined()
    expect(storage.getItem('authUser')).toBeNull()
  })
})
