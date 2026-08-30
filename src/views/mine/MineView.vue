<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'

import { useAuthStore } from '@/stores/auth'
import { useFocusStore } from '@/stores/focus'
import { useOrderStore } from '@/stores/order'
import { useProfileStore } from '@/stores/profile'

defineOptions({ name: 'MineView' })

const authStore = useAuthStore()
const orderStore = useOrderStore()
const profileStore = useProfileStore()
const focusStore = useFocusStore()
const { profile } = storeToRefs(profileStore)
const { counts } = storeToRefs(orderStore)

const productFollows = computed(() =>
  focusStore.loaded ? focusStore.count('product') : (profile.value?.productFollows ?? 0),
)
const storeFollows = computed(() =>
  focusStore.loaded ? focusStore.count('store') : (profile.value?.storeFollows ?? 0),
)

onMounted(() => {
  authStore.hydrate()
  void profileStore.load().catch(() => undefined)
  void orderStore.load().catch(() => undefined)
  void focusStore.load().catch(() => undefined)
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
        <RouterLink to="/myFocus?tab=product">
          <b>{{ productFollows }}</b>
          <span>商品关注</span>
        </RouterLink>
        <RouterLink to="/myFocus?tab=store">
          <b>{{ storeFollows }}</b>
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
      <RouterLink to="/node/nodeApplication">节点申请</RouterLink>
    </nav>

    <nav class="mine-list" aria-label="账户服务">
      <RouterLink to="/mine/shippingAddress">收货地址</RouterLink>
      <RouterLink to="/mine/messageCenter">消息中心</RouterLink>
      <RouterLink to="/mine/helpCenter">帮助中心</RouterLink>
      <RouterLink to="/mine/setting">设置</RouterLink>
    </nav>
  </div>
</template>
