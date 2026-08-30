import { http } from './http'
import type { ApiResponse } from './types'
import { unwrapApiResponse } from './types'
import type { ApplyNodeInput, NodeApplication, NodeSnapshot } from '@/types/node'

export async function getNodeSnapshot(): Promise<NodeSnapshot> {
  const response = await http.get<ApiResponse<NodeSnapshot>>('/nodes')
  return unwrapApiResponse(response.data)
}

export async function applyNode(input: ApplyNodeInput): Promise<NodeApplication> {
  const response = await http.post<ApiResponse<NodeApplication>>('/nodes/apply', input)
  return unwrapApiResponse(response.data)
}
