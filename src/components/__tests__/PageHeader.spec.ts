import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

import PageHeader from '../PageHeader.vue'

async function mountHeader(props: {
  title: string
  subtitle?: string
  showBack?: boolean
  showSearch?: boolean
  actionLabel?: string
  actionTo?: string
}) {
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

  return mount(PageHeader, {
    props,
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
}

describe('PageHeader', () => {
  it('renders the title and a search shortcut by default', async () => {
    const wrapper = await mountHeader({ title: '店铺详情', subtitle: '商家信息' })

    expect(wrapper.get('h1').text()).toBe('店铺详情')
    expect(wrapper.get('p').text()).toBe('商家信息')
    expect(wrapper.get('a.search').attributes('href')).toBe('/search')
  })

  it('can hide search and show an action link', async () => {
    const wrapper = await mountHeader({
      title: '我的关注',
      showSearch: false,
      actionLabel: '设置',
      actionTo: '/mine/setting',
    })

    expect(wrapper.find('a.search').exists()).toBe(false)
    expect(wrapper.get('a.action').attributes('href')).toBe('/mine/setting')
    expect(wrapper.get('a.action').text()).toBe('设置')
  })
})
