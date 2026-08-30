import type { AuthChannel } from '@/types/auth'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^1[3-9]\d{9}$/
const CODE_PATTERN = /^\d{6}$/

export function inferAuthChannel(identifier: string): AuthChannel {
  return identifier.includes('@') ? 'email' : 'phone'
}

export function validateIdentifier(channel: AuthChannel, value: string): string | undefined {
  const identifier = value.trim()

  if (!identifier) {
    return channel === 'email' ? '请输入邮箱地址' : '请输入手机号'
  }

  if (channel === 'email' && !EMAIL_PATTERN.test(identifier)) {
    return '邮箱格式不正确'
  }

  if (channel === 'phone' && !PHONE_PATTERN.test(identifier)) {
    return '手机号格式不正确'
  }

  return undefined
}

export function validateVerificationCode(value: string): string | undefined {
  return CODE_PATTERN.test(value.trim()) ? undefined : '请输入 6 位数字验证码'
}

export function validatePassword(value: string): string | undefined {
  if (value.length < 8 || value.length > 64) {
    return '密码长度必须为 8～64 位'
  }

  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    return '密码必须同时包含字母和数字'
  }

  return undefined
}

export function validatePasswordConfirmation(
  password: string,
  confirmation: string,
): string | undefined {
  return password === confirmation ? undefined : '两次输入的密码不一致'
}

export function safeRedirectPath(value: unknown, fallback = '/index'): string {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')
    ? value
    : fallback
}
