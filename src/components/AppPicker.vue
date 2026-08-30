<script setup lang="ts">
import type { PickerColumn, PickerConfirmEventParams, PickerOption } from 'vant'

defineOptions({ name: 'AppPicker' })

withDefaults(
  defineProps<{
    title?: string
    columns: PickerColumn | PickerColumn[]
  }>(),
  {
    title: '请选择',
  },
)

const opened = defineModel<boolean>({ default: false })
const emit = defineEmits<{
  confirm: [selectedOptions: PickerOption[]]
  cancel: []
}>()

function cancel(): void {
  opened.value = false
  emit('cancel')
}

function confirm({ selectedOptions }: PickerConfirmEventParams): void {
  opened.value = false
  emit(
    'confirm',
    selectedOptions.filter((option): option is PickerOption => option !== undefined),
  )
}
</script>

<template>
  <van-popup v-model:show="opened" position="bottom" round safe-area-inset-bottom>
    <van-picker :title="title" :columns="columns" @cancel="cancel" @confirm="confirm" />
  </van-popup>
</template>
