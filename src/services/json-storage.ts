export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

function browserStorage(): StorageLike | undefined {
  return typeof window === 'undefined' ? undefined : window.localStorage
}

export function readJson<T>(
  key: string,
  isValid: (value: unknown) => value is T,
  storage: StorageLike | undefined = browserStorage(),
): T | undefined {
  if (!storage) {
    return undefined
  }

  const rawValue = storage.getItem(key)

  if (rawValue === null) {
    return undefined
  }

  try {
    const value: unknown = JSON.parse(rawValue)

    if (isValid(value)) {
      return value
    }
  } catch {
    // Invalid JSON is removed below so subsequent hydration attempts can recover.
  }

  storage.removeItem(key)
  return undefined
}

export function writeJson(
  key: string,
  value: unknown,
  storage: StorageLike | undefined = browserStorage(),
): boolean {
  if (!storage) {
    return false
  }

  try {
    storage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}
