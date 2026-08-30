import { http } from './http'
import type { ApiResponse } from './types'
import { unwrapApiResponse } from './types'
import type {
  AuthSession,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  SendVerificationCodeInput,
  SendVerificationCodeResult,
} from '@/types/auth'

export async function login(input: LoginInput): Promise<AuthSession> {
  const response = await http.post<ApiResponse<AuthSession>>('/auth/login', input)
  return unwrapApiResponse(response.data)
}

export async function sendVerificationCode(
  input: SendVerificationCodeInput,
): Promise<SendVerificationCodeResult> {
  const response = await http.post<ApiResponse<SendVerificationCodeResult>>(
    '/auth/send-code',
    input,
  )
  return unwrapApiResponse(response.data)
}

export async function register(input: RegisterInput): Promise<{ identifier: string }> {
  const response = await http.post<ApiResponse<{ identifier: string }>>('/auth/register', input)
  return unwrapApiResponse(response.data)
}

export async function resetPassword(
  input: ResetPasswordInput,
): Promise<{ identifier: string }> {
  const response = await http.post<ApiResponse<{ identifier: string }>>(
    '/auth/reset-password',
    input,
  )
  return unwrapApiResponse(response.data)
}
