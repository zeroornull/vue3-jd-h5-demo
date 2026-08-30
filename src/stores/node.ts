import { ref } from 'vue'
import { defineStore } from 'pinia'

import { applyNode, getNodeSnapshot } from '@/api/node'
import type { ApplyNodeInput, NodeApplication, NodeKind, NodeProduct, NodeSnapshot } from '@/types/node'

export const useNodeStore = defineStore('node', () => {
  const products = ref<NodeProduct[]>([])
  const applications = ref<NodeApplication[]>([])
  const loaded = ref(false)
  const loading = ref(false)
  const errorMessage = ref('')

  function applySnapshot(snapshot: NodeSnapshot): void {
    products.value = snapshot.products
    applications.value = snapshot.applications
    loaded.value = true
    errorMessage.value = ''
  }

  async function load(force = false): Promise<void> {
    if (loaded.value && !force) {
      return
    }

    loading.value = true
    errorMessage.value = ''

    try {
      applySnapshot(await getNodeSnapshot())
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '节点数据加载失败'
      throw error
    } finally {
      loading.value = false
    }
  }

  function findProduct(kind: NodeKind): NodeProduct | undefined {
    return products.value.find((product) => product.id === kind)
  }

  async function apply(input: ApplyNodeInput): Promise<NodeApplication> {
    const application = await applyNode(input)
    applications.value = [application, ...applications.value]
    products.value = products.value.map((product) =>
      product.id === input.kind
        ? {
            ...product,
            remainingShares: Math.max(0, product.remainingShares - input.shares),
          }
        : product,
    )
    return application
  }

  return {
    products,
    applications,
    loaded,
    loading,
    errorMessage,
    applySnapshot,
    load,
    findProduct,
    apply,
  }
})
