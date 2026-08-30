<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import type { PickerColumn, PickerOption } from 'vant'
import { useRoute, useRouter } from 'vue-router'

import AppPicker from '@/components/AppPicker.vue'
import PageHeader from '@/components/PageHeader.vue'
import { useNodeStore } from '@/stores/node'
import type { NodeKind } from '@/types/node'
import {
  NODE_CITIES,
  NODE_DISTRICTS,
  NODE_INDUSTRIES,
  NODE_PAYMENT_METHODS,
  NODE_PROVINCES,
} from '@/types/node'
import { COUNTRY_REGIONS } from '@/types/profile'

defineOptions({ name: 'NodeApplyView' })

const route = useRoute()
const router = useRouter()
const nodeStore = useNodeStore()
const paymentOpen = ref(false)
const submitting = ref(false)
const errorMessage = ref('')
const form = reactive({
  shares: 1,
  country: '中国',
  province: '广东省',
  city: '深圳市',
  district: '南山区',
  industry: '互联网',
})

const kind = computed<NodeKind>(() => {
  const names: Record<string, NodeKind> = {
    areaNode: 'area',
    cityNode: 'city',
    stateNode: 'state',
    industryNode: 'industry',
    superNode: 'super',
  }
  return names[String(route.name)] ?? 'area'
})

const product = computed(() => nodeStore.findProduct(kind.value))
const amount = computed(() => (product.value?.unitPrice ?? 0) * form.shares)
const paymentOptions: PickerColumn = NODE_PAYMENT_METHODS.map((method) => ({
  text: method,
  value: method,
}))

function needs(field: 'country' | 'province' | 'city' | 'district' | 'industry'): boolean {
  return Boolean(product.value?.fields.includes(field))
}

function openPay(): void {
  if (!product.value) {
    return
  }

  if (form.shares < 1 || form.shares > product.value.remainingShares) {
    errorMessage.value = '份数超出剩余库存'
    return
  }

  errorMessage.value = ''
  paymentOpen.value = true
}

async function confirmPay(options: PickerOption[]): Promise<void> {
  if (!product.value) {
    return
  }

  submitting.value = true
  errorMessage.value = ''

  try {
    await nodeStore.apply({
      kind: product.value.id,
      shares: form.shares,
      paymentMethod: String(options[0]?.text ?? 'CoinPay'),
      country: needs('country') ? form.country : undefined,
      province: needs('province') ? form.province : undefined,
      city: needs('city') ? form.city : undefined,
      district: needs('district') ? form.district : undefined,
      industry: needs('industry') ? form.industry : undefined,
    })
    await router.replace('/node/nodeApplication')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '申请失败'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  void nodeStore.load().catch(() => undefined)
})
</script>

<template>
  <div class="node-page">
    <PageHeader :title="product?.title ?? '节点申请'" :show-search="false" />

    <section v-if="product" class="node-summary">
      <b>{{ amount }}</b>
      <small> {{ product.currency }}</small>
      <p>共{{ product.totalShares }}份，现剩余 {{ product.remainingShares }} 份</p>
    </section>

    <form v-if="product" class="node-form" @submit.prevent="openPay">
      <label v-if="needs('country')">
        国家
        <select v-model="form.country">
          <option v-for="region in COUNTRY_REGIONS" :key="region.code" :value="region.name">
            {{ region.name }}
          </option>
        </select>
      </label>
      <label v-if="needs('province')">
        州/省
        <select v-model="form.province">
          <option v-for="item in NODE_PROVINCES" :key="item" :value="item">{{ item }}</option>
        </select>
      </label>
      <label v-if="needs('city')">
        市
        <select v-model="form.city">
          <option v-for="item in NODE_CITIES" :key="item" :value="item">{{ item }}</option>
        </select>
      </label>
      <label v-if="needs('district')">
        区/县
        <select v-model="form.district">
          <option v-for="item in NODE_DISTRICTS" :key="item" :value="item">{{ item }}</option>
        </select>
      </label>
      <label v-if="needs('industry')">
        行业
        <select v-model="form.industry">
          <option v-for="item in NODE_INDUSTRIES" :key="item" :value="item">{{ item }}</option>
        </select>
      </label>
      <label>
        份数
        <van-stepper v-model="form.shares" integer :min="1" :max="product.remainingShares" />
      </label>
      <p v-if="errorMessage" class="page-state error" role="alert">{{ errorMessage }}</p>
      <button class="order-primary" type="submit" :disabled="submitting || product.remainingShares < 1">
        {{ submitting ? '提交中…' : '申请' }}
      </button>
    </form>

    <AppPicker
      v-model="paymentOpen"
      title="选择支付方式"
      :columns="paymentOptions"
      @confirm="confirmPay"
    />
  </div>
</template>
