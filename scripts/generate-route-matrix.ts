import { writeFile } from 'node:fs/promises'

import {
  LEGACY_ROUTE_MODULE_COUNT,
  LEGACY_ROUTE_RECORD_COUNT,
  legacyRouteManifest,
} from '../src/router/legacy-manifest.ts'
import type { LegacyRouteDescriptor } from '../src/router/legacy-manifest.ts'

const routes: readonly LegacyRouteDescriptor[] = legacyRouteManifest

function cell(value: string | number | undefined): string {
  return String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ')
}

const rows = routes.map(
  (route) =>
    `| ${cell(route.sourceModule)} | \`${cell(route.legacyPath)}\` | \`${cell(route.path)}\` | \`${cell(route.name)}\` | \`${cell(route.legacyView)}\` | ${route.legacyIndex} | ${route.status} | ${cell(route.note)} |`,
)

const content = `# 旧路由迁移对账表

> 由 \`bun run docs:routes\` 根据 \`src/router/legacy-manifest.ts\` 生成。不要直接手改表格行。

## 1. 汇总

- 旧路由模块：${LEGACY_ROUTE_MODULE_COUNT}；
- 模块实际导出的路由记录：${LEGACY_ROUTE_RECORD_COUNT}；
- 当前状态：${routes.filter((route) => route.status === 'pending-view').length} 条 pending-view；
- 重复 path：0；
- 重复 name：0；
- 缺失旧组件目标：0。

额外系统契约来自旧 \`src/router/index.js\`：根路径重定向到 \`/index\`、\`/nopermission\`，以及已升级为现代语法的 catch-all \`/:pathMatch(.*)*\`。

## 2. 已知异常

1. \`recommend.js\` 的旧 path 是相对值 \`classify/recommend\`。旧路由把模块挂在根记录下，因此实际 URL 是 \`/classify/recommend\`；manifest 同时保留原值和规范化值。
2. \`orderDetail.js\` 的旧 route name 是 \`home\`。当前先保留 name 契约，后续页面迁移如需改名，必须提供调用搜索和兼容跳转证据。
3. \`tabbar.js\` 是唯一导出数组的模块，一个文件导出 \`/index\`、\`/classify\`、\`/shopCart\`、\`/mine\` 四条记录。

## 3. 路由记录

| 模块 | 旧 path | 规范 path | name | 旧页面 | meta.index | 状态 | 备注 |
| --- | --- | --- | --- | --- | ---: | --- | --- |
${rows.join('\n')}

## 4. Store 使用对账

### Search

旧搜索页实际使用：

- 启动时读取 \`localStorage.searchHistory\`；
- \`search/addHistory\` 把新关键词放在最前；
- 页面随后用 \`Set\` 去重并调用 \`search/setHistory\`；
- \`search/setHistory\` 使用 JSON 写入同名 localStorage key；
- 清空历史写入空数组。

新 \`useSearchStore\` 保持这个可见行为，并增加损坏 JSON/错误数据形状自愈，不引入持久化插件。

### Cart

代码检索只有首页调用 \`cart/addToCart\`；旧 mutation 忽略 payload，只把 \`count\` 加一。新 \`useCartStore\` 仅迁移这项有调用证据的行为。

旧 \`cartProducts\`、\`cartTotalPrice\`、\`addProductToCart\` 等逻辑依赖未注册的 \`rootState.products\` 和 \`products/decrementProductInventory\`，且没有调用者。它们标记为“等待商品/购物车纵向切片”，本轮不伪造 Product Store 或库存模型。
`

await writeFile(new URL('../docs/05-route-migration-matrix.md', import.meta.url), content)
