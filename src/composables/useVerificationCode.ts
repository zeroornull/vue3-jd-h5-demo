import { onScopeDispose, ref } from 'vue'

import { sendVerificationCode } from '@/api/auth'
import type { SendVerificationCodeInput } from '@/types/auth'

export function useVerificationCode() {
  const sending = ref(false)
  const cooldown = ref(0)
  const statusMessage = ref('')
  const errorMessage = ref('')
  let timer: number | undefined

  function stopTimer(): void {
    if (timer !== undefined) {
      window.clearInterval(timer)
      timer = undefined
    }
  }

  function startTimer(seconds: number): void {
    stopTimer()
    cooldown.value = seconds
    timer = window.setInterval(() => {
      cooldown.value = Math.max(0, cooldown.value - 1)
      if (cooldown.value === 0) {
        stopTimer()
      }
    }, 1000)
  }

  async function send(input: SendVerificationCodeInput): Promise<boolean> {
    if (sending.value || cooldown.value > 0) {
      return false
    }

    sending.value = true
    statusMessage.value = ''
    errorMessage.value = ''

    try {
      const result = await sendVerificationCode(input)
      startTimer(result.expiresInSeconds)
      statusMessage.value = result.developmentCode
        ? `验证码已发送，开发环境验证码：${result.developmentCode}`
        : '验证码已发送'
      return true
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '验证码发送失败'
      return false
    } finally {
      sending.value = false
    }
  }

  onScopeDispose(stopTimer)

  return {
    sending,
    cooldown,
    statusMessage,
    errorMessage,
    send,
  }
}
