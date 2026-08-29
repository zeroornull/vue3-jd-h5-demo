# 旧路由迁移对账表

> 由 `bun run docs:routes` 根据 `src/router/legacy-manifest.ts` 生成。不要直接手改表格行。

## 1. 汇总

- 旧路由模块：53；
- 模块实际导出的路由记录：56；
- 当前状态：56 条 pending-view；
- 重复 path：0；
- 重复 name：0；
- 缺失旧组件目标：0。

额外系统契约来自旧 `src/router/index.js`：根路径重定向到 `/index`、`/nopermission`，以及已升级为现代语法的 catch-all `/:pathMatch(.*)*`。

## 2. 已知异常

1. `recommend.js` 的旧 path 是相对值 `classify/recommend`。旧路由把模块挂在根记录下，因此实际 URL 是 `/classify/recommend`；manifest 同时保留原值和规范化值。
2. `orderDetail.js` 的旧 route name 是 `home`。当前先保留 name 契约，后续页面迁移如需改名，必须提供调用搜索和兼容跳转证据。
3. `tabbar.js` 是唯一导出数组的模块，一个文件导出 `/index`、`/classify`、`/shopCart`、`/mine` 四条记录。

## 3. 路由记录

| 模块 | 旧 path | 规范 path | name | 旧页面 | meta.index | 状态 | 备注 |
| --- | --- | --- | --- | --- | ---: | --- | --- |
| aboutAs | `/setting/aboutAs` | `/setting/aboutAs` | `aboutAs` | `@/views/mine/aboutAs.vue` | 13 | pending-view |  |
| addAddress | `/mine/addAddress` | `/mine/addAddress` | `addAddress` | `@/views/mine/addAddress.vue` | 13 | pending-view |  |
| advertisementPool | `/pool/advertisementPool` | `/pool/advertisementPool` | `advertisementPool` | `@/views/pool/advertisementPool.vue` | 15 | pending-view |  |
| appeal | `/order/appeal` | `/order/appeal` | `appeal` | `@/views/order/appeal.vue` | 3 | pending-view |  |
| appealDetail | `/order/appealDetail` | `/order/appealDetail` | `appealDetail` | `@/views/order/appealDetail.vue` | 13 | pending-view |  |
| appealRecord | `/order/appealRecord` | `/order/appealRecord` | `appealRecord` | `@/views/order/appealRecord.vue` | 12 | pending-view |  |
| areaNode | `/node/areaNode` | `/node/areaNode` | `areaNode` | `@/views/node/areaNode.vue` | 15 | pending-view |  |
| balanceWallet | `/wallet/balanceWallet` | `/wallet/balanceWallet` | `balanceWallet` | `@/views/wallet/balanceWallet.vue` | 15 | pending-view |  |
| brandSpike | `/brandSpike` | `/brandSpike` | `brandSpike` | `@/views/brandSpike/index` | 2 | pending-view |  |
| cancelOrder | `/order/cancelOrder` | `/order/cancelOrder` | `cancelOrder` | `@/views/order/cancelOrder.vue` | 11 | pending-view |  |
| chainCatSpike | `/chainCatSpike` | `/chainCatSpike` | `chainCatSpike` | `@/views/chainCatSpike/index` | 2 | pending-view |  |
| changePassword | `/mine/changePassword` | `/mine/changePassword` | `changePassword` | `@/views/mine/changePassword.vue` | 14 | pending-view |  |
| cityNode | `/node/cityNode` | `/node/cityNode` | `cityNode` | `@/views/node/cityNode.vue` | 15 | pending-view |  |
| consumerWallet | `/wallet/consumerWallet` | `/wallet/consumerWallet` | `consumerWallet` | `@/views/wallet/consumerWallet.vue` | 15 | pending-view |  |
| consumptionPool | `/pool/consumptionPool` | `/pool/consumptionPool` | `consumptionPool` | `@/views/pool/consumptionPool.vue` | 15 | pending-view |  |
| countryRegion | `/mine/countryRegion` | `/mine/countryRegion` | `countryRegion` | `@/views/mine/countryRegion.vue` | 15 | pending-view |  |
| emailRegister | `/register/emailRegister` | `/register/emailRegister` | `emailRegister` | `@/views/register/emailRegister` | 2 | pending-view |  |
| emailRegisterTwo | `/register/emailRegisterTwo` | `/register/emailRegisterTwo` | `emailRegisterTwo` | `@/views/register/emailRegisterTwo` | 3 | pending-view |  |
| feedback | `/mine/feedback` | `/mine/feedback` | `feedback` | `@/views/mine/feedback.vue` | 15 | pending-view |  |
| forgetPassword | `/mine/forgetPassword` | `/mine/forgetPassword` | `forgetPassword` | `@/views/mine/forgetPassword.vue` | 14 | pending-view |  |
| foundGoodGoods | `/foundGoodGoods` | `/foundGoodGoods` | `foundGoodGoods` | `@/views/foundGoodGoods/index` | 2 | pending-view |  |
| helpCenter | `/mine/helpCenter` | `/mine/helpCenter` | `helpCenter` | `@/views/mine/helpCenter.vue` | 14 | pending-view |  |
| industryNode | `/node/industryNode` | `/node/industryNode` | `industryNode` | `@/views/node/industryNode.vue` | 15 | pending-view |  |
| login | `/login` | `/login` | `login` | `@/views/login/index` | 2 | pending-view |  |
| loveShop | `/loveShop` | `/loveShop` | `loveShop` | `@/views/loveShop/index` | 2 | pending-view |  |
| messageCenter | `/mine/messageCenter` | `/mine/messageCenter` | `messageCenter` | `@/views/mine/messageCenter.vue` | 14 | pending-view |  |
| myFocus | `/myFocus` | `/myFocus` | `myFocus` | `@/views/myFocus/index` | 2 | pending-view |  |
| myWallet | `/wallet/myWallet` | `/wallet/myWallet` | `myWallet` | `@/views/wallet/myWallet.vue` | 15 | pending-view |  |
| newProductLaunch | `/newProductLaunch` | `/newProductLaunch` | `newProductLaunch` | `@/views/newProductLaunch/index` | 2 | pending-view |  |
| nodeApplication | `/node/nodeApplication` | `/node/nodeApplication` | `nodeApplication` | `@/views/node/nodeApplication.vue` | 15 | pending-view |  |
| nodePool | `/pool/nodePool` | `/pool/nodePool` | `nodePool` | `@/views/pool/nodePool.vue` | 15 | pending-view |  |
| order | `/order` | `/order` | `order` | `@/views/order/index.vue` | 2 | pending-view |  |
| orderDetail | `/order/orderDetail` | `/order/orderDetail` | `home` | `@/views/order/orderDetail.vue` | 3 | pending-view | legacy route name "home" preserved for compatibility |
| pendingReceipt | `/order/pendingReceipt` | `/order/pendingReceipt` | `pendingReceipt` | `@/views/order/pendingReceipt.vue` | 11 | pending-view |  |
| personInfo | `/mine/personInfo` | `/mine/personInfo` | `personInfo` | `@/views/mine/personInfo.vue` | 13 | pending-view |  |
| phoneNumberSetting | `/mine/phoneNumberSetting` | `/mine/phoneNumberSetting` | `phoneNumberSetting` | `@/views/mine/phoneNumberSetting.vue` | 14 | pending-view |  |
| phoneRegister | `/register/phoneRegister` | `/register/phoneRegister` | `phoneRegister` | `@/views/register/phoneRegister` | 2 | pending-view |  |
| phoneRegisterTwo | `/register/phoneRegisterTwo` | `/register/phoneRegisterTwo` | `phoneRegisterTwo` | `@/views/register/phoneRegisterTwo` | 3 | pending-view |  |
| premiumRanking | `/premiumRanking` | `/premiumRanking` | `premiumRanking` | `@/views/premiumRanking/index` | 2 | pending-view |  |
| product | `/classify/product` | `/classify/product` | `product` | `@/views/product/index.vue` | 25 | pending-view |  |
| recommend | `classify/recommend` | `/classify/recommend` | `recommend` | `@/views/classify/recommend.vue` | 12 | pending-view | normalized from relative path classify/recommend |
| search | `/search` | `/search` | `search` | `@/views/search/index.vue` | 17 | pending-view |  |
| setting | `/mine/setting` | `/mine/setting` | `setting` | `@/views/mine/setting.vue` | 12 | pending-view |  |
| settingMail | `/mine/settingMail` | `/mine/settingMail` | `settingMail` | `@/views/mine/settingMail.vue` | 14 | pending-view |  |
| shippingAddress | `/mine/shippingAddress` | `/mine/shippingAddress` | `shippingAddress` | `@/views/mine/shippingAddress.vue` | 12 | pending-view |  |
| specialSpike | `/specialSpike` | `/specialSpike` | `specialSpike` | `@/views/specialSpike/index` | 2 | pending-view |  |
| stateNode | `/node/stateNode` | `/node/stateNode` | `stateNode` | `@/views/node/stateNode.vue` | 15 | pending-view |  |
| storeDetail | `/storeDetail` | `/storeDetail` | `storeDetail` | `@/views/storeDetail/index.vue` | 21 | pending-view |  |
| superNode | `/node/superNode` | `/node/superNode` | `superNode` | `@/views/node/superNode.vue` | 15 | pending-view |  |
| tabbar | `/index` | `/index` | `index` | `@/views/home/index.vue` | 1 | pending-view | tabbar.js exports 4 routes |
| tabbar | `/classify` | `/classify` | `classify` | `@/views/classify/index.vue` | 1 | pending-view | tabbar.js exports 4 routes |
| tabbar | `/shopCart` | `/shopCart` | `shopCart` | `@/views/shopCart/index.vue` | 1 | pending-view | tabbar.js exports 4 routes |
| tabbar | `/mine` | `/mine` | `mine` | `@/views/mine/index.vue` | 1 | pending-view | tabbar.js exports 4 routes |
| toBeDelivered | `/order/toBeDelivered` | `/order/toBeDelivered` | `toBeDelivered` | `@/views/order/toBeDelivered.vue` | 11 | pending-view |  |
| transactionDetails | `/order/transactionDetails` | `/order/transactionDetails` | `transactionDetails` | `@/views/order/transactionDetails.vue` | 4 | pending-view |  |
| viewLogistics | `/order/viewLogistics` | `/order/viewLogistics` | `viewLogistics` | `@/views/order/viewLogistics.vue` | 12 | pending-view |  |

## 4. Store 使用对账

### Search

旧搜索页实际使用：

- 启动时读取 `localStorage.searchHistory`；
- `search/addHistory` 把新关键词放在最前；
- 页面随后用 `Set` 去重并调用 `search/setHistory`；
- `search/setHistory` 使用 JSON 写入同名 localStorage key；
- 清空历史写入空数组。

新 `useSearchStore` 保持这个可见行为，并增加损坏 JSON/错误数据形状自愈，不引入持久化插件。

### Cart

代码检索只有首页调用 `cart/addToCart`；旧 mutation 忽略 payload，只把 `count` 加一。新 `useCartStore` 仅迁移这项有调用证据的行为。

旧 `cartProducts`、`cartTotalPrice`、`addProductToCart` 等逻辑依赖未注册的 `rootState.products` 和 `products/decrementProductInventory`，且没有调用者。它们标记为“等待商品/购物车纵向切片”，本轮不伪造 Product Store 或库存模型。
