# 当前开发进度

> 快照日期：2026-08-30
>
> 这是给下一轮对话用的进度单。路线细节见 [01-migration-roadmap.md](./01-migration-roadmap.md)，路由对账见 [05-route-migration-matrix.md](./05-route-migration-matrix.md)。

## 1. 一句话状态

第 5 轮分域迁移页面已全部落地。商品到钱包已提交；节点申请、店铺详情与关注已实现且质量门通过，仍在工作区未提交。路由矩阵为 **56 migrated / 0 pending-view**。

## 2. 轮次

| 轮次 | 主题 | 状态 | Git |
| --- | --- | --- | --- |
| 0–4 | 骨架到 Home/Search/Cart | 已完成 | `2221db9` |
| 5A–5E | 商品、认证、订单、个人中心、钱包 | 已完成 | `9e6f6cd` |
| 5F | 节点申请 | **实现完成，待提交** | 工作区未提交 |
| 5G | 店铺详情、关注 | **实现完成，待提交** | 工作区未提交 |
| 6 | 类型收紧与质量门禁 | 未开始 | — |
| 7 | 切换、性能与清理 | 未开始 | — |

当前 HEAD 是 `9e6f6cd`（钱包子域）。

## 3. 第 5F 轮节点落地

- Store：`src/stores/node.ts`
- 页面：`NodeHubView`、`NodeApplyView`（5 类申请共享）
- 浏览器：分享节点 CoinPay 后剩余 128→127；区域节点支付后剩余 65→64；375/430px 无横向溢出，控制台 0 error

## 4. 第 5G 轮店铺与关注落地

- Store：`src/stores/focus.ts`
- 页面：`StoreDetailView`、`FocusView`
- `StoreCard` 进店为 `/storeDetail?id=`
- 「我的」商品/店铺关注计数来自关注快照
- 浏览器：关注取消后列表与计数同步；店铺详情排序/加购/关注；商品详情心形写入同一快照；375/430px 无横向溢出，控制台 0 error

## 5. 质量门（2026-08-30 店铺/关注子域实测）

```text
bun run type-check              PASS
bun run test:unit -- --run      PASS（25 files / 75 tests）
bun run lint                    PASS
bun run build-only              PASS（527 modules transformed）
```

主入口 129.37 kB（gzip 45.38 kB）。

## 6. 提交边界

节点文件与店铺/关注文件目前都在工作区。提交时请拆开：

1. 先提交 5F 节点（`src/api/node.ts`、`src/stores/node.ts`、`src/views/node/` 等）；
2. 再提交 5G 店铺与关注（`src/api/focus.ts`、`src/stores/focus.ts`、`StoreDetailView`、`FocusView` 等）。

共享文件（`handlers.ts`、`legacy-routes.ts`、`legacy-manifest.ts`、`MineView.vue`、docs）会同时包含两轮改动，无法完全物理隔离；不要把两轮业务页面混成一个“大迁移”说明。

## 7. 下一轮建议输入

```text
请继续 docs/01-migration-roadmap.md 第 6 轮：类型收紧与质量门禁。
保持 strict、收紧 API 边界的 unknown、补关键组件测试，不要开始发布切换或删兼容层。
完成后运行全部质量门，并更新文档。
```

第 5 轮 56 条业务路由已经没有 pending-view。
