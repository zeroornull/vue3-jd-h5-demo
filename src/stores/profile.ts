import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import {
  changePassword as changePasswordRequest,
  createAddress as createAddressRequest,
  getProfileSnapshot,
  setDefaultAddress as setDefaultAddressRequest,
  submitFeedback as submitFeedbackRequest,
  updateAddress as updateAddressRequest,
  updateProfile as updateProfileRequest,
  updateSettings as updateSettingsRequest,
} from '@/api/profile'
import type {
  AddressInput,
  ChangePasswordInput,
  FeedbackInput,
  HelpTopic,
  InboxMessage,
  ProfileSettings,
  ProfileSnapshot,
  ShippingAddress,
  UpdateProfileInput,
  UserProfile,
} from '@/types/profile'

export const useProfileStore = defineStore('profile', () => {
  const profile = ref<UserProfile>()
  const addresses = ref<ShippingAddress[]>([])
  const messages = ref<InboxMessage[]>([])
  const helpTopics = ref<HelpTopic[]>([])
  const settings = ref<ProfileSettings>({ notifications: true })
  const draftRegion = ref('')
  const loaded = ref(false)
  const loading = ref(false)
  const errorMessage = ref('')

  const defaultAddress = computed(
    () => addresses.value.find((address) => address.isDefault) ?? addresses.value[0],
  )

  function applySnapshot(snapshot: ProfileSnapshot): void {
    profile.value = snapshot.profile
    addresses.value = snapshot.addresses
    messages.value = snapshot.messages
    helpTopics.value = snapshot.helpTopics
    settings.value = snapshot.settings
    loaded.value = true
    errorMessage.value = ''
  }

  async function load(force = false): Promise<void> {
    if (loaded.value && !force) {
      return
    }

    loading.value = true
    errorMessage.value = ''

    try {
      applySnapshot(await getProfileSnapshot())
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '个人中心加载失败'
      throw error
    } finally {
      loading.value = false
    }
  }

  function findAddress(addressId: string): ShippingAddress | undefined {
    return addresses.value.find((address) => address.id === addressId)
  }

  async function updateProfile(input: UpdateProfileInput): Promise<UserProfile> {
    const next = await updateProfileRequest(input)
    profile.value = next
    return next
  }

  async function changePassword(input: ChangePasswordInput): Promise<void> {
    await changePasswordRequest(input)
  }

  async function saveAddress(input: AddressInput, addressId?: string): Promise<ShippingAddress> {
    const address = addressId
      ? await updateAddressRequest(addressId, input)
      : await createAddressRequest(input)

    const index = addresses.value.findIndex((item) => item.id === address.id)
    if (index === -1) {
      addresses.value = [address, ...addresses.value]
    } else {
      const copy = addresses.value.slice()
      copy[index] = address
      addresses.value = copy
    }

    if (address.isDefault) {
      addresses.value = addresses.value.map((item) => ({
        ...item,
        isDefault: item.id === address.id,
      }))
    }

    return address
  }

  async function setDefaultAddress(addressId: string): Promise<void> {
    addresses.value = await setDefaultAddressRequest(addressId)
  }

  async function submitFeedback(input: FeedbackInput): Promise<InboxMessage> {
    const message = await submitFeedbackRequest(input)
    messages.value = [message, ...messages.value]
    return message
  }

  async function updateSettings(input: Partial<ProfileSettings>): Promise<void> {
    settings.value = await updateSettingsRequest(input)
  }

  return {
    profile,
    addresses,
    messages,
    helpTopics,
    settings,
    draftRegion,
    loaded,
    loading,
    errorMessage,
    defaultAddress,
    applySnapshot,
    load,
    findAddress,
    updateProfile,
    changePassword,
    saveAddress,
    setDefaultAddress,
    submitFeedback,
    updateSettings,
  }
})
