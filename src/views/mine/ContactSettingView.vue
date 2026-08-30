<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'

import PageHeader from '@/components/PageHeader.vue'
import { useVerificationCode } from '@/composables/useVerificationCode'
import { useProfileStore } from '@/stores/profile'
import type { AuthChannel } from '@/types/auth'
import {
  validateIdentifier,
  validatePassword,
  validatePasswordConfirmation,
  validateVerificationCode,
} from '@/utils/auth-validation'

defineOptions({ name: 'ContactSettingView' })

const route = useRoute()
const router = useRouter()
const profileStore = useProfileStore()
const { profile, draftRegion } = storeToRefs(profileStore)
const verification = useVerificationCode()
const submitting = ref(false)
const errorMessage = ref('')
const form = reactive({
  identifier: '',
  verificationCode: '',
  password: '',
  confirmation: '',
})

const channel = computed<AuthChannel>(() => (route.name === 'settingMail' ? 'email' : 'phone'))
const title = computed(() => (channel.value === 'email' ? '邮箱设置' : '手机号设置'))
const regionLabel = computed(() => draftRegion.value || profile.value?.region || '中国 +86')

async function sendCode(): Promise<void> {
  const validationError = validateIdentifier(channel.value, form.identifier)
  if (validationError) {
    errorMessage.value = validationError
    return
  }

  errorMessage.value = ''
  await verification.send({
    channel: channel.value,
    identifier: form.identifier.trim(),
    purpose: 'bind-contact',
  })
}

async function submit(): Promise<void> {
  const identifierError = validateIdentifier(channel.value, form.identifier)
  const codeError = validateVerificationCode(form.verificationCode)
  const passwordError = validatePassword(form.password)
  const confirmError = validatePasswordConfirmation(form.password, form.confirmation)

  if (identifierError || codeError || passwordError || confirmError) {
    errorMessage.value = identifierError || codeError || passwordError || confirmError || '请检查信息'
    return
  }

  submitting.value = true
  errorMessage.value = ''

  try {
    await profileStore.updateProfile({
      region: regionLabel.value,
      ...(channel.value === 'email'
        ? { email: form.identifier.trim() }
        : { phone: form.identifier.trim() }),
    })
    profileStore.draftRegion = ''
    await router.replace('/mine/personInfo')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '保存失败'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  void profileStore.load().then(() => {
    form.identifier =
      channel.value === 'email' ? (profile.value?.email ?? '') : (profile.value?.phone ?? '')
  })
})
</script>

<template>
  <div class="mine-page">
    <PageHeader :title="title" :show-search="false" />
    <form class="mine-form" @submit.prevent="submit">
      <RouterLink class="mine-row" to="/mine/countryRegion" style="padding: 0">
        国家/地区
        <span>{{ regionLabel }}</span>
      </RouterLink>
      <label>
        {{ channel === 'email' ? '邮箱' : '手机号' }}
        <div class="code-row" style="display: grid; grid-template-columns: 1fr auto; gap: 8px">
          <input
            v-model="form.identifier"
            :type="channel === 'email' ? 'email' : 'tel'"
            :placeholder="channel === 'email' ? '请输入邮箱' : '请输入手机号'"
          />
          <button
            type="button"
            class="order-ghost"
            :disabled="verification.sending.value || verification.cooldown.value > 0"
            @click="sendCode"
          >
            {{
              verification.cooldown.value > 0
                ? `${verification.cooldown.value}s`
                : '获取验证码'
            }}
          </button>
        </div>
      </label>
      <label>
        验证码
        <input v-model="form.verificationCode" inputmode="numeric" maxlength="6" placeholder="6 位数字" />
      </label>
      <label>
        密码
        <input v-model="form.password" type="password" autocomplete="current-password" />
      </label>
      <label>
        再次确认
        <input v-model="form.confirmation" type="password" />
      </label>
      <p v-if="verification.statusMessage.value" class="order-hint">
        {{ verification.statusMessage.value }}
      </p>
      <p
        v-if="errorMessage || verification.errorMessage.value"
        class="page-state error"
        role="alert"
      >
        {{ errorMessage || verification.errorMessage.value }}
      </p>
      <button class="order-primary" type="submit" :disabled="submitting">
        {{ submitting ? '保存中…' : '保存' }}
      </button>
    </form>
  </div>
</template>
