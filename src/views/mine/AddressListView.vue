<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'

import PageHeader from '@/components/PageHeader.vue'
import { useProfileStore } from '@/stores/profile'
import { ADDRESS_TAG_LABELS } from '@/types/profile'

defineOptions({ name: 'AddressListView' })

const profileStore = useProfileStore()
const { addresses } = storeToRefs(profileStore)

onMounted(() => {
  void profileStore.load().catch(() => undefined)
})
</script>

<template>
  <div class="mine-page">
    <PageHeader
      title="收货地址"
      :show-search="false"
      action-label="新增"
      action-to="/mine/addAddress"
    />

    <van-empty v-if="addresses.length === 0" description="还没有收货地址" />

    <article
      v-for="address in addresses"
      :key="address.id"
      class="address-card"
      :class="{ default: address.isDefault }"
    >
      <h3>
        {{ address.name }}
        <span class="tag">{{ ADDRESS_TAG_LABELS[address.tag] }}</span>
      </h3>
      <p>{{ address.region }} {{ address.detail }}</p>
      <p>{{ address.phone }}</p>
      <div class="row">
        <RouterLink class="order-ghost" :to="`/mine/addAddress?id=${address.id}`">编辑</RouterLink>
        <button
          v-if="!address.isDefault"
          type="button"
          class="order-ghost"
          @click="profileStore.setDefaultAddress(address.id)"
        >
          设为默认
        </button>
      </div>
    </article>

    <div class="order-footer" style="margin: 20px 16px">
      <RouterLink class="order-primary" to="/mine/addAddress" style="text-align: center">
        新增地址
      </RouterLink>
    </div>
  </div>
</template>
