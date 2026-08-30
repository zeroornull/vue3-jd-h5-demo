<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AuthShell from '@/components/AuthShell.vue'
import { useAuthStore } from '@/stores/auth'
import { safeRedirectPath } from '@/utils/auth-validation'

defineOptions({ name: 'LoginView' })

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const form = reactive({
  identifier: typeof route.query.identifier === 'string' ? route.query.identifier : '',
  password: '',
})
const errorMessage = ref('')
const notice = computed(() => {
  if (route.query.registered === '1') {
    return '注册成功，请使用新账号登录'
  }
  if (route.query.reset === '1') {
    return '密码已重置，请使用新密码登录'
  }
  return ''
})

async function submit(): Promise<void> {
  const identifier = form.identifier.trim()

  if (!identifier || !form.password) {
    errorMessage.value = '请输入账号和密码'
    return
  }

  errorMessage.value = ''

  try {
    await authStore.login({ identifier, password: form.password })
    await router.replace(safeRedirectPath(route.query.redirect))
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '登录失败'
  }
}
</script>

<template>
  <AuthShell title="账号登录" subtitle="使用用户名、邮箱或手机号登录">
    <p v-if="notice" class="auth-message" role="status">{{ notice }}</p>
    <p class="demo-hint">演示账号：demo@example.com / Password123</p>
    <form class="auth-form" @submit.prevent="submit">
      <div class="form-field">
        <label for="login-identifier">账号</label>
        <input
          id="login-identifier"
          v-model="form.identifier"
          name="identifier"
          autocomplete="username"
          placeholder="用户名 / 邮箱 / 手机号"
        />
      </div>
      <div class="form-field">
        <label for="login-password">密码</label>
        <input
          id="login-password"
          v-model="form.password"
          name="password"
          type="password"
          autocomplete="current-password"
          placeholder="请输入密码"
        />
      </div>
      <p v-if="errorMessage || authStore.errorMessage" class="auth-error" role="alert">
        {{ errorMessage || authStore.errorMessage }}
      </p>
      <button class="submit-button" type="submit" :disabled="authStore.loading">
        {{ authStore.loading ? '登录中…' : '登录' }}
      </button>
    </form>
    <nav class="auth-secondary-links" aria-label="登录帮助">
      <RouterLink to="/mine/forgetPassword">忘记密码</RouterLink>
      <RouterLink to="/register/emailRegister">邮箱注册</RouterLink>
      <RouterLink to="/register/phoneRegister">手机注册</RouterLink>
    </nav>
  </AuthShell>
</template>

<style scoped>
.demo-hint {
  margin: 14px 0 0;
  padding: 9px 11px;
  border-radius: 10px;
  background: #f8fafc;
  color: #64748b;
  font-size: 11px;
}
</style>
