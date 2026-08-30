import { HttpError } from './http'

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function expectRecord(value: unknown, label = 'object'): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new HttpError(`Invalid API payload: ${label}`)
  }

  return value
}

export function expectString(value: unknown, label: string): string {
  if (typeof value !== 'string') {
    throw new HttpError(`Invalid API payload: ${label}`)
  }

  return value
}

export function expectNumber(value: unknown, label: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new HttpError(`Invalid API payload: ${label}`)
  }

  return value
}

export function expectBoolean(value: unknown, label: string): boolean {
  if (typeof value !== 'boolean') {
    throw new HttpError(`Invalid API payload: ${label}`)
  }

  return value
}

export function optionalString(value: unknown, label: string): string | undefined {
  return value === undefined ? undefined : expectString(value, label)
}

export function optionalNumber(value: unknown, label: string): number | undefined {
  return value === undefined ? undefined : expectNumber(value, label)
}

export function expectOneOf<T extends string>(
  value: unknown,
  allowed: readonly T[],
  label: string,
): T {
  if (typeof value === 'string') {
    for (const item of allowed) {
      if (item === value) {
        return item
      }
    }
  }

  throw new HttpError(`Invalid API payload: ${label}`)
}

export function expectArray<T>(
  value: unknown,
  parseItem: (item: unknown) => T,
  label: string,
): T[] {
  if (!Array.isArray(value)) {
    throw new HttpError(`Invalid API payload: ${label}`)
  }

  return value.map((item) => parseItem(item))
}

export function expectStringArray(value: unknown, label: string): string[] {
  if (!Array.isArray(value)) {
    throw new HttpError(`Invalid API payload: ${label}`)
  }

  return value.map((item, index) => expectString(item, `${label}[${index}]`))
}

export function unwrapApiResponse(payload: unknown): unknown {
  const envelope = expectRecord(payload, 'envelope')
  const code = expectNumber(envelope.code, 'code')
  const message = expectString(envelope.message, 'message')

  if (code !== 1) {
    throw new HttpError(message || 'API request failed', {
      data: { code, message, data: envelope.data },
    })
  }

  return envelope.data
}

export function unwrapApiData<T>(payload: unknown, parse: (data: unknown) => T): T {
  return parse(unwrapApiResponse(payload))
}

export async function readApiData<T>(
  request: Promise<{ data: unknown }>,
  parse: (data: unknown) => T,
): Promise<T> {
  const response = await request
  return unwrapApiData(response.data, parse)
}
