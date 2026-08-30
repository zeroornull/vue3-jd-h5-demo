<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { register } from '@/api/auth'
import AuthShell from '@/components/AuthShell.vue'
import { useAuthStore } from '@/stores/auth'
import type { AuthChannel } from '@/types/auth'
import { validatePassword, validatePasswordConfirmation } from '@/utils/auth-validation'

defineOptions({ name: 'RegisterCompleteView' })

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const form = reactive({
  displayName: '',
  password: '',
  confirmation: '',
})
const submitting = ref(false)
const errorMessage = ref('')

const channel = computed<AuthChannel>(() =>
  route.name === 'emailRegisterTwo' ? 'email' : 'phone',
)
const draft = computed(() =>
  authStore.registrationDraft?.channel === channel.value ? authStore.registrationDraft : undefined,
)
const startRoute = computed(() =>
  channel.value === 'email' ? '/register/emailRegister' : '/register/phoneRegister',
)

async function submit(): Promise<void> {
  if (!draft.value) {
    errorMessage.value = '注册步骤已过期，请重新验证账号'
    return
  }

  const passwordError = validatePassword(form.password)
  const confirmationError = validatePasswordConfirmation(form.password, form.confirmation)

  if (!form.displayName.trim() || passwordError || confirmationError) {
    errorMessage.value =
      (!form.displayName.trim() && '请输入昵称') ||
      passwordError ||
      confirmationError ||
      '请检查注册信息'
    return
  }

  submitting.value = true
  errorMessage.value = ''

  try {
    await register({
      ...draft.value,
      displayName: form.displayName.trim(),
      password: form.password,
    })
    const identifier = draft.value.identifier
    authStore.clearRegistrationDraft()
    await router.replace({ name: 'login', query: { registered: '1', identifier } })
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '注册失败'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AuthShell title="设置登录信息" subtitle="密码须为 8～64 位并同时包含字母和数字">
    <div v-if="!draft" class="expired-state" role="alert">
      <p>注册步骤已过期，请重新验证账号。</p>
      <RouterLink :to="startRoute">返回上一步</RouterLink>
    </div>
    <form v-else class="auth-form" @submit.prevent="submit">
      <p class="auth-message">正在注册：{{ draft.identifier }}</p>
      <div class="form-field">
        <label for="register-name">昵称</label>
        <input
          id="register-name"
          v-model="form.displayName"
          name="displayName"
          autocomplete="nickname"
          placeholder="请输入昵称"
        />
      </div>
      <div class="form-field">
        <label for="register-password">密码</label>
        <input
          id="register-password"
          v-model="form.password"
          name="password"
          type="password"
          autocomplete="new-password"
          placeholder="至少 8 位，包含字母和数字"
        />
      </div>
      <div class="form-field">
        <label for="register-password-confirmation">确认密码</label>
        <input
          id="register-password-confirmation"
          v-model="form.confirmation"
          name="passwordConfirmation"
          type="password"
          autocomplete="new-password"
          placeholder="再次输入密码"
        />
      </div>
      <p v-if="errorMessage" class="auth-error" role="alert">{{ errorMessage }}</p>
      <button class="submit-button" type="submit" :disabled="submitting">
        {{ submitting ? '注册中…' : '完成注册' }}
      </button>
    </form>
  </AuthShell>
</template>

<style scoped>
.expired-state {
  margin-top: 20px;
  padding: 16px;
  border-radius: 12px;
  background: #fff7ed;
  color: #9a3412;
  font-size: 13px;
}

.expired-state p {
  margin: 0 0 10px;
}

.expired-state a {
  color: #d8182d;
}
</style>
