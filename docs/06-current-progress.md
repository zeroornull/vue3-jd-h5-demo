# 当前开发进度

> 快照日期：2026-08-30
>
> 这是给下一轮对话用的进度单。路线细节见 [01-migration-roadmap.md](./01-migration-roadmap.md)，路由对账见 [05-route-migration-matrix.md](./05-route-migration-matrix.md)。发布说明见 [07-release-and-rollback.md](./07-release-and-rollback.md)。

## 1. 一句话状态

第 0–7 轮迁移路线已经全部落地。第 7 轮切换、性能与清理已实现且质量门、preview smoke 通过，仍在工作区未提交。路由矩阵为 **56 migrated / 0 pending-view**。

## 2. 轮次

| 轮次 | 主题 | 状态 | Git |
| --- | --- | --- | --- |
| 0–4 | 骨架到 Home/Search/Cart | 已完成 | `2221db9` |
| 5A–5E | 商品、认证、订单、个人中心、钱包 | 已完成 | `9e6f6cd` |
| 5F–5G | 节点申请、店铺详情与关注 | 已完成 | `eacb7b3` |
| 6 | 类型收紧与质量门禁 | 已完成 | `65244ee` |
| 7 | 切换、性能与清理 | **实现完成，待提交** | 工作区未提交 |

当前 HEAD 是 `65244ee`（第 6 轮）。

## 3. 第 7 轮落地

- 部署：`base: '/'`，SPA fallback，preview 可开 Mock
- 体积：Vant 按需 CSS，主样式约减半
- 清理：旧 GET 登录/注册/banner/classify Mock；403 页替换占位页
- 发布说明：`docs/07-release-and-rollback.md`
- 未升 TypeScript 7

## 4. 质量门（2026-08-30 第 7 轮实测）

```text
bun run type-check              PASS
bun run test:unit -- --run      PASS（32 files / 85 tests）
bun run lint                    PASS
bun run build-only              PASS（566 modules transformed）
bun run smoke                   PASS
```

主入口 JS 129.40 kB（gzip 45.45 kB）；CSS 96.38 kB（gzip 39.04 kB）。

preview 浏览器（375/430）：深层 `/classify/product?id=product-1` 直开、首页 Tabbar、`/nopermission`，无横向溢出，控制台 0 error。

## 5. 路线之后

迁移 7 轮目标已经完成。后续若继续，应作为独立变更，而不是第 8 轮：

- 真实后端与 401 自动跳转；
- 图片压缩 / 进一步拆 `payloads` chunk；
- Playwright 浏览器套件；
- TypeScript 7（需 `vue-tsc` 支持）。

第 7 轮代码提交与否由用户决定。
