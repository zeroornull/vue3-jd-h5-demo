# 当前开发进度

> 快照日期：2026-08-30
>
> 这是给下一轮对话用的进度单。路线细节见 [01-migration-roadmap.md](./01-migration-roadmap.md)，发布说明见 [07-release-and-rollback.md](./07-release-and-rollback.md)。

## 1. 一句话状态

第 0–7 轮迁移路线已提交。路线之后的独立变更 **HTTP 401/403 跳转登录** 已实现且质量门、浏览器验证通过，仍在工作区未提交。

## 2. 轮次

| 轮次 | 主题 | 状态 | Git |
| --- | --- | --- | --- |
| 0–7 | 骨架到发布清理 | 已完成 | `b9eae0c` |
| 路线之后 | HTTP 401/403 跳转登录 | **实现完成，待提交** | 工作区未提交 |

当前 HEAD 是 `b9eae0c`（第 7 轮）。

## 3. 本变更

- `installUnauthorizedRedirect`：401/403 时 `logout` 并跳到 `/login?redirect=`
- 登录页不循环跳转
- Mock：`Authorization: Bearer expired` 返回 HTTP 401

## 4. 质量门（2026-08-30 实测）

```text
bun run type-check              PASS
bun run test:unit -- --run      PASS（33 files / 89 tests）
bun run lint                    PASS
bun run build-only              PASS（567 modules transformed）
```

浏览器：过期 token 进「我的」→ `/login?redirect=/mine`；重新登录回到「我的」。控制台 0 error。

## 5. 仍可独立继续的项

- 真实后端（本变更只补了 401 跳转）
- 图片压缩 / 拆 `payloads` chunk
- Playwright
- TypeScript 7（需 `vue-tsc` 支持）
