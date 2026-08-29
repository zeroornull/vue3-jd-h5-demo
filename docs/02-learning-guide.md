# 迁移学习指南

这份指南不是把 API 列一遍，而是把每个知识点绑定到迁移轮次和可运行练习。

## 1. Bun：先掌握“包管理器 + 脚本运行器”

本项目首阶段仍由 Vite 构建浏览器应用；Bun 主要承担依赖、锁文件和脚本，不需要把 Vite 强行换成 Bun bundler。

### 必会命令

```bash
# 安装并更新 bun.lock
bun install

# CI/干净环境：package.json 与 bun.lock 不一致时失败
bun install --frozen-lockfile
# 等价的 CI 入口
bun ci

# 添加运行时依赖
bun add axios

# 添加开发依赖
bun add -d vitest

# 精确锁定一个包（仅在确有理由时）
bun add -E some-package@1.2.3

# 运行 package.json script
bun run dev
bun run build

# 从 Yarn/npm/pnpm 锁文件迁移
bun pm migrate
```

### 要理解的边界

- `bun.lock` 必须提交；`node_modules` 不提交。
- CI 不应运行会修改锁文件的普通安装流程。
- 生命周期脚本可能执行第三方代码；不要无条件信任未知依赖。
- `bunx --bun` 可强制工具使用 Bun runtime，但个别 Node 专用工具仍需兼容验证。
- Bun 能运行不代表所有依赖组合天然兼容；类型工具之间仍有 peer/内部 API 约束。

### 练习

在第 1 轮临时脚手架中：

1. 删除 `node_modules`；
2. 运行 `bun ci`；
3. 人为修改一个依赖范围但不更新锁文件；
4. 观察冻结安装失败；
5. 恢复文件并再次通过。

## 2. Vite：理解与 Vue CLI 的差异

### 2.1 Vite 负责转译，不负责完整类型检查

开发服务可以在有类型错误时继续转译，所以必须独立运行：

```bash
bun run type-check
```

推荐构建脚本把类型检查和 Vite build 都包含进去，防止生产包“能打出来但类型已坏”。

### 2.2 环境变量

旧代码：

```js
process.env.VUE_APP_BASE_URL
process.env.BASE_URL
```

新代码：

```ts
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
const appBaseUrl = import.meta.env.BASE_URL
```

类型声明：

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_ENABLE_MOCK: 'true' | 'false'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

`VITE_*` 会进入浏览器包，不能放密码、私钥或服务端 Token。

### 2.3 Webpack `require.context` → Vite `import.meta.glob`

路由模块示例：

```ts
import type { RouteRecordRaw } from 'vue-router'

type RouteModule = { default: RouteRecordRaw | RouteRecordRaw[] }

const modules = import.meta.glob<RouteModule>('./modules/*.ts', {
  eager: true,
})

export const childRoutes: RouteRecordRaw[] = Object.values(modules).flatMap(
  ({ default: routes }) => (Array.isArray(routes) ? routes : [routes]),
)
```

学习重点：

- glob 是构建时分析，不是任意运行时文件系统访问；
- 动态导入会影响 chunk 拆分；
- `eager: true` 只让路由配置聚合为同步，不会取消路由组件自身的懒加载。

### 2.4 Vite 配置骨架

```ts
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
```

不要照搬 Vue CLI 的 `publicPath: './'`。应先确认真实部署方式：域名根目录、子路径还是 `file://`/静态相对路径。不同场景的 Router history 与资源路径策略不同。

## 3. TypeScript：渐进式迁移，不是假装类型安全

### 3.1 推荐顺序

1. 基础配置和 `env.d.ts`；
2. 纯工具函数；
3. API DTO 与 HTTP 边界；
4. Pinia Store；
5. Router；
6. 公共组件；
7. 页面；
8. 最后收紧例外。

### 3.2 Options API 可以先保留

第一阶段：

```vue
<script lang="ts">
import { defineComponent, type PropType } from 'vue'

interface Product {
  id: string
  title: string
}

export default defineComponent({
  props: {
    product: {
      type: Object as PropType<Product>,
      required: true,
    },
  },
})
</script>
```

以后确有收益时再改：

```vue
<script setup lang="ts">
interface Product {
  id: string
  title: string
}

defineProps<{ product: Product }>()
const emit = defineEmits<{ add: [productId: string] }>()
</script>
```

把“加类型”和“重写组件范式”拆开，可以显著降低单次 diff 和回归范围。

### 3.3 API 边界使用 `unknown`

不要这样：

```ts
const data: any = await http.get('/products')
```

更合理的形状：

```ts
interface ProductDto {
  id: string
  title: string
  price: number
}

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export async function getProducts(): Promise<ProductDto[]> {
  const response = await http.get<ApiResponse<ProductDto[]>>('/products')
  return response.data.data
}
```

泛型只描述“我们期望服务器返回什么”，不能替代运行时验证。关键或不可信接口应增加 schema/手写守卫；是否引入验证库需要单独依赖决策。

### 3.4 允许例外，但必须可删除

每个 `@ts-expect-error` 应说明：

- 为什么目前必须存在；
- 上游问题/遗留文件；
- 删除条件。

不要用 `@ts-ignore`、`as any` 批量清空错误列表。

## 4. Vue Router：路由也要类型与测试

### 4.1 基础配置

```ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/error/NotFoundView.vue'),
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
```

### 4.2 必测行为

- `/` 重定向；
- 嵌套路由；
- 404；
- 登录保护；
- Token 过期后的跳转参数；
- 深层 URL 刷新时服务器 fallback；
- 路由组件 chunk 能成功加载。

路由表“有类型”不代表运行时 URL 一定正确。

## 5. Pinia：从 Vuex 翻译到领域动作

旧 Vuex 的 mutation/action/getter 不需要一一保留名词。Pinia 可以把业务动作直接建模：

```ts
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

interface CartItem {
  productId: string
  quantity: number
  unitPrice: number
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  const totalPrice = computed(() =>
    items.value.reduce(
      (total, item) => total + item.unitPrice * item.quantity,
      0,
    ),
  )

  function add(product: Omit<CartItem, 'quantity'>) {
    const existing = items.value.find(
      (item) => item.productId === product.productId,
    )

    if (existing) existing.quantity += 1
    else items.value.push({ ...product, quantity: 1 })
  }

  return { items, totalPrice, add }
})
```

迁移旧 `cart` 前先回答：商品库存的权威来源在哪里？旧代码引用未注册的 `products` 根模块，不能直接照抄。

## 6. Axios：显式依赖优于全局魔法

建议：

```ts
import axios from 'axios'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 12_000,
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.set('Authorization', `Bearer ${token}`)
  return config
})
```

然后 API 层显式导入 `http`。不要继续把它装成 `$http`，否则：

- 组件类型声明更复杂；
- 测试必须构造全局插件；
- 依赖来源不直观；
- API 与 UI 更容易耦合。

拦截器也不应直接承担全部 UI 提示和 Router 跳转。把错误规范化后交给应用层决定展示方式，更容易测试。

## 7. Vant 4：按使用点迁移

旧代码：

```ts
import { Toast } from 'vant'
Toast('登录过期')
```

Vant 4 方向：

```ts
import { showToast } from 'vant'
showToast('登录过期')
```

迁移清单：

- 搜索所有 Vant import；
- 搜索全局组件标签；
- 对照 Vant 4 文档检查 renamed/removed props、events、slots；
- 检查样式变量和主题方式；
- 检查函数式组件的样式是否已导入；
- 记录全量导入和按需导入的包体积差异；
- 为 Popup、Picker、Toast、Dialog 等交互写测试。

## 8. 测试金字塔

### 单元测试

适合：

- storage adapter；
- API 错误映射；
- Pinia actions/getters；
- composables；
- 路由模块聚合。

### 组件测试

适合：

- props/emits；
- Vant popup/picker 交互；
- loading/error/empty 状态；
- Tabbar 和路由联动。

### E2E

只覆盖高价值链路：

- 登录；
- 首页 → 搜索 → 商品 → 购物车；
- 下单/订单查看；
- Token 过期；
- 深层链接刷新。

不要用大量 E2E 代替可以快速定位问题的单元测试。

## 9. 每轮学习输出

每完成一轮，在文档中补充：

1. 我学到的 3 个核心概念；
2. 一个“旧做法 → 新做法”的真实 diff；
3. 一个踩坑与根因；
4. 一条可重复的验证命令；
5. 下一轮仍未知的问题。

这样文档会随着迁移成为项目自己的学习资料，而不是一次性教程。
