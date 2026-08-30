import { http } from './http'
import { parseAuthSession, parseIdentifier, parseVerificationResult } from './payloads/auth'
import { readApiData } from './types'
import type {
  AuthSession,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  SendVerificationCodeInput,
  SendVerificationCodeResult,
} from '@/types/auth'

export async function login(input: LoginInput): Promise<AuthSession> {
  return readApiData(http.post<unknown>('/auth/login', input), parseAuthSession)
}

export async function sendVerificationCode(
  input: SendVerificationCodeInput,
): Promise<SendVerificationCodeResult> {
  return readApiData(http.post<unknown>('/auth/send-code', input), parseVerificationResult)
}

export async function register(input: RegisterInput): Promise<{ identifier: string }> {
  return readApiData(http.post<unknown>('/auth/register', input), parseIdentifier)
}

export async function resetPassword(
  input: ResetPasswordInput,
): Promise<{ identifier: string }> {
  return readApiData(http.post<unknown>('/auth/reset-password', input), parseIdentifier)
}
