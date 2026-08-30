# 当前开发进度

> 快照日期：2026-08-30
>
> 这是给下一轮对话用的进度单。路线细节见 [01-migration-roadmap.md](./01-migration-roadmap.md)，路由对账见 [05-route-migration-matrix.md](./05-route-migration-matrix.md)。

## 1. 一句话状态

第 5 轮分域迁移进行中。商品、认证已提交；订单 / 物流 / 申诉已实现且质量门通过，仍在工作区未提交。路由矩阵为 **29 migrated / 27 pending-view**。

## 2. 轮次

| 轮次 | 主题 | 状态 | Git |
| --- | --- | --- | --- |
| 0 | 盘点、归档、文档化 | 已完成 | 基线文档 |
| 1 | 现代工程骨架 | 已完成 | `7150c1b` |
| 2 | 平台基础设施 | 已完成 | `2077ac8` |
| 3 | Router 与 Pinia | 已完成 | `3e175b6` |
| 4 | 公共组件 + Home/Search/Cart | 已完成 | `2221db9` |
| 5A | 商品 / 分类 / 榜单 / 秒杀 | 已完成 | `7fc8243` |
| 5B | 登录 / 注册 / 找回密码 | 已完成 | `05ede14` |
| 5C | 订单 / 物流 / 申诉 | **实现完成，待提交** | 工作区未提交 |
| 5D+ | 个人中心、钱包、节点等 | 未开始 | — |
| 6 | 类型收紧与质量门禁 | 未开始 | — |
| 7 | 切换、性能与清理 | 未开始 | — |

当前 HEAD 是 `05ede14`（认证子域）。

## 3. 已迁移路由

| 子域 | 路由 | 主要产物 |
| --- | --- | --- |
| 首页 / 搜索 / 购物车 | `/index`、`/search`、`/shopCart` | Home/Search/Cart，Search/Cart Store |
| 商品 / 营销 | `/classify*`、7 个活动 URL | Catalog Store、Category/Product/Campaign |
| 认证 | `/login`、注册 4 条、`/mine/forgetPassword` | Auth Store、守卫、Auth API |
| 订单 | `/order` 及 9 条 `/order/*` | Order Store、列表/详情/物流/申诉 |

`orderDetail` 的历史 name 仍是 `home`。待支付 / 待发货 / 待收货详情共享 `OrderDetailView`。

## 4. 第 5C 轮订单落地

### 已实现

- 类型：`src/types/order.ts`
- API：`src/api/order.ts`
- Store：`src/stores/order.ts`
- Mock：6 张状态订单 + 1 条申诉，支持创建/支付/取消/确认收货/申诉
- 页面：列表、详情、物流、取消、交易成功、申诉表单/记录/详情
- 购物车结算创建 `unpaid` 订单并跳到详情

### 有意差异

- 旧订单页是静态模板；新实现补全了可运行闭环。
- 三个详情 URL 共享一个页面，不再复制三份静态模板。
- 列表 tab 使用 `?tab=`，详情/物流/申诉使用 `?id=`。
- 没有迁「联系卖家」会话、地址簿、真实支付通道或库存扣减。
- 交易成功页「返回商家」仍指向未迁移的 `/storeDetail`。

### 本子域明确未做

钱包、节点、个人中心、店铺详情、关注。

## 5. 剩余 27 条 pending（按域）

| 域 | 条数 | 代表路由 | 建议顺序 |
| --- | ---: | --- | --- |
| 个人中心 / 地址 / 设置 | 13 | `/mine`、`/mine/setting`、`/mine/shippingAddress` | **下一子域** |
| 节点 | 6 | `/node/nodeApplication` 及各级节点页 | 低频，可后置 |
| 钱包 | 3 | `/wallet/myWallet` 等 | 可独立切片 |
| 消费池 / 广告池 | 3 | `/pool/*` | 可与钱包一起或后置 |
| 其他 | 2 | `/storeDetail`、`/myFocus` | 低频 |

## 6. 质量门（2026-08-30 订单子域实测）

```text
bun run type-check              PASS
bun run test:unit -- --run      PASS（21 files / 59 tests）
bun run lint                    PASS
bun run build-only              PASS（474 modules transformed）
```

生产构建：主入口 125.50 kB（gzip 44.41 kB）。

浏览器（375/390/430）：未登录 `/order` → 登录 → 列表；微信支付成功；确认收货；购物车结算建单；取消订单进入已取消 tab。目标页无横向溢出、无 console error。

## 7. 下一轮建议输入

```text
请继续 docs/01-migration-roadmap.md 第 5 轮的个人中心子域：
/mine、/mine/personInfo、/mine/setting、/mine/shippingAddress、/mine/addAddress、
以及设置/消息/帮助等直接依赖页。
只迁移这些路由直接依赖的 API、Store、组件、页面和测试；复用已有 Auth session。
不要同时迁移钱包或节点。完成后更新路由矩阵，运行全部质量门，并做移动端浏览器验证。
```

订单代码提交与否由用户决定；下一轮不要把未提交的订单改动和个人中心改动混进同一个提交。
