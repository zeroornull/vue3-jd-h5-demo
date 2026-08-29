import { describe, expect, it } from 'vitest'

import router from '../index'

describe('migration placeholder route', () => {
  it('matches the application root without importing legacy routes', () => {
    const resolved = router.resolve('/')

    expect(resolved.name).toBe('migration-placeholder')
    expect(resolved.matched).toHaveLength(1)
  })
})
