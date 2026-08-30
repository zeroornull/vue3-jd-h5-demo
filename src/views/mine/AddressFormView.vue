<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import PageHeader from '@/components/PageHeader.vue'
import { useProfileStore } from '@/stores/profile'
import type { AddressGender, AddressTag } from '@/types/profile'
import { CITY_REGIONS } from '@/types/profile'
import { validateIdentifier } from '@/utils/auth-validation'

defineOptions({ name: 'AddressFormView' })

const route = useRoute()
const router = useRouter()
const profileStore = useProfileStore()
const submitting = ref(false)
const errorMessage = ref('')
const form = reactive({
  name: '',
  phone: '',
  gender: 'female' as AddressGender,
  region: '广东省深圳市南山区',
  detail: '',
  tag: 'home' as AddressTag,
  isDefault: false,
})

const addressId = computed(() => (typeof route.query.id === 'string' ? route.query.id : ''))
const title = computed(() => (addressId.value ? '编辑收货地址' : '新增所在地区'))

watch(
  () => profileStore.findAddress(addressId.value),
  (address) => {
    if (!address) {
      return
    }

    form.name = address.name
    form.phone = address.phone
    form.gender = address.gender
    form.region = address.region
    form.detail = address.detail
    form.tag = address.tag
    form.isDefault = address.isDefault
  },
  { immediate: true },
)

async function submit(): Promise<void> {
  const phoneError = validateIdentifier('phone', form.phone)
  if (!form.name.trim() || phoneError || !form.detail.trim()) {
    errorMessage.value = (!form.name.trim() && '请输入姓名') || phoneError || '请输入详细地址'
    return
  }

  submitting.value = true
  errorMessage.value = ''

  try {
    await profileStore.saveAddress(
      {
        name: form.name.trim(),
        phone: form.phone.trim(),
        gender: form.gender,
        region: form.region,
        detail: form.detail.trim(),
        tag: form.tag,
        isDefault: form.isDefault,
      },
      addressId.value || undefined,
    )
    await router.replace('/mine/shippingAddress')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '保存地址失败'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  void profileStore.load().catch(() => undefined)
})
</script>

<template>
  <div class="mine-page">
    <PageHeader :title="title" :show-search="false" />

    <form class="mine-form" @submit.prevent="submit">
      <label>
        联系人
        <input v-model="form.name" autocomplete="name" placeholder="请输入姓名" />
      </label>
      <div class="chip-row">
        <button type="button" :class="{ active: form.gender === 'female' }" @click="form.gender = 'female'">
          女士
        </button>
        <button type="button" :class="{ active: form.gender === 'male' }" @click="form.gender = 'male'">
          男士
        </button>
      </div>
      <label>
        电话
        <input v-model="form.phone" type="tel" inputmode="tel" placeholder="手机号码" />
      </label>
      <label>
        所在地区
        <select v-model="form.region">
          <option v-for="region in CITY_REGIONS" :key="region" :value="region">{{ region }}</option>
        </select>
      </label>
      <label>
        地址
        <input v-model="form.detail" placeholder="道路、门牌号、小区、楼栋号、单元室等" />
      </label>
      <div>
        <p class="order-hint">标签</p>
        <div class="chip-row">
          <button type="button" :class="{ active: form.tag === 'home' }" @click="form.tag = 'home'">家</button>
          <button type="button" :class="{ active: form.tag === 'school' }" @click="form.tag = 'school'">
            学校
          </button>
          <button type="button" :class="{ active: form.tag === 'company' }" @click="form.tag = 'company'">
            公司
          </button>
        </div>
      </div>
      <label class="mine-row" style="padding: 0">
        设为默认地址
        <input v-model="form.isDefault" type="checkbox" />
      </label>
      <p v-if="errorMessage" class="page-state error" role="alert">{{ errorMessage }}</p>
      <button class="order-primary" type="submit" :disabled="submitting">
        {{ submitting ? '保存中…' : '保存' }}
      </button>
    </form>
  </div>
</template>
