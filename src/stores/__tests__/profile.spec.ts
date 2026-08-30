import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createProfileSeed } from '@/mocks/profile-data'
import type { InboxMessage, ProfileSnapshot, ShippingAddress, UserProfile } from '@/types/profile'

const api = vi.hoisted(() => ({
  getProfileSnapshot: vi.fn<() => Promise<ProfileSnapshot>>(),
  updateProfile: vi.fn<(input: unknown) => Promise<UserProfile>>(),
  changePassword: vi.fn<() => Promise<void>>(),
  createAddress: vi.fn<(input: unknown) => Promise<ShippingAddress>>(),
  updateAddress: vi.fn<(id: string, input: unknown) => Promise<ShippingAddress>>(),
  setDefaultAddress: vi.fn<(id: string) => Promise<ShippingAddress[]>>(),
  submitFeedback: vi.fn<(input: unknown) => Promise<InboxMessage>>(),
  updateSettings: vi.fn<(input: unknown) => Promise<{ notifications: boolean }>>(),
}))

vi.mock('@/api/profile', () => api)

import { useProfileStore } from '../profile'

describe('useProfileStore', () => {
  const seed = createProfileSeed()

  beforeEach(() => {
    setActivePinia(createPinia())
    api.getProfileSnapshot.mockReset()
    api.updateProfile.mockReset()
    api.createAddress.mockReset()
    api.setDefaultAddress.mockReset()
    api.submitFeedback.mockReset()
    api.getProfileSnapshot.mockResolvedValue(structuredClone(seed))
  })

  it('loads once and exposes profile, addresses and messages', async () => {
    const store = useProfileStore()

    await store.load()
    await store.load()

    expect(api.getProfileSnapshot).toHaveBeenCalledTimes(1)
    expect(store.profile?.displayName).toBe('演示用户')
    expect(store.defaultAddress?.id).toBe('address-home')
    expect(store.messages).toHaveLength(3)
  })

  it('updates profile, saves an address and records feedback', async () => {
    const store = useProfileStore()
    await store.load()

    api.updateProfile.mockResolvedValue({ ...seed.profile, displayName: '新昵称' })
    api.createAddress.mockResolvedValue({
      id: 'address-new',
      name: '测试',
      phone: '13900000000',
      gender: 'female',
      region: '北京市朝阳区',
      detail: '望京',
      tag: 'home',
      isDefault: true,
    })
    api.submitFeedback.mockResolvedValue({
      id: 'message-new',
      kind: 'feedback',
      title: '问题反馈',
      body: '已收到',
      createdAt: '2026-08-30 12:00:00',
    })

    expect((await store.updateProfile({ displayName: '新昵称' })).displayName).toBe('新昵称')
    const address = await store.saveAddress({
      name: '测试',
      phone: '13900000000',
      gender: 'female',
      region: '北京市朝阳区',
      detail: '望京',
      tag: 'home',
      isDefault: true,
    })
    expect(address.id).toBe('address-new')
    expect(store.addresses[0]?.isDefault).toBe(true)
    expect((await store.submitFeedback({ type: 'bug', content: '无法登录' })).id).toBe(
      'message-new',
    )
    expect(store.messages[0]?.id).toBe('message-new')
  })

  it('recovers from a failed load', async () => {
    const store = useProfileStore()
    api.getProfileSnapshot.mockRejectedValueOnce(new Error('offline'))

    await expect(store.load()).rejects.toThrow('offline')
    await store.load(true)
    expect(store.profile?.email).toBe('demo@example.com')
  })
})
