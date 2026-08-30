import { products, stores } from './catalog-data.js'
import type { Appeal, Order, OrderAddress, OrderItem, OrderLogistics } from '../types/order.js'
import { orderGoodsTotal } from '../types/order.js'

const defaultAddress: OrderAddress = {
  receiver: '咋地',
  phone: '13545900066',
  detail: '广东省深圳市南山区科研路1001号比科大厦',
}

const flagshipStore = stores[0]!

function item(productId: string, quantity: number, spec: string): OrderItem {
  const product = products.find((candidate) => candidate.id === productId)

  if (!product) {
    throw new Error(`Unknown catalog product: ${productId}`)
  }

  return {
    productId: product.id,
    title: product.title,
    spec,
    image: product.image,
    price: product.price,
    quantity,
  }
}

function logistics(
  trackingNumber: string,
  statusLabel: string,
  events: OrderLogistics['events'],
): OrderLogistics {
  return {
    trackingNumber,
    from: '深圳南山区',
    to: '深圳南山区',
    pieceCount: 1,
    statusLabel,
    events,
  }
}

function order(partial: Omit<Order, 'payable' | 'storeId' | 'storeName' | 'storeLogo' | 'address'>): Order {
  return {
    ...partial,
    storeId: flagshipStore.id,
    storeName: flagshipStore.name,
    storeLogo: flagshipStore.logo,
    payable: orderGoodsTotal(partial.items),
    address: defaultAddress,
  }
}

export function createOrderSeed(): { orders: Order[]; appeals: Appeal[] } {
  const orders: Order[] = [
    order({
      id: 'order-unpaid',
      number: '202605211540350001',
      status: 'unpaid',
      items: [item('product-5', 2, '蓝色表带')],
      createdAt: '2026-05-21 13:40:40',
    }),
    order({
      id: 'order-cancelled',
      number: '202605211540350002',
      status: 'cancelled',
      items: [item('product-1', 1, '珍珠白')],
      createdAt: '2026-05-18 09:12:08',
      cancelledAt: '2026-05-18 09:40:11',
      cancelReason: '想了想，我不想要了',
    }),
    order({
      id: 'order-paid',
      number: '202605211540350003',
      paymentNumber: 'PAY202605211540350003',
      status: 'paid',
      items: [item('product-6', 1, '午夜黑')],
      paymentMethod: 'Top-Pay',
      createdAt: '2026-05-20 10:02:18',
      paidAt: '2026-05-20 10:03:01',
    }),
    order({
      id: 'order-to-ship',
      number: '202605211540350004',
      paymentNumber: 'PAY202605211540350004',
      status: 'to_ship',
      items: [item('product-2', 1, '遥控款')],
      paymentMethod: '微信支付',
      createdAt: '2026-05-19 16:20:00',
      paidAt: '2026-05-19 16:21:12',
    }),
    order({
      id: 'order-to-receive',
      number: '202605211540350005',
      paymentNumber: 'PAY202605211540350005',
      status: 'to_receive',
      items: [item('product-3', 1, '曜石黑')],
      paymentMethod: '支付宝',
      createdAt: '2026-05-16 08:28:00',
      paidAt: '2026-05-16 08:29:40',
      logistics: logistics('3350980779986900', '正在派送', [
        { time: '05/22 08:28', title: '正在派送', description: '包裹正在派送途中' },
        { time: '05/21 21:10', title: '运输中', description: '快件从深圳龙华区发出' },
        { time: '05/21 09:30', title: '已发货', description: '商家已将快件交给承运商' },
      ]),
    }),
    order({
      id: 'order-completed',
      number: '202605211540350006',
      paymentNumber: 'PAY202605211540350006',
      status: 'completed',
      items: [item('product-4', 1, '20英寸')],
      paymentMethod: '银行卡',
      createdAt: '2026-05-11 11:18:22',
      paidAt: '2026-05-11 11:19:03',
      logistics: logistics('3350980779986901', '已签收', [
        { time: '05/14 18:02', title: '已签收', description: '包裹已签收' },
        { time: '05/14 09:40', title: '正在派送', description: '快递员正在派送' },
        { time: '05/13 16:12', title: '已发货', description: '商家已将快件交给承运商' },
      ]),
    }),
  ]

  const appeals: Appeal[] = [
    {
      id: 'appeal-1',
      orderId: 'order-paid',
      contactName: '演示用户',
      contactPhone: '13800138000',
      content: '耳机降噪效果和页面描述有差距，希望协助核实。',
      images: ['/mock/catalog/product-6.png', '/mock/catalog/campaign-1.png'],
      createdAt: '2026-05-20 16:24:30',
      status: 'open',
    },
  ]

  return { orders, appeals }
}

export const defaultOrderAddress = defaultAddress
