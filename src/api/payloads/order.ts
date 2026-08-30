import {
  expectArray,
  expectNumber,
  expectOneOf,
  expectRecord,
  expectString,
  expectStringArray,
  optionalString,
} from '../types'
import type {
  Appeal,
  AppealStatus,
  LogisticsEvent,
  Order,
  OrderAddress,
  OrderItem,
  OrderLogistics,
  OrderSnapshot,
  OrderStatus,
} from '@/types/order'

const ORDER_STATUSES = [
  'unpaid',
  'cancelled',
  'paid',
  'to_ship',
  'to_receive',
  'completed',
] as const satisfies readonly OrderStatus[]
const APPEAL_STATUSES = ['open', 'supplemented'] as const satisfies readonly AppealStatus[]

function parseOrderAddress(value: unknown): OrderAddress {
  const record = expectRecord(value, 'address')
  return {
    receiver: expectString(record.receiver, 'address.receiver'),
    phone: expectString(record.phone, 'address.phone'),
    detail: expectString(record.detail, 'address.detail'),
  }
}

function parseOrderItem(value: unknown): OrderItem {
  const record = expectRecord(value, 'item')
  return {
    productId: expectString(record.productId, 'item.productId'),
    title: expectString(record.title, 'item.title'),
    spec: expectString(record.spec, 'item.spec'),
    image: expectString(record.image, 'item.image'),
    price: expectNumber(record.price, 'item.price'),
    quantity: expectNumber(record.quantity, 'item.quantity'),
  }
}

function parseLogisticsEvent(value: unknown): LogisticsEvent {
  const record = expectRecord(value, 'event')
  return {
    time: expectString(record.time, 'event.time'),
    title: expectString(record.title, 'event.title'),
    description: expectString(record.description, 'event.description'),
  }
}

function parseLogistics(value: unknown): OrderLogistics | undefined {
  if (value === undefined) {
    return undefined
  }

  const record = expectRecord(value, 'logistics')
  return {
    trackingNumber: expectString(record.trackingNumber, 'logistics.trackingNumber'),
    from: expectString(record.from, 'logistics.from'),
    to: expectString(record.to, 'logistics.to'),
    pieceCount: expectNumber(record.pieceCount, 'logistics.pieceCount'),
    statusLabel: expectString(record.statusLabel, 'logistics.statusLabel'),
    events: expectArray(record.events, parseLogisticsEvent, 'logistics.events'),
  }
}

export function parseOrder(value: unknown): Order {
  const record = expectRecord(value, 'order')
  return {
    id: expectString(record.id, 'order.id'),
    number: expectString(record.number, 'order.number'),
    paymentNumber: optionalString(record.paymentNumber, 'order.paymentNumber'),
    status: expectOneOf(record.status, ORDER_STATUSES, 'order.status'),
    storeId: expectString(record.storeId, 'order.storeId'),
    storeName: expectString(record.storeName, 'order.storeName'),
    storeLogo: expectString(record.storeLogo, 'order.storeLogo'),
    items: expectArray(record.items, parseOrderItem, 'order.items'),
    payable: expectNumber(record.payable, 'order.payable'),
    paymentMethod: optionalString(record.paymentMethod, 'order.paymentMethod'),
    createdAt: expectString(record.createdAt, 'order.createdAt'),
    paidAt: optionalString(record.paidAt, 'order.paidAt'),
    cancelledAt: optionalString(record.cancelledAt, 'order.cancelledAt'),
    cancelReason: optionalString(record.cancelReason, 'order.cancelReason'),
    address: parseOrderAddress(record.address),
    logistics: parseLogistics(record.logistics),
  }
}

export function parseAppeal(value: unknown): Appeal {
  const record = expectRecord(value, 'appeal')
  return {
    id: expectString(record.id, 'appeal.id'),
    orderId: expectString(record.orderId, 'appeal.orderId'),
    contactName: expectString(record.contactName, 'appeal.contactName'),
    contactPhone: expectString(record.contactPhone, 'appeal.contactPhone'),
    content: expectString(record.content, 'appeal.content'),
    images: expectStringArray(record.images, 'appeal.images'),
    createdAt: expectString(record.createdAt, 'appeal.createdAt'),
    status: expectOneOf(record.status, APPEAL_STATUSES, 'appeal.status'),
  }
}

export function parseOrderSnapshot(value: unknown): OrderSnapshot {
  const record = expectRecord(value, 'orders')
  return {
    orders: expectArray(record.orders, parseOrder, 'orders'),
    appeals: expectArray(record.appeals, parseAppeal, 'appeals'),
  }
}
