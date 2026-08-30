import { catalogData, homeData, hotSearchTerms, products, stores } from './catalog-data.js'
import { createOrderSeed } from './order-data.js'
import { createProfileSeed } from './profile-data.js'
import type {
  AuthChannel,
  AuthSession,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  SendVerificationCodeInput,
} from '../types/auth.js'
import type {
  Appeal,
  CancelOrderInput,
  CreateAppealInput,
  CreateOrderInput,
  Order,
  OrderItem,
  PayOrderInput,
  SupplementAppealInput,
} from '../types/order.js'
import { orderGoodsTotal } from '../types/order.js'
import type {
  AddressInput,
  ChangePasswordInput,
  FeedbackInput,
  InboxMessage,
  ProfileSettings,
  ProfileSnapshot,
  ShippingAddress,
  UpdateProfileInput,
  UserProfile,
} from '../types/profile.js'

export interface MockResponse {
  status: number
  body: unknown
}

interface MockUser {
  id: string
  password: string
  displayName: string
}

let orders = new Map<string, Order>()
let appeals = new Map<string, Appeal>()
let orderSequence = 6
let appealSequence = 1

export function resetOrderMockState(): void {
  const seed = createOrderSeed()
  orders = new Map(seed.orders.map((order) => [order.id, structuredClone(order)]))
  appeals = new Map(seed.appeals.map((appeal) => [appeal.id, structuredClone(appeal)]))
  orderSequence = seed.orders.length
  appealSequence = seed.appeals.length
}

resetOrderMockState()

let profile: UserProfile
let addresses: ShippingAddress[]
let messages: InboxMessage[]
let helpTopics: ProfileSnapshot['helpTopics']
let settings: ProfileSettings
let addressSequence = 3
let messageSequence = 3

export function resetProfileMockState(): void {
  const seed = createProfileSeed()
  profile = structuredClone(seed.profile)
  addresses = structuredClone(seed.addresses)
  messages = structuredClone(seed.messages)
  helpTopics = structuredClone(seed.helpTopics)
  settings = structuredClone(seed.settings)
  addressSequence = seed.addresses.length
  messageSequence = seed.messages.length
}

resetProfileMockState()

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

function nowStamp(): string {
  const value = new Date()
  const pad = (part: number) => String(part).padStart(2, '0')
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())} ${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`
}

function snapshot(): { orders: Order[]; appeals: Appeal[] } {
  return {
    orders: [...orders.values()],
    appeals: [...appeals.values()],
  }
}

function toOrderItem(
  productId: string,
  quantity: number,
  spec?: string,
): OrderItem | undefined {
  const product = products.find((candidate) => candidate.id === productId)

  if (!product || quantity < 1) {
    return undefined
  }

  return {
    productId: product.id,
    title: product.title,
    spec: spec?.trim() || product.subtitle,
    image: product.image,
    price: product.price,
    quantity: Math.min(product.stock, Math.round(quantity)),
  }
}

function createOrder(body: unknown): MockResponse {
  const input = record(body) as Partial<CreateOrderInput>
  const items = (input.items ?? [])
    .map((item) => toOrderItem(item.productId, item.quantity, item.spec))
    .filter((item): item is OrderItem => item !== undefined)

  if (items.length === 0) {
    return failure('请选择要结算的商品')
  }

  const store = stores[0]!
  orderSequence += 1
  const id = `order-${orderSequence}`
  const number = `20260830${String(orderSequence).padStart(6, '0')}`
  const order: Order = {
    id,
    number,
    status: 'unpaid',
    storeId: store.id,
    storeName: store.name,
    storeLogo: store.logo,
    items,
    payable: orderGoodsTotal(items),
    paymentMethod: input.paymentMethod,
    createdAt: nowStamp(),
    address: {
      receiver: '咋地',
      phone: '13545900066',
      detail: '广东省深圳市南山区科研路1001号比科大厦',
    },
  }

  orders.set(id, order)
  return success(order, '订单已创建')
}

function payOrder(orderId: string, body: unknown): MockResponse {
  const order = orders.get(orderId)
  const input = record(body) as Partial<PayOrderInput>

  if (!order) {
    return failure('订单不存在')
  }

  if (order.status !== 'unpaid') {
    return failure('当前订单不可支付')
  }

  order.status = 'paid'
  order.paymentMethod = input.paymentMethod?.trim() || order.paymentMethod || 'Top-Pay'
  order.paidAt = nowStamp()
  order.paymentNumber = `PAY${order.number}`
  return success(order, '支付成功')
}

function cancelOrder(orderId: string, body: unknown): MockResponse {
  const order = orders.get(orderId)
  const input = record(body) as Partial<CancelOrderInput>

  if (!order) {
    return failure('订单不存在')
  }

  if (order.status !== 'unpaid') {
    return failure('当前订单不可取消')
  }

  if (!input.reason?.trim()) {
    return failure('请选择取消原因')
  }

  order.status = 'cancelled'
  order.cancelledAt = nowStamp()
  order.cancelReason = input.note?.trim() ? `${input.reason}：${input.note.trim()}` : input.reason
  return success(order, '订单已取消')
}

function confirmReceipt(orderId: string): MockResponse {
  const order = orders.get(orderId)

  if (!order) {
    return failure('订单不存在')
  }

  if (order.status !== 'to_receive') {
    return failure('当前订单不可确认收货')
  }

  order.status = 'completed'
  return success(order, '已确认收货')
}

function createAppeal(body: unknown): MockResponse {
  const input = record(body) as Partial<CreateAppealInput>
  const order = input.orderId ? orders.get(input.orderId) : undefined

  if (!order) {
    return failure('订单不存在')
  }

  if (!input.contactName?.trim() || !input.contactPhone?.trim() || !input.content?.trim()) {
    return failure('请完整填写申诉信息')
  }

  appealSequence += 1
  const appeal: Appeal = {
    id: `appeal-${appealSequence}`,
    orderId: order.id,
    contactName: input.contactName.trim(),
    contactPhone: input.contactPhone.trim(),
    content: input.content.trim(),
    images: Array.isArray(input.images) ? input.images.slice(0, 5) : [],
    createdAt: nowStamp(),
    status: 'open',
  }

  appeals.set(appeal.id, appeal)
  return success(appeal, '申诉已提交')
}

function supplementAppeal(appealId: string, body: unknown): MockResponse {
  const appeal = appeals.get(appealId)
  const input = record(body) as Partial<SupplementAppealInput>

  if (!appeal) {
    return failure('申诉不存在')
  }

  if (!input.content?.trim()) {
    return failure('请输入补充内容')
  }

  appeal.content = `${appeal.content}\n\n补充：${input.content.trim()}`
  appeal.status = 'supplemented'
  return success(appeal, '申诉已补充')
}

function profileSnapshot(): ProfileSnapshot {
  return {
    profile,
    addresses,
    messages,
    helpTopics,
    settings,
  }
}

function updateProfile(body: unknown): MockResponse {
  const input = record(body) as UpdateProfileInput

  profile = {
    ...profile,
    ...Object.fromEntries(
      Object.entries(input).filter(([, value]) => typeof value === 'string' && value.trim()),
    ),
  }

  return success(profile, '资料已更新')
}

function changeProfilePassword(body: unknown): MockResponse {
  const input = record(body) as Partial<ChangePasswordInput>
  const identifier = input.identifier?.trim() ?? ''
  const user = users.get(identifier)

  if (!user || user.password !== input.currentPassword) {
    return failure('当前密码不正确')
  }

  if (!input.password || input.password.length < 8) {
    return failure('密码必须至少 8 位并同时包含字母和数字')
  }

  user.password = input.password
  return success({ identifier }, '密码已修改')
}

function createAddress(body: unknown): MockResponse {
  const input = record(body) as Partial<AddressInput>

  if (!input.name?.trim() || !input.phone?.trim() || !input.region?.trim() || !input.detail?.trim()) {
    return failure('请完整填写收货地址')
  }

  addressSequence += 1
  const address: ShippingAddress = {
    id: `address-${addressSequence}`,
    name: input.name.trim(),
    phone: input.phone.trim(),
    gender: input.gender === 'male' ? 'male' : 'female',
    region: input.region.trim(),
    detail: input.detail.trim(),
    tag: input.tag === 'company' || input.tag === 'school' ? input.tag : 'home',
    isDefault: Boolean(input.isDefault) || addresses.length === 0,
  }

  if (address.isDefault) {
    addresses = addresses.map((item) => ({ ...item, isDefault: false }))
  }

  addresses = [address, ...addresses]
  return success(address, '地址已保存')
}

function updateAddress(addressId: string, body: unknown): MockResponse {
  const current = addresses.find((item) => item.id === addressId)
  const input = record(body) as Partial<AddressInput>

  if (!current) {
    return failure('地址不存在')
  }

  const address: ShippingAddress = {
    ...current,
    name: input.name?.trim() || current.name,
    phone: input.phone?.trim() || current.phone,
    gender: input.gender === 'male' || input.gender === 'female' ? input.gender : current.gender,
    region: input.region?.trim() || current.region,
    detail: input.detail?.trim() || current.detail,
    tag: input.tag === 'company' || input.tag === 'school' || input.tag === 'home' ? input.tag : current.tag,
    isDefault: input.isDefault ?? current.isDefault,
  }

  addresses = addresses.map((item) => (item.id === addressId ? address : item))

  if (address.isDefault) {
    addresses = addresses.map((item) => ({ ...item, isDefault: item.id === addressId }))
  }

  return success(address, '地址已更新')
}

function setDefaultAddress(addressId: string): MockResponse {
  if (!addresses.some((item) => item.id === addressId)) {
    return failure('地址不存在')
  }

  addresses = addresses.map((item) => ({ ...item, isDefault: item.id === addressId }))
  return success(addresses, '已设为默认地址')
}

function submitFeedback(body: unknown): MockResponse {
  const input = record(body) as Partial<FeedbackInput>

  if (!input.content?.trim()) {
    return failure('请填写问题描述')
  }

  messageSequence += 1
  const message: InboxMessage = {
    id: `message-${messageSequence}`,
    kind: 'feedback',
    title: '问题反馈',
    body: `我们已收到你的反馈：${input.content.trim()}`,
    createdAt: nowStamp(),
  }
  messages = [message, ...messages]
  return success(message, '反馈已提交')
}

function updateSettings(body: unknown): MockResponse {
  const input = record(body) as Partial<ProfileSettings>
  settings = {
    notifications: input.notifications ?? settings.notifications,
  }
  return success(settings, '设置已更新')
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

    if (url.pathname === '/api/orders') {
      return createOrder(body)
    }

    const orderAction = /^\/api\/orders\/([^/]+)\/(pay|cancel|confirm-receipt)$/.exec(url.pathname)

    if (orderAction) {
      const [, orderId, action] = orderAction

      if (action === 'pay') {
        return payOrder(orderId ?? '', body)
      }

      if (action === 'cancel') {
        return cancelOrder(orderId ?? '', body)
      }

      return confirmReceipt(orderId ?? '')
    }

    if (url.pathname === '/api/appeals') {
      return createAppeal(body)
    }

    const appealAction = /^\/api\/appeals\/([^/]+)\/supplement$/.exec(url.pathname)

    if (appealAction) {
      return supplementAppeal(appealAction[1] ?? '', body)
    }

    if (url.pathname === '/api/profile') {
      return updateProfile(body)
    }

    if (url.pathname === '/api/profile/password') {
      return changeProfilePassword(body)
    }

    if (url.pathname === '/api/addresses') {
      return createAddress(body)
    }

    const addressAction = /^\/api\/addresses\/([^/]+)(?:\/(default))?$/.exec(url.pathname)

    if (addressAction) {
      const [, addressId, action] = addressAction
      return action === 'default'
        ? setDefaultAddress(addressId ?? '')
        : updateAddress(addressId ?? '', body)
    }

    if (url.pathname === '/api/feedback') {
      return submitFeedback(body)
    }

    if (url.pathname === '/api/settings') {
      return updateSettings(body)
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

  if (url.pathname === '/api/orders') {
    return success(snapshot())
  }

  const orderMatch = /^\/api\/orders\/([^/]+)$/.exec(url.pathname)

  if (orderMatch) {
    const order = orders.get(orderMatch[1] ?? '')
    return order ? success(order) : failure('订单不存在')
  }

  if (url.pathname === '/api/profile') {
    return success(profileSnapshot())
  }

  if (url.pathname === '/api/appeals') {
    return success([...appeals.values()])
  }

  const appealMatch = /^\/api\/appeals\/([^/]+)$/.exec(url.pathname)

  if (appealMatch) {
    const appeal = appeals.get(appealMatch[1] ?? '')
    return appeal ? success(appeal) : failure('申诉不存在')
  }

  return staticResponses.get(url.pathname)
}
