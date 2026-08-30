<script setup lang="ts">
import SvgIcon from './SvgIcon.vue'

defineOptions({ name: 'ConfirmDialog' })

withDefaults(
  defineProps<{
    title?: string
    message: string
    confirmText?: string
    cancelText?: string
  }>(),
  {
    title: '请确认',
    confirmText: '确认',
    cancelText: '取消',
  },
)

const opened = defineModel<boolean>({ default: false })
const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

function cancel(): void {
  opened.value = false
  emit('cancel')
}

function confirm(): void {
  opened.value = false
  emit('confirm')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div v-if="opened" class="dialog-mask" @click.self="cancel">
        <section
          class="dialog-panel"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-message"
        >
          <SvgIcon name="icon-alertwarn" class="dialog-icon" :size="32" aria-hidden="true" />
          <h2 id="confirm-dialog-title">{{ title }}</h2>
          <p id="confirm-dialog-message">{{ message }}</p>
          <footer>
            <button type="button" class="cancel" @click="cancel">{{ cancelText }}</button>
            <button type="button" class="confirm" @click="confirm">{{ confirmText }}</button>
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.dialog-mask {
  position: fixed;
  z-index: 3000;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgb(15 23 42 / 55%);
}

.dialog-panel {
  width: min(320px, 100%);
  overflow: hidden;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 24px 64px rgb(15 23 42 / 24%);
  text-align: center;
}

.dialog-icon {
  margin-top: 24px;
  color: #d8182d;
}

h2,
p {
  margin: 0;
}

h2 {
  margin-top: 12px;
  font-size: 18px;
}

p {
  padding: 12px 24px 24px;
  color: #64748b;
  font-size: 14px;
}

footer {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  border-top: 1px solid #e2e8f0;
}

button {
  min-height: 48px;
  border: 0;
  background: #fff;
  color: #334155;
}

button + button {
  border-left: 1px solid #e2e8f0;
}

.confirm {
  color: #d8182d;
  font-weight: 600;
}

.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 160ms ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}
</style>
