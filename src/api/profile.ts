import { http } from './http'
import type { ApiResponse } from './types'
import { unwrapApiResponse } from './types'
import type {
  AddressInput,
  ChangePasswordInput,
  FeedbackInput,
  ProfileSettings,
  ProfileSnapshot,
  ShippingAddress,
  UpdateProfileInput,
  UserProfile,
} from '@/types/profile'

export async function getProfileSnapshot(): Promise<ProfileSnapshot> {
  const response = await http.get<ApiResponse<ProfileSnapshot>>('/profile')
  return unwrapApiResponse(response.data)
}

export async function updateProfile(input: UpdateProfileInput): Promise<UserProfile> {
  const response = await http.post<ApiResponse<UserProfile>>('/profile', input)
  return unwrapApiResponse(response.data)
}

export async function changePassword(input: ChangePasswordInput): Promise<{ identifier: string }> {
  const response = await http.post<ApiResponse<{ identifier: string }>>('/profile/password', input)
  return unwrapApiResponse(response.data)
}

export async function createAddress(input: AddressInput): Promise<ShippingAddress> {
  const response = await http.post<ApiResponse<ShippingAddress>>('/addresses', input)
  return unwrapApiResponse(response.data)
}

export async function updateAddress(
  addressId: string,
  input: AddressInput,
): Promise<ShippingAddress> {
  const response = await http.post<ApiResponse<ShippingAddress>>(`/addresses/${addressId}`, input)
  return unwrapApiResponse(response.data)
}

export async function setDefaultAddress(addressId: string): Promise<ShippingAddress[]> {
  const response = await http.post<ApiResponse<ShippingAddress[]>>(
    `/addresses/${addressId}/default`,
  )
  return unwrapApiResponse(response.data)
}

export async function submitFeedback(input: FeedbackInput): Promise<ProfileSnapshot['messages'][number]> {
  const response = await http.post<ApiResponse<ProfileSnapshot['messages'][number]>>(
    '/feedback',
    input,
  )
  return unwrapApiResponse(response.data)
}

export async function updateSettings(input: Partial<ProfileSettings>): Promise<ProfileSettings> {
  const response = await http.post<ApiResponse<ProfileSettings>>('/settings', input)
  return unwrapApiResponse(response.data)
}
