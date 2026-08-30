<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'

import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useAuthStore } from '@/stores/auth'
import { useOrderStore } from '@/stores/order'
import { useProfileStore } from '@/stores/profile'

defineOptions({ name: 'MineView' })

const authStore = useAuthStore()
const orderStore = useOrderStore()
const profileStore = useProfileStore()
const { profile } = storeToRefs(profileStore)
const { counts } = storeToRefs(orderStore)
const nodeDialogOpen = ref(false)

onMounted(() => {
  authStore.hydrate()
  void profileStore.load().catch(() => undefined)
  void orderStore.load().catch(() => undefined)
})
</script>

<template>
  <div class="mine-page">
    <section class="mine-hero">
      <RouterLink class="user" to="/mine/personInfo">
        <img :src="profile?.avatar ?? '/mock/auth/logo.png'" alt="" />
        <div>
          <h2>{{ profile?.displayName ?? authStore.user?.displayName ?? '未登录' }}</h2>
          <p>{{ profile?.region ?? '中国 +86' }}</p>
        </div>
      </RouterLink>
      <div class="mine-stats">
        <RouterLink to="/myFocus">
          <b>{{ profile?.productFollows ?? 0 }}</b>
          <span>商品关注</span>
        </RouterLink>
        <RouterLink to="/myFocus">
          <b>{{ profile?.storeFollows ?? 0 }}</b>
          <span>店铺关注</span>
        </RouterLink>
        <div>
          <b>{{ profile?.footprints ?? 0 }}</b>
          <span>我的足迹</span>
        </div>
      </div>
    </section>

    <section class="mine-card">
      <header>
        <strong>我的订单</strong>
        <RouterLink to="/order">查看全部订单 &gt;&gt;</RouterLink>
      </header>
      <nav class="mine-shortcuts" aria-label="订单快捷入口">
        <RouterLink to="/order?tab=unpaid">
          <strong>{{ counts.unpaid }}</strong>
          待付款
        </RouterLink>
        <RouterLink to="/order?tab=to_ship">
          <strong>{{ counts.to_ship }}</strong>
          待发货
        </RouterLink>
        <RouterLink to="/order?tab=to_receive">
          <strong>{{ counts.to_receive }}</strong>
          待收货
        </RouterLink>
        <RouterLink to="/order/appealRecord">
          <strong>{{ orderStore.appeals.length }}</strong>
          退换/售后
        </RouterLink>
      </nav>
    </section>

    <nav class="mine-list" aria-label="资产与节点">
      <RouterLink to="/wallet/myWallet">我的钱包</RouterLink>
      <RouterLink to="/node/nodeApplication">节点申请 <span>待迁移</span></RouterLink>
      <button type="button" @click="nodeDialogOpen = true">
        分享节点 <span>查看说明</span>
      </button>
    </nav>

    <nav class="mine-list" aria-label="账户服务">
      <RouterLink to="/mine/shippingAddress">收货地址</RouterLink>
      <RouterLink to="/mine/messageCenter">消息中心</RouterLink>
      <RouterLink to="/mine/helpCenter">帮助中心</RouterLink>
      <RouterLink to="/mine/setting">设置</RouterLink>
    </nav>

    <ConfirmDialog
      v-model="nodeDialogOpen"
      title="我的节点数据"
      message="分享节点、区级/市级/州级/行业/超级节点将在节点子域迁移后开放。"
      confirm-text="我知道啦"
    />
  </div>
</template>
