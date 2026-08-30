<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import type { PickerColumn, PickerOption } from 'vant'
import { useRouter } from 'vue-router'

import AppPicker from '@/components/AppPicker.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import SvgIcon from '@/components/SvgIcon.vue'
import { useCartStore } from '@/stores/cart'
import { useOrderStore } from '@/stores/order'

defineOptions({ name: 'CartView' })

const router = useRouter()
const cartStore = useCartStore()
const orderStore = useOrderStore()
const { items, count, selectedCount, selectedTotal, allSelected } = storeToRefs(cartStore)
const checkingOut = ref(false)
const editMode = ref(false)
const deleteDialogOpen = ref(false)
const paymentPickerOpen = ref(false)
const announcement = ref('')
const paymentOptions: PickerColumn = [
  { text: 'Top-Pay', value: 'top-pay' },
  { text: '支付宝', value: 'alipay' },
  { text: '微信支付', value: 'wechat-pay' },
  { text: '银行卡', value: 'bank-card' },
]

function formatPrice(value: number): string {
  return `¥${value.toFixed(2)}`
}

function updateQuantity(productId: string, value: string | number): void {
  cartStore.setQuantity(productId, Number(value))
}

function removeSelected(): void {
  const removed = selectedCount.value
  cartStore.removeSelected()
  announcement.value = `已删除 ${removed} 种商品`
}

function checkout(): void {
  if (selectedCount.value === 0) {
    announcement.value = '请先选择需要结算的商品'
    return
  }

  paymentPickerOpen.value = true
}

async function confirmPayment(options: PickerOption[]): Promise<void> {
  const selectedItems = cartStore.items.filter((item) => item.selected)

  if (selectedItems.length === 0) {
    announcement.value = '请先选择需要结算的商品'
    return
  }

  checkingOut.value = true

  try {
    const order = await orderStore.createOrder({
      items: selectedItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        spec: item.subtitle,
      })),
      paymentMethod: String(options[0]?.text ?? 'Top-Pay'),
    })
    cartStore.removeSelected()
    announcement.value = `已创建订单 ${order.number}`
    await router.push({ path: '/order/orderDetail', query: { id: order.id } })
  } catch (error) {
    announcement.value = error instanceof Error ? error.message : '创建订单失败'
  } finally {
    checkingOut.value = false
  }
}
</script>

<template>
  <div class="cart-view">
    <header class="cart-header">
      <div>
        <p>购物车</p>
        <h2>{{ count }} 件商品</h2>
      </div>
      <button v-if="items.length" type="button" @click="editMode = !editMode">
        {{ editMode ? '完成' : '编辑' }}
      </button>
    </header>

    <van-empty v-if="items.length === 0" description="购物车还是空的">
      <template #image>
        <SvgIcon name="shopping-cart" :size="112" />
      </template>
      <RouterLink class="continue-shopping" to="/index">去首页挑选商品</RouterLink>
    </van-empty>

    <section v-else class="cart-list" aria-label="购物车商品">
      <article v-for="item in items" :key="item.id" class="cart-item">
        <van-checkbox
          :model-value="item.selected"
          checked-color="#d8182d"
          :aria-label="`选择 ${item.title}`"
          @update:model-value="cartStore.setSelected(item.id, Boolean($event))"
        />
        <img :src="item.image" :alt="item.title" />
        <div class="item-content">
          <h3>{{ item.title }}</h3>
          <p>{{ item.subtitle }}</p>
          <div class="item-footer">
            <strong>{{ formatPrice(item.price) }}</strong>
            <van-stepper
              :model-value="item.quantity"
              :min="1"
              :max="item.stock"
              integer
              @update:model-value="updateQuantity(item.id, $event)"
            />
          </div>
        </div>
      </article>
    </section>

    <footer v-if="items.length" class="cart-actions">
      <van-checkbox
        :model-value="allSelected"
        checked-color="#d8182d"
        @update:model-value="cartStore.toggleAll(Boolean($event))"
      >
        全选
      </van-checkbox>
      <div v-if="!editMode" class="checkout-summary">
        <span>合计 <strong>{{ formatPrice(selectedTotal) }}</strong></span>
        <button type="button" class="primary" :disabled="checkingOut" @click="checkout">
          {{ checkingOut ? '提交中…' : `结算 (${selectedCount})` }}
        </button>
      </div>
      <button
        v-else
        type="button"
        class="danger-outline"
        :disabled="selectedCount === 0"
        @click="deleteDialogOpen = true"
      >
        删除所选
      </button>
    </footer>

    <ConfirmDialog
      v-model="deleteDialogOpen"
      title="删除商品"
      message="确定删除选中的购物车商品吗？"
      @confirm="removeSelected"
    />
    <AppPicker
      v-model="paymentPickerOpen"
      title="选择支付方式"
      :columns="paymentOptions"
      @confirm="confirmPayment"
    />
    <p class="visually-hidden" aria-live="polite">{{ announcement }}</p>
  </div>
</template>

<style scoped lang="scss">
.cart-view {
  min-height: 100vh;
  padding: 16px 16px 132px;
  background: #f4f6f8;
}

.cart-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  padding: 8px 2px 16px;
}

.cart-header p,
.cart-header h2 {
  margin: 0;
}

.cart-header p {
  color: #64748b;
  font-size: 12px;
}

.cart-header h2 {
  margin-top: 2px;
  font-size: 24px;
}

.cart-header button {
  border: 0;
  background: transparent;
  color: #d8182d;
}

.continue-shopping {
  display: inline-block;
  padding: 10px 18px;
  border: 1px solid #d8182d;
  border-radius: 999px;
  color: #d8182d;
  text-decoration: none;
}

.cart-list {
  display: grid;
  gap: 12px;
}

.cart-item {
  display: grid;
  grid-template-columns: auto 88px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  min-width: 0;
  padding: 14px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 6px 20px rgb(15 23 42 / 6%);
}

.cart-item > img {
  width: 88px;
  height: 88px;
  border-radius: 12px;
  background: #f8fafc;
  object-fit: contain;
}

.item-content {
  min-width: 0;
}

.item-content h3,
.item-content p {
  margin: 0;
}

.item-content h3 {
  overflow: hidden;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-content p {
  display: -webkit-box;
  overflow: hidden;
  margin-top: 5px;
  color: #64748b;
  font-size: 11px;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.item-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 12px;
}

.item-footer strong,
.checkout-summary strong {
  color: #d8182d;
}

.item-footer :deep(.van-stepper__input) {
  width: 28px;
}

.cart-actions {
  position: fixed;
  z-index: 30;
  bottom: calc(50px + env(safe-area-inset-bottom));
  left: 50%;
  display: flex;
  width: min(540px, 100%);
  min-height: 64px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
  border-top: 1px solid #e2e8f0;
  background: #fff;
  box-shadow: 0 -8px 24px rgb(15 23 42 / 8%);
  transform: translateX(-50%);
}

.checkout-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
}

.primary,
.danger-outline {
  min-height: 42px;
  padding: 0 18px;
  border-radius: 999px;
  font-weight: 600;
}

.primary {
  border: 0;
  background: #d8182d;
  color: #fff;
}

.danger-outline {
  border: 1px solid #d8182d;
  background: #fff;
  color: #d8182d;
}

.danger-outline:disabled {
  opacity: 0.45;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

@media (min-width: 540px) {
  .cart-view {
    width: 540px;
    margin: 0 auto;
  }
}
</style>
