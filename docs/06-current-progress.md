# 当前开发进度

> 快照日期：2026-08-30
>
> 这是给下一轮对话用的进度单。路线细节见 [01-migration-roadmap.md](./01-migration-roadmap.md)，路由对账见 [05-route-migration-matrix.md](./05-route-migration-matrix.md)。

## 1. 一句话状态

第 5 轮分域页面已提交。第 6 轮类型收紧与质量门禁已实现且质量门通过，仍在工作区未提交。路由矩阵为 **56 migrated / 0 pending-view**。

## 2. 轮次

| 轮次 | 主题 | 状态 | Git |
| --- | --- | --- | --- |
| 0–4 | 骨架到 Home/Search/Cart | 已完成 | `2221db9` |
| 5A–5E | 商品、认证、订单、个人中心、钱包 | 已完成 | `9e6f6cd` |
| 5F–5G | 节点申请、店铺详情与关注 | 已完成 | `eacb7b3` |
| 6 | 类型收紧与质量门禁 | **实现完成，待提交** | 工作区未提交 |
| 7 | 切换、性能与清理 | 未开始 | — |

当前 HEAD 是 `eacb7b3`（第 5 轮收口）。

## 3. 第 6 轮落地

- API 边界：`http.get/post<unknown>` → envelope 校验 → 域解析器
- 声明：`RouteMeta`、`ImportMetaEnv`、`*.svg?raw`
- 测试：关键公共组件、json-storage、money、payload 与现有 mock 种子对拍
- CI：`.github/workflows/ci.yml` 与 `bun run ci`
- 没有迁 Playwright/MSW，没有做第 7 轮性能/发布清理

## 4. 质量门（2026-08-30 第 6 轮实测）

```text
bun run type-check              PASS
bun run test:unit -- --run      PASS（32 files / 86 tests）
bun run lint                    PASS
bun run build-only              PASS（528 modules transformed）
```

主入口 129.33 kB（gzip 45.43 kB）。

本轮没有改用户可见页面，因此没有重跑移动端浏览器端到端。

## 5. 下一轮建议输入

```text
请继续 docs/01-migration-roadmap.md 第 7 轮：切换、性能与清理。
校验 base/history fallback 与静态资源路径，记录首屏/chunk/图片体积，删除确认无用的兼容层，不要升级 TypeScript 7。
完成后运行全部质量门，补部署等价 smoke，并更新文档。
```

第 6 轮代码提交与否由用户决定。
