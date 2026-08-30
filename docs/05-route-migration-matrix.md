# 旧路由迁移对账表

> 由 `bun run docs:routes` 根据 `src/router/legacy-manifest.ts` 生成。不要直接手改表格行。

## 1. 汇总

- 旧路由模块：53；
- 模块实际导出的路由记录：56；
- 当前状态：48 条 migrated / 8 条 pending-view；
- 重复 path：0；
- 重复 name：0；
- 缺失旧组件目标：0。

额外系统契约来自旧 `src/router/index.js`：根路径重定向到 `/index`、`/nopermission`，以及已升级为现代语法的 catch-all `/:pathMatch(.*)*`。

## 2. 已知异常

1. `recommend.js` 的旧 path 是相对值 `classify/recommend`。旧路由把模块挂在根记录下，因此实际 URL 是 `/classify/recommend`；manifest 同时保留原值和规范化值。
2. `orderDetail.js` 的旧 route name 是 `home`。当前先保留 name 契约，后续页面迁移如需改名，必须提供调用搜索和兼容跳转证据。
3. `tabbar.js` 是唯一导出数组的模块，一个文件导出 `/index`、`/classify`、`/shopCart`、`/mine` 四条记录。
4. 认证守卫是新契约：旧 Router 没有 `beforeEach` 登录拦截。`/mine`、`/order`、`/wallet`、`/myFocus` 现标记 `requiresAuth`；`/login` 与注册/找回密码页标记 `guestOnly`。`/mine/forgetPassword` 虽在 `/mine` 下，仍是访客页。`/mine` 本身仍是 pending-view，未登录访问会被重定向到登录页。

## 3. 路由记录

| 模块 | 旧 path | 规范 path | name | 旧页面 | meta.index | 状态 | 备注 |
| --- | --- | --- | --- | --- | ---: | --- | --- |
| aboutAs | `/setting/aboutAs` | `/setting/aboutAs` | `aboutAs` | `@/views/mine/aboutAs.vue` | 13 | migrated |  |
| addAddress | `/mine/addAddress` | `/mine/addAddress` | `addAddress` | `@/views/mine/addAddress.vue` | 13 | migrated |  |
| advertisementPool | `/pool/advertisementPool` | `/pool/advertisementPool` | `advertisementPool` | `@/views/pool/advertisementPool.vue` | 15 | migrated |  |
| appeal | `/order/appeal` | `/order/appeal` | `appeal` | `@/views/order/appeal.vue` | 3 | migrated |  |
| appealDetail | `/order/appealDetail` | `/order/appealDetail` | `appealDetail` | `@/views/order/appealDetail.vue` | 13 | migrated |  |
| appealRecord | `/order/appealRecord` | `/order/appealRecord` | `appealRecord` | `@/views/order/appealRecord.vue` | 12 | migrated |  |
| areaNode | `/node/areaNode` | `/node/areaNode` | `areaNode` | `@/views/node/areaNode.vue` | 15 | pending-view |  |
| balanceWallet | `/wallet/balanceWallet` | `/wallet/balanceWallet` | `balanceWallet` | `@/views/wallet/balanceWallet.vue` | 15 | migrated |  |
| brandSpike | `/brandSpike` | `/brandSpike` | `brandSpike` | `@/views/brandSpike/index` | 2 | migrated |  |
| cancelOrder | `/order/cancelOrder` | `/order/cancelOrder` | `cancelOrder` | `@/views/order/cancelOrder.vue` | 11 | migrated |  |
| chainCatSpike | `/chainCatSpike` | `/chainCatSpike` | `chainCatSpike` | `@/views/chainCatSpike/index` | 2 | migrated |  |
| changePassword | `/mine/changePassword` | `/mine/changePassword` | `changePassword` | `@/views/mine/changePassword.vue` | 14 | migrated |  |
| cityNode | `/node/cityNode` | `/node/cityNode` | `cityNode` | `@/views/node/cityNode.vue` | 15 | pending-view |  |
| consumerWallet | `/wallet/consumerWallet` | `/wallet/consumerWallet` | `consumerWallet` | `@/views/wallet/consumerWallet.vue` | 15 | migrated |  |
| consumptionPool | `/pool/consumptionPool` | `/pool/consumptionPool` | `consumptionPool` | `@/views/pool/consumptionPool.vue` | 15 | migrated |  |
| countryRegion | `/mine/countryRegion` | `/mine/countryRegion` | `countryRegion` | `@/views/mine/countryRegion.vue` | 15 | migrated |  |
| emailRegister | `/register/emailRegister` | `/register/emailRegister` | `emailRegister` | `@/views/register/emailRegister` | 2 | migrated |  |
| emailRegisterTwo | `/register/emailRegisterTwo` | `/register/emailRegisterTwo` | `emailRegisterTwo` | `@/views/register/emailRegisterTwo` | 3 | migrated |  |
| feedback | `/mine/feedback` | `/mine/feedback` | `feedback` | `@/views/mine/feedback.vue` | 15 | migrated |  |
| forgetPassword | `/mine/forgetPassword` | `/mine/forgetPassword` | `forgetPassword` | `@/views/mine/forgetPassword.vue` | 14 | migrated |  |
| foundGoodGoods | `/foundGoodGoods` | `/foundGoodGoods` | `foundGoodGoods` | `@/views/foundGoodGoods/index` | 2 | migrated |  |
| helpCenter | `/mine/helpCenter` | `/mine/helpCenter` | `helpCenter` | `@/views/mine/helpCenter.vue` | 14 | migrated |  |
| industryNode | `/node/industryNode` | `/node/industryNode` | `industryNode` | `@/views/node/industryNode.vue` | 15 | pending-view |  |
| login | `/login` | `/login` | `login` | `@/views/login/index` | 2 | migrated |  |
| loveShop | `/loveShop` | `/loveShop` | `loveShop` | `@/views/loveShop/index` | 2 | migrated |  |
| messageCenter | `/mine/messageCenter` | `/mine/messageCenter` | `messageCenter` | `@/views/mine/messageCenter.vue` | 14 | migrated |  |
| myFocus | `/myFocus` | `/myFocus` | `myFocus` | `@/views/myFocus/index` | 2 | pending-view |  |
| myWallet | `/wallet/myWallet` | `/wallet/myWallet` | `myWallet` | `@/views/wallet/myWallet.vue` | 15 | migrated |  |
| newProductLaunch | `/newProductLaunch` | `/newProductLaunch` | `newProductLaunch` | `@/views/newProductLaunch/index` | 2 | migrated |  |
| nodeApplication | `/node/nodeApplication` | `/node/nodeApplication` | `nodeApplication` | `@/views/node/nodeApplication.vue` | 15 | pending-view |  |
| nodePool | `/pool/nodePool` | `/pool/nodePool` | `nodePool` | `@/views/pool/nodePool.vue` | 15 | migrated |  |
| order | `/order` | `/order` | `order` | `@/views/order/index.vue` | 2 | migrated |  |
| orderDetail | `/order/orderDetail` | `/order/orderDetail` | `home` | `@/views/order/orderDetail.vue` | 3 | migrated | legacy route name "home" preserved for compatibility |
| pendingReceipt | `/order/pendingReceipt` | `/order/pendingReceipt` | `pendingReceipt` | `@/views/order/pendingReceipt.vue` | 11 | migrated |  |
| personInfo | `/mine/personInfo` | `/mine/personInfo` | `personInfo` | `@/views/mine/personInfo.vue` | 13 | migrated |  |
| phoneNumberSetting | `/mine/phoneNumberSetting` | `/mine/phoneNumberSetting` | `phoneNumberSetting` | `@/views/mine/phoneNumberSetting.vue` | 14 | migrated |  |
| phoneRegister | `/register/phoneRegister` | `/register/phoneRegister` | `phoneRegister` | `@/views/register/phoneRegister` | 2 | migrated |  |
| phoneRegisterTwo | `/register/phoneRegisterTwo` | `/register/phoneRegisterTwo` | `phoneRegisterTwo` | `@/views/register/phoneRegisterTwo` | 3 | migrated |  |
| premiumRanking | `/premiumRanking` | `/premiumRanking` | `premiumRanking` | `@/views/premiumRanking/index` | 2 | migrated |  |
| product | `/classify/product` | `/classify/product` | `product` | `@/views/product/index.vue` | 25 | migrated |  |
| recommend | `classify/recommend` | `/classify/recommend` | `recommend` | `@/views/classify/recommend.vue` | 12 | migrated | normalized from relative path classify/recommend |
| search | `/search` | `/search` | `search` | `@/views/search/index.vue` | 17 | migrated |  |
| setting | `/mine/setting` | `/mine/setting` | `setting` | `@/views/mine/setting.vue` | 12 | migrated |  |
| settingMail | `/mine/settingMail` | `/mine/settingMail` | `settingMail` | `@/views/mine/settingMail.vue` | 14 | migrated |  |
| shippingAddress | `/mine/shippingAddress` | `/mine/shippingAddress` | `shippingAddress` | `@/views/mine/shippingAddress.vue` | 12 | migrated |  |
| specialSpike | `/specialSpike` | `/specialSpike` | `specialSpike` | `@/views/specialSpike/index` | 2 | migrated |  |
| stateNode | `/node/stateNode` | `/node/stateNode` | `stateNode` | `@/views/node/stateNode.vue` | 15 | pending-view |  |
| storeDetail | `/storeDetail` | `/storeDetail` | `storeDetail` | `@/views/storeDetail/index.vue` | 21 | pending-view |  |
| superNode | `/node/superNode` | `/node/superNode` | `superNode` | `@/views/node/superNode.vue` | 15 | pending-view |  |
| tabbar | `/index` | `/index` | `index` | `@/views/home/index.vue` | 1 | migrated | tabbar.js exports 4 routes |
| tabbar | `/classify` | `/classify` | `classify` | `@/views/classify/index.vue` | 1 | migrated | tabbar.js exports 4 routes |
| tabbar | `/shopCart` | `/shopCart` | `shopCart` | `@/views/shopCart/index.vue` | 1 | migrated | tabbar.js exports 4 routes |
| tabbar | `/mine` | `/mine` | `mine` | `@/views/mine/index.vue` | 1 | migrated | tabbar.js exports 4 routes |
| toBeDelivered | `/order/toBeDelivered` | `/order/toBeDelivered` | `toBeDelivered` | `@/views/order/toBeDelivered.vue` | 11 | migrated |  |
| transactionDetails | `/order/transactionDetails` | `/order/transactionDetails` | `transactionDetails` | `@/views/order/transactionDetails.vue` | 4 | migrated |  |
| viewLogistics | `/order/viewLogistics` | `/order/viewLogistics` | `viewLogistics` | `@/views/order/viewLogistics.vue` | 12 | migrated |  |

## 4. Store 使用对账

### Search

旧搜索页实际使用：

- 启动时读取 `localStorage.searchHistory`；
- `search/addHistory` 把新关键词放在最前；
- 页面随后用 `Set` 去重并调用 `search/setHistory`；
- `search/setHistory` 使用 JSON 写入同名 localStorage key；
- 清空历史写入空数组。

新 `useSearchStore` 保持这个可见行为，并增加损坏 JSON/错误数据形状自愈，不引入持久化插件。

### Catalog

第 5 轮商品子域新增 `useCatalogStore`，统一缓存和索引 4 个分类、8 个商品、7 个营销活动与 2 个好店。`productsByIds` / `storesByIds` 严格遵循活动配置 ID 顺序并跳过未知 ID，保证榜单和策展顺序不会被 Catalog 原始数组顺序改写。

### Auth

第 5 轮认证子域新增 `useAuthStore`。旧工程没有独立 Auth Vuex 模块；登录页按钮处理是空函数，Axios 仅在 401/403 时跳转登录并读写 `localStorage.token`。

新 Store 负责：

- 登录后写入 `localStorage.token`（保持旧 key）和类型化 `authUser` JSON；
- hydrate 时要求 token 与 user 同时有效，损坏或残缺会话会清除；
- 两步注册草稿只保存在内存，刷新后失效。

页面走新 POST `/api/auth/login`、`/api/auth/send-code`、`/api/auth/register`、`/api/auth/reset-password`；旧 GET `/api/login`、`/api/register` 仍保留给开发兼容。密码策略为 8～64 位且同时包含字母和数字。开发验证码固定 `123456`。401 HTTP 自动跳转仍未实现。

### Order

第 5 轮订单子域新增 `useOrderStore`。旧订单页全是静态模板、没有 Vuex 订单模块。新 Store 缓存订单/申诉快照，并支持创建、支付、取消、确认收货和申诉。购物车结算会把选中商品建成 `unpaid` 订单并跳到 `/order/orderDetail`。

`orderDetail` 的历史 name `home` 仍然保留。`/order/orderDetail`、`/order/toBeDelivered`、`/order/pendingReceipt` 共享 `OrderDetailView`，按 route name / `id` query 选择订单。库存扣减、真实支付通道和商家会话仍等待对应子域。

### Profile

第 5 轮个人中心新增 `useProfileStore`。旧「我的」相关页面几乎全是静态模板。新 Store 缓存资料、地址、消息、帮助和设置；登录后显示 Auth 会话昵称，修改昵称会同步 `authUser`。收货地址支持新增/编辑/默认地址。节点申请入口仍指向 pending-view。

### Wallet

第 5 轮钱包子域新增 `useWalletStore`。旧钱包/矿池页全是静态模板。新 Store 缓存消费/余额钱包、三个矿池、收益占比和流水。余额/消费明细共享 `WalletLedgerView`，三个矿池共享 `PoolView`。矿池页可领取分红到余额钱包。节点申请页未迁；`/pool/nodePool` 只是矿池流水，不是节点申请。

### Cart

第 3 轮代码检索只有首页调用 `cart/addToCart`；旧 mutation 忽略 payload，只把 `count` 加一。第 4 轮迁移 Home → Cart 纵向切片后，`useCartStore` 使用 Home API 的类型化商品快照建立购物车条目，支持库存上限内的数量、选择、全选、选中合计和删除。第 5 轮订单子域把购物车支付确认接到创建订单。

旧 `cartProducts`、`cartTotalPrice`、`addProductToCart` 等逻辑依赖未注册的 `rootState.products` 和 `products/decrementProductInventory`，且没有调用者，因此没有机械翻译。新库存上限来自商品快照的 `stock`，实际扣减库存和服务端购物车仍未实现。
