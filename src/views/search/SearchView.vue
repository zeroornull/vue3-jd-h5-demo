<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

import { getHotSearchTerms } from '@/api/search'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import SvgIcon from '@/components/SvgIcon.vue'
import { useSearchStore } from '@/stores/search'
import type { HotSearchTerm } from '@/types/catalog'

defineOptions({ name: 'SearchView' })

const router = useRouter()
const searchStore = useSearchStore()
const { searchHistory } = storeToRefs(searchStore)
const input = useTemplateRef<HTMLInputElement>('input')
const query = ref('')
const hotTerms = ref<HotSearchTerm[]>([])
const loading = ref(true)
const errorMessage = ref('')
const clearDialogOpen = ref(false)
const announcement = ref('')

async function loadHotTerms(): Promise<void> {
  loading.value = true
  errorMessage.value = ''

  try {
    hotTerms.value = await getHotSearchTerms()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '热搜词加载失败'
  } finally {
    loading.value = false
  }
}

function selectTerm(term: string): void {
  query.value = term
  searchStore.addHistory(term)
  announcement.value = `已记录搜索词 ${term}`
}

function submit(): void {
  const keyword = query.value.trim()

  if (!keyword) {
    errorMessage.value = '请输入搜索内容'
    input.value?.focus()
    return
  }

  errorMessage.value = ''
  selectTerm(keyword)
}

function clearHistory(): void {
  searchStore.clearHistory()
  announcement.value = '搜索历史已清空'
}

onMounted(() => {
  searchStore.hydrate()
  void loadHotTerms()
  input.value?.focus()
})
</script>

<template>
  <div class="search-view">
    <header class="search-header">
      <button type="button" class="back" aria-label="返回上一页" @click="router.back()">
        <SvgIcon name="left-btn" :size="22" />
      </button>
      <form class="search-form" role="search" @submit.prevent="submit">
        <SvgIcon name="search" :size="18" />
        <input
          id="catalog-search"
          ref="input"
          v-model="query"
          name="catalog-search"
          type="search"
          aria-label="搜索商品与关键词"
          placeholder="搜索商品与关键词"
        />
      </form>
      <button type="button" class="submit" @click="submit">搜索</button>
    </header>

    <p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>

    <main>
      <section aria-labelledby="hot-search-title">
        <div class="section-heading">
          <h2 id="hot-search-title">热搜词</h2>
          <span v-if="loading">加载中…</span>
        </div>
        <div class="term-list">
          <button
            v-for="term in hotTerms"
            :key="term.title"
            type="button"
            :class="{ hot: term.hot }"
            @click="selectTerm(term.title)"
          >
            {{ term.title }}
            <SvgIcon v-if="term.hot" name="hot" :size="13" />
          </button>
        </div>
      </section>

      <section aria-labelledby="search-history-title">
        <div class="section-heading">
          <h2 id="search-history-title">历史搜索</h2>
          <button
            v-if="searchHistory.length"
            type="button"
            class="delete-history"
            aria-label="清空搜索历史"
            @click="clearDialogOpen = true"
          >
            <SvgIcon name="icon-delete" :size="18" />
          </button>
        </div>
        <div v-if="searchHistory.length" class="term-list history">
          <button
            v-for="term in searchHistory"
            :key="term"
            type="button"
            @click="selectTerm(term)"
          >
            {{ term }}
          </button>
        </div>
        <p v-else class="empty-history">还没有搜索记录</p>
      </section>
    </main>

    <ConfirmDialog
      v-model="clearDialogOpen"
      title="清空历史"
      message="确定删除全部搜索历史吗？"
      @confirm="clearHistory"
    />
    <p class="visually-hidden" aria-live="polite">{{ announcement }}</p>
  </div>
</template>

<style scoped lang="scss">
.search-view {
  min-height: 100vh;
  background: #f4f6f8;
}

.search-header {
  position: sticky;
  z-index: 20;
  top: 0;
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
  padding: 12px;
  background: #fff;
  box-shadow: 0 1px 0 #e2e8f0;
}

.back,
.submit,
.delete-history {
  border: 0;
  background: transparent;
}

.back {
  display: grid;
  width: 40px;
  height: 40px;
  padding: 0;
  place-items: center;
}

.submit {
  padding: 8px;
  color: #d8182d;
  font-weight: 600;
}

.search-form {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 9px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  background: #f8fafc;
  color: #64748b;
}

.search-form input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: #1e293b;
  font-size: 14px;
}

main {
  display: grid;
  gap: 16px;
  padding: 16px;
}

section {
  padding: 18px;
  border-radius: 16px;
  background: #fff;
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.section-heading h2 {
  margin: 0;
  font-size: 16px;
}

.section-heading > span,
.empty-history {
  color: #94a3b8;
  font-size: 12px;
}

.term-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

.term-list button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 7px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 999px;
  background: #fff;
  color: #475569;
  font-size: 13px;
}

.term-list button.hot {
  border-color: #fecaca;
  background: #fff1f2;
  color: #d8182d;
}

.history button {
  border-color: transparent;
  background: #f1f5f9;
}

.delete-history {
  display: grid;
  width: 36px;
  height: 36px;
  padding: 0;
  place-items: center;
  color: #64748b;
}

.empty-history {
  margin: 16px 0 0;
}

.error {
  margin: 12px 16px 0;
  color: #b91c1c;
  font-size: 13px;
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
  .search-view {
    width: 540px;
    margin: 0 auto;
  }
}
</style>
