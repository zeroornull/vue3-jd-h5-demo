import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

import AppTabbar from '../AppTabbar.vue'

async function mountTabbar(path: string) {
  setActivePinia(createPinia())
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/index',
        component: { template: '<div />' },
        meta: { migrationStatus: 'migrated', showTabbar: true },
      },
      {
        path: '/search',
        component: { template: '<div />' },
        meta: { migrationStatus: 'migrated', showTabbar: false },
      },
    ],
  })
  await router.push(path)
  await router.isReady()

  return mount(AppTabbar, {
    global: {
      plugins: [router],
      stubs: {
        'van-tabbar': { template: '<nav class="tabbar"><slot /></nav>' },
        'van-tabbar-item': {
          props: ['to'],
          template: '<a :href="to"><slot /></a>',
        },
      },
    },
  })
}

describe('AppTabbar', () => {
  it('renders tab links only on routes marked showTabbar', async () => {
    const visible = await mountTabbar('/index')
    expect(visible.get('nav.tabbar').text()).toContain('首页')
    expect(visible.get('a[href="/shopCart"]').text()).toContain('购物车')

    const hidden = await mountTabbar('/search')
    expect(hidden.find('nav.tabbar').exists()).toBe(false)
  })
})
