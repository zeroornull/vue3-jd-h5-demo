<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AuthShell from '@/components/AuthShell.vue'
import { useVerificationCode } from '@/composables/useVerificationCode'
import { useAuthStore } from '@/stores/auth'
import type { AuthChannel } from '@/types/auth'
import { validateIdentifier, validateVerificationCode } from '@/utils/auth-validation'

defineOptions({ name: 'RegisterStartView' })

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const verification = useVerificationCode()
const form = reactive({
  identifier: '',
  verificationCode: '',
})
const errorMessage = ref('')

const channel = computed<AuthChannel>(() =>
  route.name === 'emailRegister' ? 'email' : 'phone',
)
const channelLabel = computed(() => (channel.value === 'email' ? '邮箱' : '手机号'))
const title = computed(() => `${channelLabel.value}注册`)
const switchLabel = computed(() =>
  channel.value === 'email' ? '改用手机号注册' : '改用邮箱注册',
)
const switchTo = computed(() =>
  channel.value === 'email' ? '/register/phoneRegister' : '/register/emailRegister',
)
const completeRouteName = computed(() =>
  channel.value === 'email' ? 'emailRegisterTwo' : 'phoneRegisterTwo',
)

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
    purpose: 'register',
  })
}

async function nextStep(): Promise<void> {
  const identifierError = validateIdentifier(channel.value, form.identifier)
  const codeError = validateVerificationCode(form.verificationCode)

  if (identifierError || codeError) {
    errorMessage.value = identifierError ?? codeError ?? '请检查注册信息'
    return
  }

  authStore.setRegistrationDraft({
    channel: channel.value,
    identifier: form.identifier.trim(),
    verificationCode: form.verificationCode.trim(),
  })
  await router.push({ name: completeRouteName.value })
}
</script>

<template>
  <AuthShell
    :title="title"
    subtitle="验证账号后设置登录信息"
    :switch-label="switchLabel"
    :switch-to="switchTo"
  >
    <form class="auth-form" @submit.prevent="nextStep">
      <div class="form-field">
        <label for="register-identifier">{{ channelLabel }}</label>
        <input
          id="register-identifier"
          v-model="form.identifier"
          name="identifier"
          :type="channel === 'email' ? 'email' : 'tel'"
          :inputmode="channel === 'email' ? 'email' : 'tel'"
          :autocomplete="channel === 'email' ? 'email' : 'tel'"
          :placeholder="`请输入${channelLabel}`"
        />
      </div>
      <div class="form-field">
        <label for="register-code">验证码</label>
        <div class="code-row">
          <input
            id="register-code"
            v-model="form.verificationCode"
            name="verificationCode"
            inputmode="numeric"
            autocomplete="one-time-code"
            maxlength="6"
            placeholder="6 位数字验证码"
          />
          <button
            type="button"
            class="code-button"
            :disabled="verification.sending.value || verification.cooldown.value > 0"
            @click="sendCode"
          >
            {{
              verification.cooldown.value > 0
                ? `${verification.cooldown.value}s`
                : verification.sending.value
                  ? '发送中…'
                  : '获取验证码'
            }}
          </button>
        </div>
      </div>
      <p v-if="verification.statusMessage.value" class="auth-message" role="status">
        {{ verification.statusMessage.value }}
      </p>
      <p
        v-if="errorMessage || verification.errorMessage.value"
        class="auth-error"
        role="alert"
      >
        {{ errorMessage || verification.errorMessage.value }}
      </p>
      <button class="submit-button" type="submit">下一步</button>
    </form>
  </AuthShell>
</template>
