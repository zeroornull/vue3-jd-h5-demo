# 当前开发进度

> 快照日期：2026-08-30
>
> 这是给下一轮对话用的进度单。路线细节见 [01-migration-roadmap.md](./01-migration-roadmap.md)，路由对账见 [05-route-migration-matrix.md](./05-route-migration-matrix.md)。

## 1. 一句话状态

第 5 轮分域迁移进行中。商品 / 分类 / 榜单 / 秒杀已提交；登录 / 注册 / 找回密码已实现且质量门通过，仍在工作区未提交。路由矩阵为 **19 migrated / 37 pending-view**。

## 2. 轮次

| 轮次 | 主题 | 状态 | Git |
| --- | --- | --- | --- |
| 0 | 盘点、归档、文档化 | 已完成 | 基线文档 |
| 1 | 现代工程骨架 | 已完成 | `7150c1b` |
| 2 | 平台基础设施 | 已完成 | `2077ac8` |
| 3 | Router 与 Pinia | 已完成 | `3e175b6` |
| 4 | 公共组件 + Home/Search/Cart | 已完成 | `2221db9` |
| 5A | 商品 / 分类 / 榜单 / 秒杀 | 已完成 | `7fc8243` |
| 5B | 登录 / 注册 / 找回密码 | **实现完成，待提交** | 工作区未提交 |
| 5C+ | 订单、钱包、节点、个人中心等 | 未开始 | — |
| 6 | 类型收紧与质量门禁 | 未开始 | — |
| 7 | 切换、性能与清理 | 未开始 | — |

当前 HEAD 是 `7fc8243`（商品子域）。认证改动尚未形成提交。

## 3. 已迁移路由

| 子域 | 路由 | 主要产物 |
| --- | --- | --- |
| 首页 / 搜索 / 购物车 | `/index`、`/search`、`/shopCart` | Home/Search/Cart 页面，Search/Cart Store |
| 商品 / 营销 | `/classify`、`/classify/product`、`/classify/recommend`、7 个活动 URL | Catalog Store、Category/Product/Campaign 页面 |
| 认证 | `/login`、`/register/emailRegister`、`/register/emailRegisterTwo`、`/register/phoneRegister`、`/register/phoneRegisterTwo`、`/mine/forgetPassword` | Auth Store、守卫、类型化 Auth API |

邮箱和手机注册共享 `RegisterStartView` / `RegisterCompleteView`，由 route name 区分渠道；7 个营销 URL 共享 `CampaignView`。

## 4. 第 5B 轮认证落地

### 已实现

- 类型：`src/types/auth.ts`
- API：`src/api/auth.ts`（POST `/api/auth/login|send-code|register|reset-password`）
- Store：`src/stores/auth.ts`（`localStorage.token` + `authUser`，内存注册草稿）
- 守卫：`src/router/auth-guards.ts`；`requiresAuth` / `guestOnly` 写入 RouteMeta
- 页面：`LoginView`、`RegisterStartView`、`RegisterCompleteView`、`ForgotPasswordView`
- 共享：`AuthShell`、`useVerificationCode`、`auth-validation`、`src/styles/auth.scss`
- Mock：开发 POST 认证流；旧 GET `/api/login`、`/api/register` 仍保留
- 资源：`public/mock/auth/logo.png`

### 演示账号

| 账号 | 密码 | 说明 |
| --- | --- | --- |
| `demo@example.com` | `Password123` | 登录页提示账号 |
| `13800138000` | `Password123` | 手机演示账号 |
| `zhangsan` | `123456` | 旧 Mock 兼容账号 |
| `tom` | `123` | 旧 Mock 兼容账号 |

开发验证码固定 `123456`。新注册/重置密码必须 8～64 位且同时包含字母和数字；旧兼容账号可以继续用短密码登录。

### 有意差异

- 旧登录页的登录/注册处理是空函数；新实现补全了可运行闭环，而不是复刻空按钮。
- 旧 Router 没有登录守卫；现在 `/mine`、`/order`、`/wallet`、`/myFocus` 未登录会去 `/login?redirect=...`，并拒绝 `//` 开源重定向。
- `/mine/forgetPassword` 虽在 `/mine` 下，仍是 `guestOnly`。
- `/mine` 仍是 pending-view，但已被守卫保护。
- 没有迁「第三方 TOP 金服登录」、改密页、个人资料，也没有在 HTTP 客户端里复刻 401 自动跳转。

### 本子域明确未做

订单、钱包、节点、个人中心、店铺详情、关注。这些路由仍指向 `MigrationPendingView`。

## 5. 剩余 37 条 pending（按域）

| 域 | 条数 | 代表路由 | 建议顺序 |
| --- | ---: | --- | --- |
| 订单 / 物流 / 申诉 | 10 | `/order`、`/order/orderDetail`、`/order/viewLogistics` | **下一子域** |
| 个人中心 / 地址 / 设置 | 13 | `/mine`、`/mine/setting`、`/mine/shippingAddress` | 订单之后；依赖已登录会话 |
| 节点 | 6 | `/node/nodeApplication` 及各级节点页 | 低频，可后置 |
| 钱包 | 3 | `/wallet/myWallet` 等 | 可独立切片 |
| 消费池 / 广告池 | 3 | `/pool/*` | 可与钱包一起或后置 |
| 其他 | 2 | `/storeDetail`、`/myFocus` | 低频 |

`orderDetail` 的历史 name 仍是 `home`，改名必须先搜调用点。

## 6. 质量门（2026-08-30 文档同步时实测）

```text
bun run type-check              PASS
bun run test:unit -- --run      PASS（19 files / 54 tests）
bun run lint                    PASS
bun run build-only              PASS（450 modules transformed）
```

生产构建：主入口 `index` 123.90 kB（gzip 43.95 kB）。认证懒加载 chunk 约 Login 2.51 kB、RegisterStart 2.90 kB、RegisterComplete 2.99 kB、ForgotPassword 3.52 kB。Vant 全量 CSS 仍约 199 kB（gzip 53.64 kB）。

本次文档同步**没有**重跑 375/390/430px 浏览器端到端。认证页的视觉回归仍待补。

## 7. 下一轮建议输入

```text
请继续 docs/01-migration-roadmap.md 第 5 轮的订单子域：
/order、/order/orderDetail、/order/toBeDelivered、/order/pendingReceipt、
/order/viewLogistics、/order/cancelOrder、/order/transactionDetails、
/order/appeal、/order/appealDetail、/order/appealRecord。
只迁移这些路由直接依赖的 API、Store、组件、页面和测试；保留 orderDetail 的历史 name `home`，除非能提供调用搜索和兼容跳转证据。
不要同时迁移钱包、节点或个人中心。完成后更新路由矩阵，运行全部质量门，并做移动端浏览器验证。
```

认证代码提交与否由用户决定；下一轮不要把未提交的认证改动和订单改动混进同一个提交。
