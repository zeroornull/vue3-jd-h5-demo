<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'

import PageHeader from '@/components/PageHeader.vue'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'

defineOptions({ name: 'ProfileView' })

const authStore = useAuthStore()
const profileStore = useProfileStore()
const { profile } = storeToRefs(profileStore)
const nicknameOpen = ref(false)
const nickname = ref('')
const errorMessage = ref('')

const maskedPhone = computed(() => profile.value?.phone || '未设置')
const emailLabel = computed(() => profile.value?.email || '未设置')

function openNickname(): void {
  nickname.value = profile.value?.displayName ?? ''
  errorMessage.value = ''
  nicknameOpen.value = true
}

async function saveNickname(): Promise<void> {
  const displayName = nickname.value.trim()
  if (!displayName) {
    errorMessage.value = '请输入昵称'
    return
  }

  const next = await profileStore.updateProfile({ displayName })
  authStore.updateUser({ displayName: next.displayName })
  nicknameOpen.value = false
}

onMounted(() => {
  authStore.hydrate()
  void profileStore.load().catch(() => undefined)
})
</script>

<template>
  <div class="mine-page">
    <PageHeader title="个人资料" :show-search="false" />

    <div class="mine-list">
      <div class="mine-row">
        头像
        <img
          :src="profile?.avatar ?? '/mock/auth/logo.png'"
          alt=""
          width="40"
          height="40"
          style="border-radius: 50%"
        />
      </div>
      <button type="button" @click="openNickname">
        昵称
        <span>{{ profile?.displayName ?? '未设置' }}</span>
      </button>
      <RouterLink to="/mine/phoneNumberSetting">
        手机号
        <span>{{ maskedPhone }}</span>
      </RouterLink>
      <RouterLink to="/mine/settingMail">
        邮箱号
        <span>{{ emailLabel }}</span>
      </RouterLink>
      <RouterLink to="/mine/changePassword">修改密码</RouterLink>
    </div>

    <van-popup v-model:show="nicknameOpen" position="bottom" round>
      <div class="nickname-panel">
        <h3>填写昵称</h3>
        <input v-model="nickname" placeholder="请输入" />
        <p v-if="errorMessage" class="page-state error">{{ errorMessage }}</p>
      </div>
      <div class="nickname-actions">
        <button type="button" @click="nicknameOpen = false">取消</button>
        <button type="button" class="ok" @click="saveNickname">确认</button>
      </div>
    </van-popup>
  </div>
</template>
