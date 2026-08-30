<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'

import { useCartStore } from '@/stores/cart'

defineOptions({ name: 'AppTabbar' })

const cartStore = useCartStore()
const { count } = storeToRefs(cartStore)
const route = useRoute()
const visible = computed(() => route.meta.showTabbar === true)
</script>

<template>
  <van-tabbar
    v-if="visible"
    route
    active-color="#d8182d"
    inactive-color="#64748b"
    safe-area-inset-bottom
  >
    <van-tabbar-item replace name="index" icon="home-o" to="/index">首页</van-tabbar-item>
    <van-tabbar-item replace name="classify" icon="apps-o" to="/classify">分类</van-tabbar-item>
    <van-tabbar-item
      replace
      name="shopCart"
      icon="shopping-cart-o"
      to="/shopCart"
      :badge="count > 0 ? count : undefined"
    >
      购物车
    </van-tabbar-item>
    <van-tabbar-item replace name="mine" icon="user-o" to="/mine">我的</van-tabbar-item>
  </van-tabbar>
</template>
