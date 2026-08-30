import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'

const scrollMock = vi.hoisted(() => ({
  construct: vi.fn<() => void>(),
  destroy: vi.fn<() => void>(),
  refresh: vi.fn<() => void>(),
}))

vi.mock('better-scroll', () => ({
  default: class MockBScroll {
    y = 0
    maxScrollY = 0

    constructor() {
      scrollMock.construct()
    }

    on() {}
    destroy() {
      scrollMock.destroy()
    }
    refresh() {
      scrollMock.refresh()
    }
    enable() {}
    disable() {}
    scrollTo() {}
    scrollToElement() {}
  },
}))

import ListScroll from '../ListScroll.vue'

describe('ListScroll', () => {
  it('creates and destroys exactly one BetterScroll instance', async () => {
    const wrapper = mount(ListScroll, {
      slots: {
        default: '<div>content</div>',
      },
    })

    await nextTick()
    await nextTick()
    expect(scrollMock.construct).toHaveBeenCalledTimes(1)

    wrapper.unmount()
    expect(scrollMock.destroy).toHaveBeenCalledTimes(1)
  })
})
