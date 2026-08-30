import {
  expectArray,
  expectBoolean,
  expectNumber,
  expectOneOf,
  expectRecord,
  expectString,
  expectStringArray,
} from '../types'
import type {
  AddressGender,
  AddressTag,
  HelpTopic,
  InboxMessage,
  MessageKind,
  ProfileSettings,
  ProfileSnapshot,
  ShippingAddress,
  UserProfile,
} from '@/types/profile'

const ADDRESS_TAGS = ['home', 'company', 'school'] as const satisfies readonly AddressTag[]
const ADDRESS_GENDERS = ['female', 'male'] as const satisfies readonly AddressGender[]
const MESSAGE_KINDS = ['feedback', 'order'] as const satisfies readonly MessageKind[]

export function parseUserProfile(value: unknown): UserProfile {
  const record = expectRecord(value, 'profile')
  return {
    displayName: expectString(record.displayName, 'profile.displayName'),
    phone: expectString(record.phone, 'profile.phone'),
    email: expectString(record.email, 'profile.email'),
    avatar: expectString(record.avatar, 'profile.avatar'),
    region: expectString(record.region, 'profile.region'),
    productFollows: expectNumber(record.productFollows, 'profile.productFollows'),
    storeFollows: expectNumber(record.storeFollows, 'profile.storeFollows'),
    footprints: expectNumber(record.footprints, 'profile.footprints'),
  }
}

export function parseShippingAddress(value: unknown): ShippingAddress {
  const record = expectRecord(value, 'address')
  return {
    id: expectString(record.id, 'address.id'),
    name: expectString(record.name, 'address.name'),
    phone: expectString(record.phone, 'address.phone'),
    gender: expectOneOf(record.gender, ADDRESS_GENDERS, 'address.gender'),
    region: expectString(record.region, 'address.region'),
    detail: expectString(record.detail, 'address.detail'),
    tag: expectOneOf(record.tag, ADDRESS_TAGS, 'address.tag'),
    isDefault: expectBoolean(record.isDefault, 'address.isDefault'),
  }
}

export function parseInboxMessage(value: unknown): InboxMessage {
  const record = expectRecord(value, 'message')
  return {
    id: expectString(record.id, 'message.id'),
    kind: expectOneOf(record.kind, MESSAGE_KINDS, 'message.kind'),
    title: expectString(record.title, 'message.title'),
    body: expectString(record.body, 'message.body'),
    createdAt: expectString(record.createdAt, 'message.createdAt'),
  }
}

function parseHelpTopic(value: unknown): HelpTopic {
  const record = expectRecord(value, 'help')
  return {
    id: expectString(record.id, 'help.id'),
    title: expectString(record.title, 'help.title'),
    articles: expectStringArray(record.articles, 'help.articles'),
  }
}

export function parseProfileSettings(value: unknown): ProfileSettings {
  const record = expectRecord(value, 'settings')
  return {
    notifications: expectBoolean(record.notifications, 'settings.notifications'),
  }
}

export function parseProfileSnapshot(value: unknown): ProfileSnapshot {
  const record = expectRecord(value, 'profileSnapshot')
  return {
    profile: parseUserProfile(record.profile),
    addresses: expectArray(record.addresses, parseShippingAddress, 'addresses'),
    messages: expectArray(record.messages, parseInboxMessage, 'messages'),
    helpTopics: expectArray(record.helpTopics, parseHelpTopic, 'helpTopics'),
    settings: parseProfileSettings(record.settings),
  }
}
