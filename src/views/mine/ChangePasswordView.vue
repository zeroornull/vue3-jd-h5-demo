<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import PageHeader from '@/components/PageHeader.vue'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import { validatePassword, validatePasswordConfirmation } from '@/utils/auth-validation'

defineOptions({ name: 'ChangePasswordView' })

const router = useRouter()
const authStore = useAuthStore()
const profileStore = useProfileStore()
const submitting = ref(false)
const errorMessage = ref('')
const form = reactive({
  currentPassword: '',
  password: '',
  confirmation: '',
})

authStore.hydrate()

async function submit(): Promise<void> {
  const identifier = authStore.user?.identifier
  const passwordError = validatePassword(form.password)
  const confirmError = validatePasswordConfirmation(form.password, form.confirmation)

  if (!identifier || !form.currentPassword || passwordError || confirmError) {
    errorMessage.value =
      (!identifier && '请先登录') ||
      (!form.currentPassword && '请输入当前密码') ||
      passwordError ||
      confirmError ||
      '请检查密码'
    return
  }

  submitting.value = true
  errorMessage.value = ''

  try {
    await profileStore.changePassword({
      identifier,
      currentPassword: form.currentPassword,
      password: form.password,
    })
    await router.replace('/mine/personInfo')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '修改密码失败'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="mine-page">
    <PageHeader title="修改密码" :show-search="false" />
    <form class="mine-form" @submit.prevent="submit">
      <label>
        账号
        <input :value="authStore.user?.identifier ?? ''" disabled />
      </label>
      <label>
        当前密码
        <input v-model="form.currentPassword" type="password" autocomplete="current-password" />
      </label>
      <label>
        新密码
        <input
          v-model="form.password"
          type="password"
          autocomplete="new-password"
          placeholder="8～64 位，包含字母和数字"
        />
      </label>
      <label>
        重复新密码
        <input v-model="form.confirmation" type="password" autocomplete="new-password" />
      </label>
      <p v-if="errorMessage" class="page-state error" role="alert">{{ errorMessage }}</p>
      <button class="order-primary" type="submit" :disabled="submitting">
        {{ submitting ? '保存中…' : '保存' }}
      </button>
    </form>
  </div>
</template>
