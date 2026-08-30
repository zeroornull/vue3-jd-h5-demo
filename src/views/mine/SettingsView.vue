<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

import ConfirmDialog from '@/components/ConfirmDialog.vue'
import PageHeader from '@/components/PageHeader.vue'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'

defineOptions({ name: 'SettingsView' })

const router = useRouter()
const authStore = useAuthStore()
const profileStore = useProfileStore()
const { settings } = storeToRefs(profileStore)
const logoutOpen = ref(false)
const cacheOpen = ref(false)
const announcement = ref('')

async function toggleNotifications(): Promise<void> {
  await profileStore.updateSettings({ notifications: !settings.value.notifications })
}

function clearCache(): void {
  announcement.value = '本地缓存已清理（演示）'
}

function logout(): void {
  authStore.logout()
  void router.replace('/login')
}

onMounted(() => {
  void profileStore.load().catch(() => undefined)
})
</script>

<template>
  <div class="mine-page">
    <PageHeader title="设置" :show-search="false" />

    <div class="mine-list">
      <div class="mine-row">
        消息提醒
        <button
          type="button"
          class="mine-switch"
          :class="{ on: settings.notifications }"
          role="switch"
          :aria-checked="settings.notifications"
          @click="toggleNotifications"
        >
          <i />
        </button>
      </div>
      <button type="button" @click="cacheOpen = true">清除缓存</button>
      <RouterLink to="/setting/aboutAs">关于我们</RouterLink>
    </div>

    <div style="margin: 20px 16px">
      <button class="order-primary" type="button" style="width: 100%" @click="logoutOpen = true">
        退出登录
      </button>
    </div>
    <p class="page-state" role="status">{{ announcement }}</p>

    <ConfirmDialog
      v-model="cacheOpen"
      title="清除缓存"
      message="确定清除本地演示缓存提示吗？登录态不会被删除。"
      @confirm="clearCache"
    />
    <ConfirmDialog
      v-model="logoutOpen"
      title="退出登录"
      message="退出后再次访问个人中心和订单需要重新登录。"
      confirm-text="退出"
      @confirm="logout"
    />
  </div>
</template>
