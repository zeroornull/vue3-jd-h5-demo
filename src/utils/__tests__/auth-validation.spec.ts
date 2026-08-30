import { describe, expect, it } from 'vitest'

import {
  inferAuthChannel,
  safeRedirectPath,
  validateIdentifier,
  validatePassword,
  validatePasswordConfirmation,
  validateVerificationCode,
} from '../auth-validation'

describe('auth validation', () => {
  it('validates email and mainland mobile identifiers', () => {
    expect(validateIdentifier('email', 'demo@example.com')).toBeUndefined()
    expect(validateIdentifier('email', 'bad-email')).toBe('邮箱格式不正确')
    expect(validateIdentifier('phone', '13800138000')).toBeUndefined()
    expect(validateIdentifier('phone', '123')).toBe('手机号格式不正确')
    expect(inferAuthChannel('demo@example.com')).toBe('email')
    expect(inferAuthChannel('13800138000')).toBe('phone')
  })

  it('validates six-digit codes and strong-enough passwords', () => {
    expect(validateVerificationCode('123456')).toBeUndefined()
    expect(validateVerificationCode('123')).toBe('请输入 6 位数字验证码')
    expect(validatePassword('Password123')).toBeUndefined()
    expect(validatePassword('password')).toBe('密码必须同时包含字母和数字')
    expect(validatePasswordConfirmation('Password123', 'Password123')).toBeUndefined()
    expect(validatePasswordConfirmation('Password123', 'Password321')).toBe(
      '两次输入的密码不一致',
    )
  })

  it('only accepts same-origin absolute redirect paths', () => {
    expect(safeRedirectPath('/order?tab=all')).toBe('/order?tab=all')
    expect(safeRedirectPath('//evil.example')).toBe('/index')
    expect(safeRedirectPath('https://evil.example')).toBe('/index')
    expect(safeRedirectPath(undefined, '/mine')).toBe('/mine')
  })
})
