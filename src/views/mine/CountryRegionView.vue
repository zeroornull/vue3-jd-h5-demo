<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import PageHeader from '@/components/PageHeader.vue'
import { useProfileStore } from '@/stores/profile'
import { COUNTRY_REGIONS } from '@/types/profile'

defineOptions({ name: 'CountryRegionView' })

const router = useRouter()
const profileStore = useProfileStore()
const query = ref('')

const filtered = computed(() => {
  const keyword = query.value.trim().toLowerCase()
  if (!keyword) {
    return COUNTRY_REGIONS
  }

  return COUNTRY_REGIONS.filter(
    (region) =>
      region.name.toLowerCase().includes(keyword) || region.code.includes(keyword),
  )
})

function selectRegion(name: string, code: string): void {
  profileStore.draftRegion = `${name} ${code}`
  void router.back()
}
</script>

<template>
  <div class="mine-page">
    <PageHeader title="国家/地区" :show-search="false" />
    <div class="region-search">
      <input v-model="query" type="search" placeholder="搜索国家或区号" />
    </div>
    <div class="mine-list">
      <button
        v-for="region in filtered"
        :key="`${region.name}-${region.code}`"
        type="button"
        @click="selectRegion(region.name, region.code)"
      >
        {{ region.name }}
        <span>{{ region.code }}</span>
      </button>
    </div>
    <p v-if="filtered.length === 0" class="page-state">没有匹配的国家/地区</p>
  </div>
</template>
