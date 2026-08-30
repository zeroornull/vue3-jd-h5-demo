import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

import AuthShell from '../AuthShell.vue'

describe('AuthShell', () => {
  it('renders the auth card, default slot and optional switch link', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/',
          component: { template: '<div />' },
          meta: { migrationStatus: 'migrated' },
        },
      ],
    })
    await router.push('/')
    await router.isReady()

    const wrapper = mount(AuthShell, {
      props: {
        title: '账号登录',
        subtitle: '使用邮箱登录',
        switchLabel: '没有账号？去注册',
        switchTo: '/register/emailRegister',
      },
      slots: {
        default: '<button type="submit">登录</button>',
      },
      global: {
        plugins: [router],
        stubs: {
          RouterLink: {
            props: ['to'],
            template: '<a :href="to"><slot /></a>',
          },
          SvgIcon: true,
        },
      },
    })

    expect(wrapper.get('h2').text()).toBe('账号登录')
    expect(wrapper.get('button[type="submit"]').text()).toBe('登录')
    expect(wrapper.get('a.switch-link').attributes('href')).toBe('/register/emailRegister')
  })
})
