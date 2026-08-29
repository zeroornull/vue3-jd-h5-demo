import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import SvgIcon from '../SvgIcon.vue'

describe('SvgIcon', () => {
  it('renders repository-owned SVG markup with accessible labeling', () => {
    const wrapper = mount(SvgIcon, {
      props: {
        name: 'check',
        label: '完成',
        size: 20,
      },
    })

    expect(wrapper.attributes('role')).toBe('img')
    expect(wrapper.attributes('aria-label')).toBe('完成')
    expect(wrapper.attributes('style')).toContain('width: 20px')
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('keeps the legacy iconClass prop as a migration bridge', () => {
    const wrapper = mount(SvgIcon, {
      props: {
        iconClass: 'check',
      },
    })

    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.attributes('aria-hidden')).toBe('true')
  })

  it('renders nothing for an unknown icon', () => {
    const wrapper = mount(SvgIcon, { props: { name: 'missing' } })

    expect(wrapper.html()).toBe('<!--v-if-->')
  })
})
