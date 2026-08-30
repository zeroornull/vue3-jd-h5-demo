<script setup lang="ts">
import BScroll from 'better-scroll'
import type { BScrollInstance } from 'better-scroll'
import { nextTick, onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from 'vue'

defineOptions({ name: 'ListScroll' })

const props = withDefaults(
  defineProps<{
    probeType?: number
    click?: boolean
    scrollX?: boolean
    data?: unknown
    listenScroll?: boolean
    pullup?: boolean
    pulldown?: boolean
    beforeScroll?: boolean
    refreshDelay?: number
  }>(),
  {
    probeType: 1,
    click: true,
    scrollX: false,
    data: undefined,
    listenScroll: false,
    pullup: false,
    pulldown: false,
    beforeScroll: false,
    refreshDelay: 20,
  },
)

const emit = defineEmits<{
  scroll: [position: { x: number; y: number }]
  scrollToEnd: []
  pulldown: []
  beforeScroll: []
}>()

const wrapper = useTemplateRef<HTMLElement>('wrapper')
const scroll = shallowRef<BScrollInstance>()

function createScroll(): void {
  if (!wrapper.value) {
    return
  }

  scroll.value?.destroy()
  scroll.value = new BScroll(wrapper.value, {
    probeType: props.probeType,
    click: props.click,
    scrollX: props.scrollX,
  })

  if (props.listenScroll) {
    scroll.value.on('scroll', (position: { x: number; y: number }) => emit('scroll', position))
  }

  if (props.pullup) {
    scroll.value.on('scrollEnd', () => {
      if (scroll.value && scroll.value.y <= scroll.value.maxScrollY + 50) {
        emit('scrollToEnd')
      }
    })
  }

  if (props.pulldown) {
    scroll.value.on('touchEnd', (position: { x: number; y: number }) => {
      if (position.y > 50) {
        emit('pulldown')
      }
    })
  }

  if (props.beforeScroll) {
    scroll.value.on('beforeScrollStart', () => emit('beforeScroll'))
  }
}

function refresh(): void {
  scroll.value?.refresh()
}

function enable(): void {
  scroll.value?.enable()
}

function disable(): void {
  scroll.value?.disable()
}

function scrollTo(x: number, y: number, time?: number): void {
  scroll.value?.scrollTo(x, y, time)
}

function scrollToElement(
  target: HTMLElement | string,
  time = 0,
  offsetX: number | boolean = false,
  offsetY: number | boolean = false,
): void {
  scroll.value?.scrollToElement(target, time, offsetX, offsetY)
}

watch(
  () => props.data,
  () => {
    window.setTimeout(() => nextTick(refresh), props.refreshDelay)
  },
  { deep: true },
)

onMounted(() => nextTick(createScroll))
onBeforeUnmount(() => scroll.value?.destroy())

defineExpose({ refresh, enable, disable, scrollTo, scrollToElement })
</script>

<template>
  <div ref="wrapper" class="scroll-wrapper">
    <div class="scroll-content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.scroll-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.scroll-content {
  min-height: 100%;
}
</style>
