import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ProductCard from '../ProductCard.vue'
import { products } from '@/mocks/catalog-data'

const product = products[0]!

describe('ProductCard', () => {
  it('links to a typed product detail and emits cart/favorite actions', async () => {
    const wrapper = mount(ProductCard, {
      props: {
        product,
        rank: 1,
        showProgress: true,
        showFavorite: true,
      },
      global: {
        stubs: {
          RouterLink: {
            props: ['to'],
            template: '<a :href="to"><slot /></a>',
          },
          VanIcon: true,
        },
      },
    })

    expect(wrapper.get('.product-link').attributes('href')).toBe(
      `/classify/product?id=${product.id}`,
    )
    expect(wrapper.get('.rank').text()).toBe('1')
    expect(wrapper.find('[role="progressbar"]').exists()).toBe(true)

    await wrapper.get('button.favorite').trigger('click')
    await wrapper.get('button.add').trigger('click')

    expect(wrapper.emitted('toggleFavorite')).toHaveLength(1)
    expect(wrapper.emitted('add')).toHaveLength(1)
  })
})
