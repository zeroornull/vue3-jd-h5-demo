import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ConfirmDialog from '../ConfirmDialog.vue'

describe('ConfirmDialog', () => {
  it('closes and emits confirm from an accessible dialog', async () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        modelValue: true,
        message: '确定删除吗？',
      },
      global: {
        stubs: {
          Teleport: true,
        },
      },
    })

    expect(wrapper.get('[role="alertdialog"]').attributes('aria-modal')).toBe('true')
    await wrapper.get('button.confirm').trigger('click')

    expect(wrapper.emitted('confirm')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
  })
})
