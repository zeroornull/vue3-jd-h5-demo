import { catalogData, homeData, hotSearchTerms } from './catalog-data.js'
import type {
  AuthChannel,
  AuthSession,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  SendVerificationCodeInput,
} from '../types/auth.js'

export interface MockResponse {
  status: number
  body: unknown
}

interface MockUser {
  id: string
  password: string
  displayName: string
}

const users = new Map<string, MockUser>([
  ['zhangsan', { id: 'user-zhangsan', password: '123456', displayName: '张三' }],
  ['tom', { id: 'user-tom', password: '123', displayName: 'Tom' }],
  [
    'demo@example.com',
    { id: 'user-demo-email', password: 'Password123', displayName: '演示用户' },
  ],
  [
    '13800138000',
    { id: 'user-demo-phone', password: 'Password123', displayName: '手机用户' },
  ],
])
const verificationCodes = new Map<string, string>()
const DEVELOPMENT_VERIFICATION_CODE = '123456'
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^1[3-9]\d{9}$/

function record(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}
}

function success<T>(data: T, message = 'success'): MockResponse {
  return { status: 200, body: { code: 1, message, data } }
}

function failure(message: string): MockResponse {
  return { status: 200, body: { code: 0, message, data: null } }
}

function verificationKey(
  purpose: SendVerificationCodeInput['purpose'],
  channel: AuthChannel,
  identifier: string,
): string {
  return `${purpose}:${channel}:${identifier}`
}

function authLogin(body: unknown): MockResponse {
  const input = record(body) as Partial<LoginInput>
  const identifier = input.identifier?.trim() ?? ''
  const user = users.get(identifier)

  if (!user || user.password !== input.password) {
    return failure('账号或者密码错误')
  }

  const session: AuthSession = {
    token: `mock-token-${identifier.replace(/[^a-zA-Z0-9]/g, '-')}`,
    user: {
      id: user.id,
      identifier,
      displayName: user.displayName,
    },
  }

  return success(session, '登录成功')
}

function sendCode(body: unknown): MockResponse {
  const input = record(body) as Partial<SendVerificationCodeInput>

  if (!input.channel || !input.identifier || !input.purpose) {
    return failure('验证码请求参数不完整')
  }

  const identifier = input.identifier.trim()
  const validIdentifier =
    input.channel === 'email' ? EMAIL_PATTERN.test(identifier) : PHONE_PATTERN.test(identifier)

  if (!validIdentifier) {
    return failure(input.channel === 'email' ? '邮箱格式不正确' : '手机号格式不正确')
  }

  verificationCodes.set(
    verificationKey(input.purpose, input.channel, identifier),
    DEVELOPMENT_VERIFICATION_CODE,
  )

  return success(
    {
      expiresInSeconds: 60,
      developmentCode: DEVELOPMENT_VERIFICATION_CODE,
    },
    '验证码已发送',
  )
}

function authRegister(body: unknown): MockResponse {
  const input = record(body) as Partial<RegisterInput>
  const identifier = input.identifier?.trim() ?? ''

  if (!input.channel || !identifier || !input.password || !input.displayName) {
    return failure('注册参数不完整')
  }

  if (input.password.length < 8 || !/[A-Za-z]/.test(input.password) || !/\d/.test(input.password)) {
    return failure('密码必须至少 8 位并同时包含字母和数字')
  }

  if (users.has(identifier)) {
    return failure('账号已经存在')
  }

  const expectedCode = verificationCodes.get(
    verificationKey('register', input.channel, identifier),
  )

  if (!expectedCode || input.verificationCode !== expectedCode) {
    return failure('验证码无效或已经过期')
  }

  users.set(identifier, {
    id: `user-${users.size + 1}`,
    password: input.password,
    displayName: input.displayName,
  })
  verificationCodes.delete(verificationKey('register', input.channel, identifier))

  return success({ identifier }, '注册成功')
}

function authResetPassword(body: unknown): MockResponse {
  const input = record(body) as Partial<ResetPasswordInput>
  const identifier = input.identifier?.trim() ?? ''
  const user = users.get(identifier)

  if (!input.channel || !identifier || !input.password) {
    return failure('重置密码参数不完整')
  }

  if (input.password.length < 8 || !/[A-Za-z]/.test(input.password) || !/\d/.test(input.password)) {
    return failure('密码必须至少 8 位并同时包含字母和数字')
  }

  if (!user) {
    return failure('账号不存在')
  }

  const expectedCode = verificationCodes.get(
    verificationKey('reset-password', input.channel, identifier),
  )

  if (!expectedCode || input.verificationCode !== expectedCode) {
    return failure('验证码无效或已经过期')
  }

  user.password = input.password
  verificationCodes.delete(verificationKey('reset-password', input.channel, identifier))

  return success({ identifier }, '密码已重置')
}

function login(url: URL): MockResponse {
  const username = url.searchParams.get('username') ?? ''
  const password = url.searchParams.get('password') ?? ''
  const valid = users.get(username)?.password === password

  if (!valid) {
    return {
      status: 200,
      body: {
        code: 0,
        message: '账号或者密码错误',
        result: {},
      },
    }
  }

  return {
    status: 200,
    body: {
      code: 1,
      message: '登录成功',
      token: `mock-token-${username}`,
      result: [],
    },
  }
}

function register(url: URL): MockResponse {
  const username = url.searchParams.get('username') ?? ''
  const exists = users.has(username)

  return {
    status: 200,
    body: {
      code: exists ? 0 : 1,
      message: exists ? '用户名已经存在' : '注册成功',
      result: [],
    },
  }
}

const staticResponses = new Map<string, MockResponse>([
  [
    '/api/catalog',
    {
      status: 200,
      body: {
        code: 1,
        message: 'success',
        data: catalogData,
      },
    },
  ],
  [
    '/api/home',
    {
      status: 200,
      body: {
        code: 1,
        message: 'success',
        data: homeData,
      },
    },
  ],
  [
    '/api/search/hot',
    {
      status: 200,
      body: {
        code: 1,
        message: 'success',
        data: hotSearchTerms,
      },
    },
  ],
  [
    '/api/banner',
    {
      status: 200,
      body: {
        code: 1,
        message: 'success',
        data: [
          {
            url: 'https://vuejs.org/',
            image: '/favicon.ico',
          },
        ],
      },
    },
  ],
  [
    '/api/rollinglist',
    {
      status: 200,
      body: {
        code: 1,
        message: 'success',
        data: [[{ url: '/', image: '/favicon.ico', label: '示例分类' }]],
      },
    },
  ],
  [
    '/api/classify',
    {
      status: 200,
      body: {
        code: 1,
        message: 'success',
        data: [],
      },
    },
  ],
])

export function handleMockRequest(
  method: string,
  url: URL,
  body?: unknown,
): MockResponse | undefined {
  const normalizedMethod = method.toUpperCase()

  if (normalizedMethod === 'POST') {
    if (url.pathname === '/api/auth/login') {
      return authLogin(body)
    }

    if (url.pathname === '/api/auth/send-code') {
      return sendCode(body)
    }

    if (url.pathname === '/api/auth/register') {
      return authRegister(body)
    }

    if (url.pathname === '/api/auth/reset-password') {
      return authResetPassword(body)
    }

    return undefined
  }

  if (normalizedMethod !== 'GET') {
    return undefined
  }

  if (url.pathname === '/api/login') {
    return login(url)
  }

  if (url.pathname === '/api/register') {
    return register(url)
  }

  return staticResponses.get(url.pathname)
}
