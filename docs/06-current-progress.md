# 当前开发进度

> 快照日期：2026-08-30
>
> 这是给下一轮对话用的进度单。路线细节见 [01-migration-roadmap.md](./01-migration-roadmap.md)，路由对账见 [05-route-migration-matrix.md](./05-route-migration-matrix.md)。

## 1. 一句话状态

第 5 轮分域迁移进行中。商品、认证、订单已提交；个人中心 / 地址 / 设置已实现且质量门通过，仍在工作区未提交。路由矩阵为 **42 migrated / 14 pending-view**。

## 2. 轮次

| 轮次 | 主题 | 状态 | Git |
| --- | --- | --- | --- |
| 0–4 | 骨架到 Home/Search/Cart | 已完成 | `2221db9` |
| 5A | 商品 / 分类 / 榜单 / 秒杀 | 已完成 | `7fc8243` |
| 5B | 登录 / 注册 / 找回密码 | 已完成 | `05ede14` |
| 5C | 订单 / 物流 / 申诉 | 已完成 | `84dcb6a` |
| 5D | 个人中心 / 地址 / 设置 | **实现完成，待提交** | 工作区未提交 |
| 5E+ | 钱包、节点、店铺详情、关注 | 未开始 | — |
| 6 | 类型收紧与质量门禁 | 未开始 | — |
| 7 | 切换、性能与清理 | 未开始 | — |

当前 HEAD 是 `84dcb6a`（订单子域）。

## 3. 已迁移路由

| 子域 | 路由 |
| --- | --- |
| 首页 / 搜索 / 购物车 | `/index`、`/search`、`/shopCart` |
| 商品 / 营销 | `/classify*`、7 个活动 URL |
| 认证 | `/login`、注册 4 条、`/mine/forgetPassword` |
| 订单 | `/order` 及 9 条 `/order/*` |
| 个人中心 | `/mine` 及资料/设置/地址/消息/帮助等 12 条 |

## 4. 第 5D 轮个人中心落地

- Store：`src/stores/profile.ts`（资料、地址、消息、帮助、设置）
- 页面：`MineView`、资料、设置、地址列表/表单、关于、消息、帮助、反馈、改密、手机/邮箱设置、国家地区
- 改昵称同步 `authUser`；退出登录清 session
- 钱包/节点入口仍指向 pending-view
- `setInfo.vue` 无独立路由，未迁入

## 5. 剩余 14 条 pending

| 域 | 条数 | 建议顺序 |
| --- | ---: | --- |
| 节点 | 6 | 可后置 |
| 钱包 | 3 | **下一子域** |
| 消费池 / 广告池 | 3 | 可与钱包一起 |
| 店铺详情、关注 | 2 | 低频 |

## 6. 质量门（2026-08-30 个人中心实测）

```text
bun run type-check              PASS
bun run test:unit -- --run      PASS（22 files / 65 tests）
bun run lint                    PASS
bun run build-only              PASS（502 modules transformed）
```

主入口 127.46 kB（gzip 44.99 kB）。

浏览器：`/mine` 展示资料与订单计数；改昵称；地址设默认/新增；关于我们；退出后 `/mine` 回到登录。375/430px 无横向溢出、无 console error。

## 7. 下一轮建议输入

```text
请继续 docs/01-migration-roadmap.md 第 5 轮的钱包子域：
/wallet/myWallet、/wallet/balanceWallet、/wallet/consumerWallet，
以及可以直接复用的 /pool/* 若范围仍可独立验收。
只迁移这些路由直接依赖的 API、Store、组件、页面和测试；复用已有 Auth session。
不要同时迁移节点。完成后更新路由矩阵，运行全部质量门，并做移动端浏览器验证。
```

个人中心代码提交与否由用户决定；下一轮不要把未提交的个人中心改动和钱包改动混进同一个提交。
