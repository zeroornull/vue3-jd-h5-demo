# 当前开发进度

> 快照日期：2026-08-30
>
> 这是给下一轮对话用的进度单。路线细节见 [01-migration-roadmap.md](./01-migration-roadmap.md)，路由对账见 [05-route-migration-matrix.md](./05-route-migration-matrix.md)。

## 1. 一句话状态

第 5 轮分域迁移进行中。商品、认证、订单、个人中心已提交；钱包 / 矿池已实现且质量门通过，仍在工作区未提交。路由矩阵为 **48 migrated / 8 pending-view**。

## 2. 轮次

| 轮次 | 主题 | 状态 | Git |
| --- | --- | --- | --- |
| 0–4 | 骨架到 Home/Search/Cart | 已完成 | `2221db9` |
| 5A | 商品 / 分类 / 榜单 / 秒杀 | 已完成 | `7fc8243` |
| 5B | 登录 / 注册 / 找回密码 | 已完成 | `05ede14` |
| 5C | 订单 / 物流 / 申诉 | 已完成 | `84dcb6a` |
| 5D | 个人中心 / 地址 / 设置 | 已完成 | `5fb24f6` |
| 5E | 钱包 / 矿池 | **实现完成，待提交** | 工作区未提交 |
| 5F+ | 节点申请、店铺详情、关注 | 未开始 | — |
| 6 | 类型收紧与质量门禁 | 未开始 | — |
| 7 | 切换、性能与清理 | 未开始 | — |

当前 HEAD 是 `5fb24f6`（个人中心）。

## 3. 已迁移路由

首页/搜索/购物车、商品/营销、认证、订单、个人中心、钱包（消费/余额）以及三个矿池。

## 4. 第 5E 轮钱包落地

- Store：`src/stores/wallet.ts`
- 页面：`WalletHomeView`、`WalletLedgerView`（消费/余额共享）、`PoolView`（三个矿池共享）
- 矿池「领取分红」会向余额钱包写入 69 CM 流水
- `/pool/nodePool` 是矿池流水，不是节点申请

## 5. 剩余 8 条 pending

| 域 | 条数 | 建议顺序 |
| --- | ---: | --- |
| 节点申请 | 6 | **下一子域** |
| 店铺详情、关注 | 2 | 低频 |

## 6. 质量门（2026-08-30 钱包子域实测）

```text
bun run type-check              PASS
bun run test:unit -- --run      PASS（23 files / 69 tests）
bun run lint                    PASS
bun run build-only              PASS（512 modules transformed）
```

主入口 128.19 kB（gzip 45.13 kB）。

浏览器：登录 → 我的 → 钱包总览 → 消费矿池领取 → 余额钱包出现 69 CM 领取流水，类型筛选生效。375/430px 无横向溢出、无 console error。

## 7. 下一轮建议输入

```text
请继续 docs/01-migration-roadmap.md 第 5 轮的节点申请子域：
/node/nodeApplication、/node/areaNode、/node/cityNode、/node/stateNode、
/node/industryNode、/node/superNode。
只迁移这些路由直接依赖的 API、Store、组件、页面和测试；复用已有 Auth session。
不要同时迁移店铺详情或关注。完成后更新路由矩阵，运行全部质量门，并做移动端浏览器验证。
```

钱包代码提交与否由用户决定；下一轮不要把未提交的钱包改动和节点改动混进同一个提交。
