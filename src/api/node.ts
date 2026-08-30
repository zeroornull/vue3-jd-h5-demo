import { http } from './http'
import { parseNodeApplication, parseNodeSnapshot } from './payloads'
import { readApiData } from './types'
import type { ApplyNodeInput, NodeApplication, NodeSnapshot } from '@/types/node'

export async function getNodeSnapshot(): Promise<NodeSnapshot> {
  return readApiData(http.get<unknown>('/nodes'), parseNodeSnapshot)
}

export async function applyNode(input: ApplyNodeInput): Promise<NodeApplication> {
  return readApiData(http.post<unknown>('/nodes/apply', input), parseNodeApplication)
}
