<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'

import PageHeader from '@/components/PageHeader.vue'
import ProductCard from '@/components/ProductCard.vue'
import StoreCard from '@/components/StoreCard.vue'
import { useCartStore } from '@/stores/cart'
import { useCatalogStore } from '@/stores/catalog'
import { useFocusStore } from '@/stores/focus'
import type { CatalogProduct } from '@/types/catalog'

defineOptions({ name: 'CampaignView' })

const route = useRoute()
const catalogStore = useCatalogStore()
const cartStore = useCartStore()
const focusStore = useFocusStore()
const { loading, errorMessage } = storeToRefs(catalogStore)
const activeTab = ref(0)
const reminders = reactive(new Set<string>())
const announcement = ref('')

const campaignId = computed(() => String(route.name ?? ''))
const campaign = computed(() => catalogStore.findCampaign(campaignId.value))
const campaignProducts = computed(() =>
  campaign.value ? catalogStore.productsByIds(campaign.value.productIds) : [],
)
const campaignStores = computed(() =>
  campaign.value ? catalogStore.storesByIds(campaign.value.storeIds ?? []) : [],
)

watch(campaignId, () => {
  activeTab.value = 0
})

function addProduct(product: CatalogProduct): void {
  cartStore.addToCart(product)
  announcement.value = `已将 ${product.title} 加入购物车`
}

async function toggleFavorite(productId: string): Promise<void> {
  try {
    const followed = await focusStore.toggle({ kind: 'product', id: productId })
    announcement.value = followed ? '已加入关注' : '已取消关注'
  } catch (error) {
    announcement.value = error instanceof Error ? error.message : '操作失败'
  }
}

function toggleReminder(): void {
  if (!campaign.value) {
    return
  }

  if (reminders.has(campaign.value.id)) {
    reminders.delete(campaign.value.id)
    announcement.value = `已取消 ${campaign.value.title} 提醒`
  } else {
    reminders.add(campaign.value.id)
    announcement.value = `已设置 ${campaign.value.title} 提醒`
  }
}

onMounted(() => {
  void catalogStore.load().catch(() => undefined)
  void focusStore.load().catch(() => undefined)
})
</script>

<template>
  <div class="campaign-view">
    <PageHeader
      :title="campaign?.title ?? '营销活动'"
      :subtitle="campaign?.subtitle"
    />

    <div v-if="loading" class="page-state" role="status">正在加载活动…</div>
    <div v-else-if="errorMessage" class="page-state error" role="alert">
      <p>{{ errorMessage }}</p>
      <van-button size="small" type="danger" plain @click="catalogStore.load(true)">
        重新加载
      </van-button>
    </div>
    <div v-else-if="!campaign" class="page-state" role="alert">活动不存在或已经结束</div>

    <template v-else>
      <section class="campaign-hero" :style="{ '--campaign-accent': campaign.accent }">
        <div>
          <p>{{ campaign.kind === 'ranking' ? '实时榜单' : '限时精选' }}</p>
          <h1>{{ campaign.title }}</h1>
          <span>{{ campaign.subtitle }}</span>
        </div>
        <div v-if="campaign.countdownMs" class="countdown">
          <small>距本场结束</small>
          <van-count-down :time="campaign.countdownMs" format="HH:mm:ss" />
        </div>
        <button
          v-if="campaign.kind === 'flash'"
          type="button"
          class="reminder"
          :aria-pressed="reminders.has(campaign.id)"
          @click="toggleReminder"
        >
          {{ reminders.has(campaign.id) ? '已设置提醒' : '提醒我' }}
        </button>
      </section>

      <van-tabs v-model:active="activeTab" shrink color="#d8182d" line-width="24">
        <van-tab v-for="tab in campaign.tabs" :key="tab" :title="tab">
          <main>
            <section v-if="campaign.kind === 'shops'" class="store-list" aria-label="推荐店铺">
              <StoreCard v-for="store in campaignStores" :key="store.id" :store="store" />
            </section>
            <section v-else class="product-list" :aria-label="campaign.title">
              <ProductCard
                v-for="(product, index) in campaignProducts"
                :key="product.id"
                :product="product"
                :rank="campaign.kind === 'ranking' ? index + 1 : undefined"
                :show-progress="campaign.kind === 'flash'"
                :show-favorite="campaign.kind === 'discovery'"
                :favorite="focusStore.hasProduct(product.id)"
                :action-label="campaign.kind === 'flash' ? '去抢购' : '加入购物车'"
                @add="addProduct(product)"
                @toggle-favorite="toggleFavorite(product.id)"
              />
            </section>
          </main>
        </van-tab>
      </van-tabs>
      <p class="visually-hidden" aria-live="polite">{{ announcement }}</p>
    </template>
  </div>
</template>

<style scoped>
.campaign-view {
  min-height: 100vh;
  background: #f4f6f8;
}

.campaign-hero {
  position: relative;
  display: flex;
  min-height: 148px;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
  margin: 14px;
  padding: 22px;
  overflow: hidden;
  border-radius: 20px;
  background:
    radial-gradient(circle at 90% 10%, rgb(255 255 255 / 24%), transparent 34%),
    linear-gradient(135deg, var(--campaign-accent), #111827);
  color: #fff;
}

.campaign-hero::after {
  position: absolute;
  right: -34px;
  bottom: -56px;
  width: 150px;
  height: 150px;
  border: 28px solid rgb(255 255 255 / 8%);
  border-radius: 50%;
  content: '';
}

.campaign-hero p,
.campaign-hero h1,
.campaign-hero span {
  margin: 0;
}

.campaign-hero p {
  font-size: 11px;
  letter-spacing: 0.08em;
  opacity: 0.78;
  text-transform: uppercase;
}

.campaign-hero h1 {
  margin-top: 4px;
  font-size: 25px;
}

.campaign-hero span {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  opacity: 0.84;
}

.countdown {
  position: relative;
  z-index: 1;
  text-align: right;
}

.countdown small {
  display: block;
  margin-bottom: 4px;
  opacity: 0.72;
}

.countdown :deep(.van-count-down) {
  color: #fff;
  font-size: 18px;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
}

.reminder {
  position: absolute;
  z-index: 2;
  top: 16px;
  right: 16px;
  padding: 6px 10px;
  border: 1px solid rgb(255 255 255 / 55%);
  border-radius: 999px;
  background: rgb(255 255 255 / 12%);
  color: #fff;
  font-size: 10px;
}

.campaign-view :deep(.van-tabs__nav) {
  background: transparent;
}

main {
  padding: 14px 14px 32px;
}

.product-list,
.store-list {
  display: grid;
  gap: 12px;
}

.page-state {
  display: grid;
  min-height: 50vh;
  place-content: center;
  gap: 12px;
  padding: 24px;
  color: #64748b;
  text-align: center;
}

.page-state p {
  margin: 0;
}

.error {
  color: #b91c1c;
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
  .campaign-view {
    width: 540px;
    margin: 0 auto;
  }
}
</style>
