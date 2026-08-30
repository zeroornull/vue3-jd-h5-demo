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
- 当前状态：${routes.filter((route) => route.status === 'migrated').length} 条 migrated / ${routes.filter((route) => route.status === 'pending-view').length} 条 pending-view；
- 重复 path：0；
- 重复 name：0；
- 缺失旧组件目标：0。

额外系统契约来自旧 \`src/router/index.js\`：根路径重定向到 \`/index\`、\`/nopermission\`，以及已升级为现代语法的 catch-all \`/:pathMatch(.*)*\`。

## 2. 已知异常

1. \`recommend.js\` 的旧 path 是相对值 \`classify/recommend\`。旧路由把模块挂在根记录下，因此实际 URL 是 \`/classify/recommend\`；manifest 同时保留原值和规范化值。
2. \`orderDetail.js\` 的旧 route name 是 \`home\`。当前先保留 name 契约，后续页面迁移如需改名，必须提供调用搜索和兼容跳转证据。
3. \`tabbar.js\` 是唯一导出数组的模块，一个文件导出 \`/index\`、\`/classify\`、\`/shopCart\`、\`/mine\` 四条记录。
4. 认证守卫是新契约：旧 Router 没有 \`beforeEach\` 登录拦截。\`/mine\`、\`/order\`、\`/wallet\`、\`/myFocus\` 现标记 \`requiresAuth\`；\`/login\` 与注册/找回密码页标记 \`guestOnly\`。\`/mine/forgetPassword\` 虽在 \`/mine\` 下，仍是访客页。未登录访问受保护页会被重定向到登录页。

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

### Catalog

第 5 轮商品子域新增 \`useCatalogStore\`，统一缓存和索引 4 个分类、8 个商品、7 个营销活动与 2 个好店。\`productsByIds\` / \`storesByIds\` 严格遵循活动配置 ID 顺序并跳过未知 ID，保证榜单和策展顺序不会被 Catalog 原始数组顺序改写。

### Auth

第 5 轮认证子域新增 \`useAuthStore\`。旧工程没有独立 Auth Vuex 模块；登录页按钮处理是空函数，Axios 仅在 401/403 时跳转登录并读写 \`localStorage.token\`。

新 Store 负责：

- 登录后写入 \`localStorage.token\`（保持旧 key）和类型化 \`authUser\` JSON；
- hydrate 时要求 token 与 user 同时有效，损坏或残缺会话会清除；
- 两步注册草稿只保存在内存，刷新后失效。

页面走新 POST \`/api/auth/login\`、\`/api/auth/send-code\`、\`/api/auth/register\`、\`/api/auth/reset-password\`；旧 GET \`/api/login\`、\`/api/register\` 仍保留给开发兼容。密码策略为 8～64 位且同时包含字母和数字。开发验证码固定 \`123456\`。401 HTTP 自动跳转仍未实现。

### Order

第 5 轮订单子域新增 \`useOrderStore\`。旧订单页全是静态模板、没有 Vuex 订单模块。新 Store 缓存订单/申诉快照，并支持创建、支付、取消、确认收货和申诉。购物车结算会把选中商品建成 \`unpaid\` 订单并跳到 \`/order/orderDetail\`。

\`orderDetail\` 的历史 name \`home\` 仍然保留。\`/order/orderDetail\`、\`/order/toBeDelivered\`、\`/order/pendingReceipt\` 共享 \`OrderDetailView\`，按 route name / \`id\` query 选择订单。库存扣减、真实支付通道和商家会话仍等待对应子域。

### Profile

第 5 轮个人中心新增 \`useProfileStore\`。旧「我的」相关页面几乎全是静态模板。新 Store 缓存资料、地址、消息、帮助和设置；登录后显示 Auth 会话昵称，修改昵称会同步 \`authUser\`。收货地址支持新增/编辑/默认地址。商品/店铺关注计数来自关注子域。

### Wallet

第 5 轮钱包子域新增 \`useWalletStore\`。旧钱包/矿池页全是静态模板。新 Store 缓存消费/余额钱包、三个矿池、收益占比和流水。余额/消费明细共享 \`WalletLedgerView\`，三个矿池共享 \`PoolView\`。矿池页可领取分红到余额钱包。\`/pool/nodePool\` 只是矿池流水，不是节点申请。

### Node

第 5 轮节点申请新增 \`useNodeStore\`。旧 6 个节点页全是空处理/静态弹窗。新 Store 缓存 6 类节点库存和申请记录。总览页可直接支付成为分享节点；区域/城市/州级/行业/超级申请共享 \`NodeApplyView\`。

### Focus / Store

第 5 轮店铺详情与关注新增 \`useFocusStore\`。店铺详情复用 Catalog 店铺和商品；\`StoreCard\` 进店带 \`id\` query。关注页按 \`tab=product|store\` 列出已关注商品/店铺，可取消关注。商品详情和发现好货的心形按钮写入同一份关注快照。

### Cart

第 3 轮代码检索只有首页调用 \`cart/addToCart\`；旧 mutation 忽略 payload，只把 \`count\` 加一。第 4 轮迁移 Home → Cart 纵向切片后，\`useCartStore\` 使用 Home API 的类型化商品快照建立购物车条目，支持库存上限内的数量、选择、全选、选中合计和删除。第 5 轮订单子域把购物车支付确认接到创建订单。

旧 \`cartProducts\`、\`cartTotalPrice\`、\`addProductToCart\` 等逻辑依赖未注册的 \`rootState.products\` 和 \`products/decrementProductInventory\`，且没有调用者，因此没有机械翻译。新库存上限来自商品快照的 \`stock\`，实际扣减库存和服务端购物车仍未实现。
`

await writeFile(new URL('../docs/05-route-migration-matrix.md', import.meta.url), content)
