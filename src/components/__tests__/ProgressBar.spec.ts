import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ProgressBar from '../ProgressBar.vue'

describe('ProgressBar', () => {
  it('rounds and clamps the accessible progress value', () => {
    const wrapper = mount(ProgressBar, { props: { value: 120.4 } })

    expect(wrapper.attributes('aria-valuenow')).toBe('100')
    expect(wrapper.get('.fill').attributes('style')).toContain('width: 100%')
    expect(wrapper.text()).toContain('已售 100%')
  })
})
