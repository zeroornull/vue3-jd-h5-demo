import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import StoreCard from '../StoreCard.vue'
import { stores } from '@/mocks/catalog-data'

const store = stores[0]!

describe('StoreCard', () => {
  it('links into the store detail page with a typed id query', () => {
    const wrapper = mount(StoreCard, {
      props: { store },
      global: {
        stubs: {
          RouterLink: {
            props: ['to'],
            template: '<a :href="to"><slot /></a>',
          },
        },
      },
    })

    expect(wrapper.get('h2').text()).toBe(store.name)
    expect(wrapper.get('a').attributes('href')).toBe(`/storeDetail?id=${store.id}`)
    expect(wrapper.get('footer').text()).toContain('人关注')
  })
})
