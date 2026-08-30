export type AddressTag = 'home' | 'company' | 'school'
export type AddressGender = 'female' | 'male'
export type MessageKind = 'feedback' | 'order'
export type FeedbackType = 'bug' | 'ux' | 'feature' | 'other'

export interface UserProfile {
  displayName: string
  phone: string
  email: string
  avatar: string
  region: string
  productFollows: number
  storeFollows: number
  footprints: number
}

export interface ShippingAddress {
  id: string
  name: string
  phone: string
  gender: AddressGender
  region: string
  detail: string
  tag: AddressTag
  isDefault: boolean
}

export interface InboxMessage {
  id: string
  kind: MessageKind
  title: string
  body: string
  createdAt: string
}

export interface HelpTopic {
  id: string
  title: string
  articles: string[]
}

export interface ProfileSettings {
  notifications: boolean
}

export interface ProfileSnapshot {
  profile: UserProfile
  addresses: ShippingAddress[]
  messages: InboxMessage[]
  helpTopics: HelpTopic[]
  settings: ProfileSettings
}

export interface UpdateProfileInput {
  displayName?: string
  phone?: string
  email?: string
  region?: string
}

export interface ChangePasswordInput {
  identifier: string
  currentPassword: string
  password: string
}

export interface AddressInput {
  name: string
  phone: string
  gender: AddressGender
  region: string
  detail: string
  tag: AddressTag
  isDefault?: boolean
}

export interface FeedbackInput {
  type: FeedbackType
  content: string
}

export const ADDRESS_TAG_LABELS: Record<AddressTag, string> = {
  home: '家',
  company: '公司',
  school: '学校',
}

export const MESSAGE_KIND_LABELS: Record<MessageKind, string> = {
  feedback: '问题反馈',
  order: '订单通知',
}

export const FEEDBACK_TYPES: ReadonlyArray<{ id: FeedbackType; label: string }> = [
  { id: 'bug', label: '功能异常' },
  { id: 'ux', label: '体验问题' },
  { id: 'feature', label: '新功能建议' },
  { id: 'other', label: '其他问题' },
]

export const COUNTRY_REGIONS: ReadonlyArray<{ name: string; code: string; letter: string }> = [
  { name: '中国', code: '+86', letter: 'Z' },
  { name: '中国香港', code: '+852', letter: 'Z' },
  { name: '中国澳门', code: '+853', letter: 'Z' },
  { name: '中国台湾', code: '+886', letter: 'Z' },
  { name: '日本', code: '+81', letter: 'R' },
  { name: '韩国', code: '+82', letter: 'H' },
  { name: '新加坡', code: '+65', letter: 'X' },
  { name: '美国', code: '+1', letter: 'M' },
  { name: '英国', code: '+44', letter: 'Y' },
  { name: '澳大利亚', code: '+61', letter: 'A' },
]

export const CITY_REGIONS = [
  '广东省深圳市南山区',
  '广东省深圳市宝安区',
  '北京市朝阳区',
  '上海市浦东新区',
] as const
