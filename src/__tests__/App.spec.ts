import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('renders the migration shell around the router outlet', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterView: true,
        },
      },
    })

    expect(wrapper.get('h1').text()).toBe('vue3-jd-h5-demo')
    expect(wrapper.text()).toContain('第 3 轮已建立旧路由 URL 契约')
    expect(wrapper.findComponent({ name: 'RouterView' }).exists()).toBe(true)
  })
})
