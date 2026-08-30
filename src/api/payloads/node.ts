import {
  expectArray,
  expectNumber,
  expectOneOf,
  expectRecord,
  expectString,
  optionalString,
} from '../types'
import type { NodeApplication, NodeKind, NodeProduct, NodeSnapshot } from '@/types/node'

const NODE_KINDS = ['share', 'area', 'city', 'state', 'industry', 'super'] as const satisfies readonly NodeKind[]
const NODE_FIELDS = ['country', 'province', 'city', 'district', 'industry'] as const

function parseNodeProduct(value: unknown): NodeProduct {
  const record = expectRecord(value, 'nodeProduct')
  return {
    id: expectOneOf(record.id, NODE_KINDS, 'nodeProduct.id'),
    name: expectString(record.name, 'nodeProduct.name'),
    title: expectString(record.title, 'nodeProduct.title'),
    path: expectString(record.path, 'nodeProduct.path'),
    totalShares: expectNumber(record.totalShares, 'nodeProduct.totalShares'),
    remainingShares: expectNumber(record.remainingShares, 'nodeProduct.remainingShares'),
    unitPrice: expectNumber(record.unitPrice, 'nodeProduct.unitPrice'),
    currency: expectOneOf(record.currency, ['USDT'] as const, 'nodeProduct.currency'),
    accent: expectString(record.accent, 'nodeProduct.accent'),
    fields: expectArray(
      record.fields,
      (item) => expectOneOf(item, NODE_FIELDS, 'nodeProduct.fields'),
      'nodeProduct.fields',
    ),
  }
}

export function parseNodeApplication(value: unknown): NodeApplication {
  const record = expectRecord(value, 'nodeApplication')
  return {
    id: expectString(record.id, 'nodeApplication.id'),
    kind: expectOneOf(record.kind, NODE_KINDS, 'nodeApplication.kind'),
    kindName: expectString(record.kindName, 'nodeApplication.kindName'),
    shares: expectNumber(record.shares, 'nodeApplication.shares'),
    amount: expectNumber(record.amount, 'nodeApplication.amount'),
    paymentMethod: expectString(record.paymentMethod, 'nodeApplication.paymentMethod'),
    country: optionalString(record.country, 'nodeApplication.country'),
    province: optionalString(record.province, 'nodeApplication.province'),
    city: optionalString(record.city, 'nodeApplication.city'),
    district: optionalString(record.district, 'nodeApplication.district'),
    industry: optionalString(record.industry, 'nodeApplication.industry'),
    createdAt: expectString(record.createdAt, 'nodeApplication.createdAt'),
  }
}

export function parseNodeSnapshot(value: unknown): NodeSnapshot {
  const record = expectRecord(value, 'nodes')
  return {
    products: expectArray(record.products, parseNodeProduct, 'products'),
    applications: expectArray(record.applications, parseNodeApplication, 'applications'),
  }
}
