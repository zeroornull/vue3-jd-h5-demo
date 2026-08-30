import { expectNumber, expectRecord, expectString, optionalString } from '../types'
import type { AuthSession, AuthUser, SendVerificationCodeResult } from '@/types/auth'

function parseAuthUser(value: unknown): AuthUser {
  const record = expectRecord(value, 'user')
  return {
    id: expectString(record.id, 'user.id'),
    identifier: expectString(record.identifier, 'user.identifier'),
    displayName: expectString(record.displayName, 'user.displayName'),
  }
}

export function parseAuthSession(value: unknown): AuthSession {
  const record = expectRecord(value, 'session')
  return {
    token: expectString(record.token, 'token'),
    user: parseAuthUser(record.user),
  }
}

export function parseVerificationResult(value: unknown): SendVerificationCodeResult {
  const record = expectRecord(value, 'verification')
  return {
    expiresInSeconds: expectNumber(record.expiresInSeconds, 'expiresInSeconds'),
    developmentCode: optionalString(record.developmentCode, 'developmentCode'),
  }
}

export function parseIdentifier(value: unknown): { identifier: string } {
  const record = expectRecord(value, 'identifier')
  return { identifier: expectString(record.identifier, 'identifier') }
}
