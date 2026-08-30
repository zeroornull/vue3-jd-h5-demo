import { http } from './http'
import { parseIdentifier } from './payloads/auth'
import {
  parseInboxMessage,
  parseProfileSettings,
  parseProfileSnapshot,
  parseShippingAddress,
  parseUserProfile,
} from './payloads/profile'
import { expectArray, readApiData } from './types'
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
} from '@/types/profile'

export async function getProfileSnapshot(): Promise<ProfileSnapshot> {
  return readApiData(http.get<unknown>('/profile'), parseProfileSnapshot)
}

export async function updateProfile(input: UpdateProfileInput): Promise<UserProfile> {
  return readApiData(http.post<unknown>('/profile', input), parseUserProfile)
}

export async function changePassword(input: ChangePasswordInput): Promise<{ identifier: string }> {
  return readApiData(http.post<unknown>('/profile/password', input), parseIdentifier)
}

export async function createAddress(input: AddressInput): Promise<ShippingAddress> {
  return readApiData(http.post<unknown>('/addresses', input), parseShippingAddress)
}

export async function updateAddress(
  addressId: string,
  input: AddressInput,
): Promise<ShippingAddress> {
  return readApiData(http.post<unknown>(`/addresses/${addressId}`, input), parseShippingAddress)
}

export async function setDefaultAddress(addressId: string): Promise<ShippingAddress[]> {
  return readApiData(http.post<unknown>(`/addresses/${addressId}/default`), (value) =>
    expectArray(value, parseShippingAddress, 'addresses'),
  )
}

export async function submitFeedback(input: FeedbackInput): Promise<InboxMessage> {
  return readApiData(http.post<unknown>('/feedback', input), parseInboxMessage)
}

export async function updateSettings(input: Partial<ProfileSettings>): Promise<ProfileSettings> {
  return readApiData(http.post<unknown>('/settings', input), parseProfileSettings)
}
