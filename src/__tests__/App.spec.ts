import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('renders the round-one migration shell', () => {
    const wrapper = mount(App)

    expect(wrapper.get('h1').text()).toBe('vue3-jd-h5-demo')
    expect(wrapper.text()).toContain('第 1 轮现代工程骨架已就绪')
  })
})
