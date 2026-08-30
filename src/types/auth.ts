export type AuthChannel = 'email' | 'phone'
export type VerificationPurpose = 'register' | 'reset-password'

export interface AuthUser {
  id: string
  identifier: string
  displayName: string
}

export interface AuthSession {
  token: string
  user: AuthUser
}

export interface LoginInput {
  identifier: string
  password: string
}

export interface SendVerificationCodeInput {
  channel: AuthChannel
  identifier: string
  purpose: VerificationPurpose
}

export interface SendVerificationCodeResult {
  expiresInSeconds: number
  developmentCode?: string
}

export interface RegisterInput {
  channel: AuthChannel
  identifier: string
  verificationCode: string
  displayName: string
  password: string
}

export interface ResetPasswordInput {
  channel: AuthChannel
  identifier: string
  verificationCode: string
  password: string
}

export interface RegistrationDraft {
  channel: AuthChannel
  identifier: string
  verificationCode: string
}
