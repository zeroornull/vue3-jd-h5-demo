<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import OrderCard from '@/components/OrderCard.vue'
import PageHeader from '@/components/PageHeader.vue'
import { useAuthStore } from '@/stores/auth'
import { useOrderStore } from '@/stores/order'
import { validateIdentifier } from '@/utils/auth-validation'

defineOptions({ name: 'AppealFormView' })

const DEMO_IMAGES = [
  '/mock/catalog/product-6.png',
  '/mock/catalog/campaign-1.png',
  '/mock/home/product-1.png',
]

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()
const authStore = useAuthStore()
const submitting = ref(false)
const errorMessage = ref('')
const form = reactive({
  contactName: '',
  contactPhone: '',
  content: '',
  images: [] as string[],
})

const orderId = computed(() => (typeof route.query.id === 'string' ? route.query.id : ''))
const order = computed(() => orderStore.findOrder(orderId.value) ?? orderStore.orders[0])

function addDemoImage(): void {
  const next = DEMO_IMAGES.find((image) => !form.images.includes(image))
  if (next && form.images.length < 5) {
    form.images.push(next)
  }
}

async function submit(): Promise<void> {
  if (!order.value) {
    errorMessage.value = '订单不存在'
    return
  }

  const phoneError = validateIdentifier('phone', form.contactPhone)
  if (!form.contactName.trim() || phoneError || !form.content.trim()) {
    errorMessage.value = (!form.contactName.trim() && '请输入姓名') || phoneError || '请输入申诉内容'
    return
  }

  submitting.value = true
  errorMessage.value = ''

  try {
    await orderStore.createAppeal({
      orderId: order.value.id,
      contactName: form.contactName.trim(),
      contactPhone: form.contactPhone.trim(),
      content: form.content.trim(),
      images: form.images,
    })
    await router.replace('/order/appealRecord')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '提交申诉失败'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  authStore.hydrate()
  form.contactName = authStore.user?.displayName ?? ''
  if (authStore.user?.identifier && !authStore.user.identifier.includes('@')) {
    form.contactPhone = authStore.user.identifier
  }
  void orderStore.load().catch(() => undefined)
})
</script>

<template>
  <div class="order-page">
    <PageHeader
      title="商品申诉"
      :show-search="false"
      action-label="申诉记录"
      action-to="/order/appealRecord"
    />

    <div v-if="!order" class="page-state">没有可申诉的订单</div>
    <template v-else>
      <OrderCard :order="order" />
      <form class="order-form" @submit.prevent="submit">
        <label>
          用户名
          <input v-model="form.contactName" autocomplete="name" placeholder="请输入姓名" />
        </label>
        <label>
          手机号
          <input
            v-model="form.contactPhone"
            type="tel"
            inputmode="tel"
            autocomplete="tel"
            placeholder="请输入手机号"
          />
        </label>
        <label>
          申诉内容
          <textarea v-model="form.content" placeholder="请输入申诉内容" />
        </label>
        <div>
          <p class="order-hint">图片上传（最多可上传 5 张）</p>
          <div class="order-images">
            <img v-for="image in form.images" :key="image" :src="image" alt="申诉凭证" />
            <button v-if="form.images.length < 5" type="button" @click="addDemoImage">
              添加示例图
            </button>
          </div>
        </div>
        <p v-if="errorMessage" class="page-state error" role="alert">{{ errorMessage }}</p>
        <div class="order-footer">
          <button class="order-primary" type="submit" :disabled="submitting">
            {{ submitting ? '提交中…' : '提交' }}
          </button>
        </div>
      </form>
    </template>
  </div>
</template>
