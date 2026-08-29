<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'SvgIcon' })

interface Props {
  name?: string
  iconClass?: string
  className?: string
  label?: string
  size?: number | string
}

const props = withDefaults(defineProps<Props>(), {
  name: undefined,
  iconClass: undefined,
  className: undefined,
  label: undefined,
  size: 24,
})

// The raw markup is limited to repository-owned SVG files discovered at build time.
const iconModules = import.meta.glob<string>('../assets/icons/*.svg', {
  eager: true,
  query: '?raw',
  import: 'default',
})

const iconRegistry = new Map<string, string>()

for (const [path, markup] of Object.entries(iconModules)) {
  const match = path.match(/\/([^/]+)\.svg$/)
  const iconName = match?.[1]

  if (iconName) {
    iconRegistry.set(iconName, markup)
  }
}

const resolvedName = computed(() => props.name ?? props.iconClass ?? '')
const markup = computed(() => iconRegistry.get(resolvedName.value))
const dimension = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))
</script>

<template>
  <span
    v-if="markup"
    class="svg-icon"
    :class="className"
    :style="{ width: dimension, height: dimension }"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
    v-html="markup"
  />
</template>

<style scoped>
.svg-icon {
  display: inline-flex;
  flex: none;
  color: currentcolor;
  line-height: 0;
  vertical-align: middle;
}

.svg-icon :deep(svg) {
  width: 100%;
  height: 100%;
}
</style>
