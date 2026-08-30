import { describe, expect, it } from 'vitest'

import { formatPrice } from '../money'

describe('formatPrice', () => {
  it('formats a finite amount with a yen prefix and two decimals', () => {
    expect(formatPrice(125)).toBe('¥125.00')
    expect(formatPrice(89.5)).toBe('¥89.50')
  })
})
