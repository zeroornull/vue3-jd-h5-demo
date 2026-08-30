import { effectScope } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type {
  SendVerificationCodeInput,
  SendVerificationCodeResult,
} from '@/types/auth'

const api = vi.hoisted(() => ({
  sendVerificationCode: vi.fn<
    (input: SendVerificationCodeInput) => Promise<SendVerificationCodeResult>
  >(),
}))

vi.mock('@/api/auth', () => api)

import { useVerificationCode } from '../useVerificationCode'

describe('useVerificationCode', () => {
  afterEach(() => {
    vi.useRealTimers()
    api.sendVerificationCode.mockReset()
  })

  it('exposes the development code and counts down without duplicate sends', async () => {
    vi.useFakeTimers()
    api.sendVerificationCode.mockResolvedValue({
      expiresInSeconds: 2,
      developmentCode: '123456',
    })
    const scope = effectScope()
    const verification = scope.run(useVerificationCode)!

    expect(
      await verification.send({
        channel: 'email',
        identifier: 'new@example.com',
        purpose: 'register',
      }),
    ).toBe(true)
    expect(verification.statusMessage.value).toContain('123456')
    expect(verification.cooldown.value).toBe(2)
    expect(
      await verification.send({
        channel: 'email',
        identifier: 'new@example.com',
        purpose: 'register',
      }),
    ).toBe(false)

    await vi.advanceTimersByTimeAsync(2000)
    expect(verification.cooldown.value).toBe(0)
    scope.stop()
  })
})
