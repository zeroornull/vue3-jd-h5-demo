import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import OrderCard from '../OrderCard.vue'
import { createOrderSeed } from '@/mocks/order-data'

const order = createOrderSeed().orders[0]!

describe('OrderCard', () => {
  it('renders store, status and a typed detail link', () => {
    const wrapper = mount(OrderCard, {
      props: { order },
      slots: {
        actions: '<a href="/order/cancelOrder">取消订单</a>',
      },
      global: {
        stubs: {
          RouterLink: {
            props: ['to'],
            template: '<a :href="to"><slot /></a>',
          },
        },
      },
    })

    expect(wrapper.text()).toContain('待支付')
    expect(wrapper.text()).toContain(order.number)
    expect(wrapper.get('.item').attributes('href')).toBe(`/order/orderDetail?id=${order.id}`)
    expect(wrapper.text()).toContain('取消订单')
  })
})
