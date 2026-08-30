<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { resetPassword } from '@/api/auth'
import AuthShell from '@/components/AuthShell.vue'
import { useVerificationCode } from '@/composables/useVerificationCode'
import {
  inferAuthChannel,
  validateIdentifier,
  validatePassword,
  validatePasswordConfirmation,
  validateVerificationCode,
} from '@/utils/auth-validation'

defineOptions({ name: 'ForgotPasswordView' })

const router = useRouter()
const verification = useVerificationCode()
const form = reactive({
  identifier: '',
  verificationCode: '',
  password: '',
  confirmation: '',
})
const submitting = ref(false)
const errorMessage = ref('')

async function sendCode(): Promise<void> {
  const channel = inferAuthChannel(form.identifier)
  const validationError = validateIdentifier(channel, form.identifier)

  if (validationError) {
    errorMessage.value = validationError
    return
  }

  errorMessage.value = ''
  await verification.send({
    channel,
    identifier: form.identifier.trim(),
    purpose: 'reset-password',
  })
}

async function submit(): Promise<void> {
  const channel = inferAuthChannel(form.identifier)
  const identifierError = validateIdentifier(channel, form.identifier)
  const codeError = validateVerificationCode(form.verificationCode)
  const passwordError = validatePassword(form.password)
  const confirmationError = validatePasswordConfirmation(form.password, form.confirmation)

  if (identifierError || codeError || passwordError || confirmationError) {
    errorMessage.value =
      identifierError || codeError || passwordError || confirmationError || '请检查重置信息'
    return
  }

  submitting.value = true
  errorMessage.value = ''

  try {
    await resetPassword({
      channel,
      identifier: form.identifier.trim(),
      verificationCode: form.verificationCode.trim(),
      password: form.password,
    })
    await router.replace({
      name: 'login',
      query: { reset: '1', identifier: form.identifier.trim() },
    })
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '密码重置失败'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AuthShell title="找回密码" subtitle="支持注册邮箱或手机号验证">
    <form class="auth-form" @submit.prevent="submit">
      <div class="form-field">
        <label for="reset-identifier">邮箱或手机号</label>
        <input
          id="reset-identifier"
          v-model="form.identifier"
          name="identifier"
          autocomplete="username"
          placeholder="请输入注册邮箱或手机号"
        />
      </div>
      <div class="form-field">
        <label for="reset-code">验证码</label>
        <div class="code-row">
          <input
            id="reset-code"
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
      <div class="form-field">
        <label for="reset-password">新密码</label>
        <input
          id="reset-password"
          v-model="form.password"
          name="password"
          type="password"
          autocomplete="new-password"
          placeholder="至少 8 位，包含字母和数字"
        />
      </div>
      <div class="form-field">
        <label for="reset-confirmation">确认新密码</label>
        <input
          id="reset-confirmation"
          v-model="form.confirmation"
          name="passwordConfirmation"
          type="password"
          autocomplete="new-password"
          placeholder="再次输入新密码"
        />
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
      <button class="submit-button" type="submit" :disabled="submitting">
        {{ submitting ? '保存中…' : '重置密码' }}
      </button>
    </form>
    <template #footer>
      <RouterLink class="back-to-login" to="/login">返回登录</RouterLink>
    </template>
  </AuthShell>
</template>

<style scoped>
.back-to-login {
  margin-top: 16px;
  color: #d8182d;
  font-size: 13px;
  text-decoration: none;
}
</style>
