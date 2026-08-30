# 当前开发进度

> 快照日期：2026-08-30
>
> 这是给下一轮对话用的进度单。路线细节见 [01-migration-roadmap.md](./01-migration-roadmap.md)，发布说明见 [07-release-and-rollback.md](./07-release-and-rollback.md)。

## 1. 一句话状态

第 0–7 轮与 401 跳转已提交。独立变更 **按域拆分 payload 解析** 已实现且质量门通过，仍在工作区未提交。

## 2. 轮次

| 轮次 | 主题 | 状态 | Git |
| --- | --- | --- | --- |
| 0–7 | 骨架到发布清理 | 已完成 | `b9eae0c` |
| 路线之后 | HTTP 401/403 跳转登录 | 已完成 | `cdb3c5b` |
| 路线之后 | 拆分 payload 解析 chunk | **实现完成，待提交** | 工作区未提交 |

当前 HEAD 是 `cdb3c5b`（401 跳转）。

## 3. 本变更

- `src/api/payloads.ts` 拆为 `payloads/auth|home|catalog|order|profile|wallet|node|focus.ts`
- 登录相关只加载 auth 解析器（0.56 kB），不再打进 63 kB 单体 chunk
- 没有改页面行为，没有重跑浏览器端到端

## 4. 质量门（2026-08-30 实测）

```text
bun run type-check              PASS
bun run test:unit -- --run      PASS（33 files / 89 tests）
bun run lint                    PASS
bun run build-only              PASS（574 modules transformed）
```

## 5. 仍可独立继续的项

- 真实后端
- `public/mock` 图片压缩
- Playwright
- TypeScript 7（需 `vue-tsc` 支持）
