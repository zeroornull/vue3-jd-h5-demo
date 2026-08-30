<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'ProgressBar' })

const props = withDefaults(
  defineProps<{
    value: number
    label?: string
  }>(),
  {
    label: '已售',
  },
)

const percentage = computed(() => Math.min(100, Math.max(0, Math.round(props.value))))
</script>

<template>
  <div
    class="progress"
    role="progressbar"
    :aria-label="label"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="percentage"
  >
    <span class="fill" :style="{ width: `${percentage}%` }" />
    <span class="label">{{ label }} {{ percentage }}%</span>
  </div>
</template>

<style scoped>
.progress {
  position: relative;
  width: 100%;
  height: 14px;
  overflow: hidden;
  border-radius: 999px;
  background: #fee2e2;
}

.fill {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: inherit;
  background: linear-gradient(90deg, #ef4444, #d8182d);
}

.label {
  position: relative;
  z-index: 1;
  display: block;
  color: #7f1d1d;
  font-size: 9px;
  line-height: 14px;
  text-align: center;
}
</style>
