import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it } from 'vitest'

import AppPicker from '../AppPicker.vue'

const VanPopupStub = defineComponent({
  name: 'VanPopup',
  props: { show: Boolean },
  template: '<div><slot /></div>',
})
const VanPickerStub = defineComponent({
  name: 'VanPicker',
  emits: ['confirm', 'cancel'],
  template: '<div />',
})

describe('AppPicker', () => {
  it('forwards selected options and closes the wrapper model', async () => {
    const wrapper = mount(AppPicker, {
      props: {
        modelValue: true,
        columns: [{ text: '微信支付', value: 'wechat-pay' }],
      },
      global: {
        stubs: {
          VanPopup: VanPopupStub,
          VanPicker: VanPickerStub,
        },
      },
    })

    wrapper.findComponent(VanPickerStub).vm.$emit('confirm', {
      selectedValues: ['wechat-pay'],
      selectedOptions: [{ text: '微信支付', value: 'wechat-pay' }],
      selectedIndexes: [0],
    })
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('confirm')?.[0]).toEqual([
      [{ text: '微信支付', value: 'wechat-pay' }],
    ])
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
  })
})
