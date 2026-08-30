# 当前开发进度

> 快照日期：2026-08-30
>
> 这是给下一轮对话用的进度单。路线细节见 [01-migration-roadmap.md](./01-migration-roadmap.md)，发布说明见 [07-release-and-rollback.md](./07-release-and-rollback.md)。

## 1. 一句话状态

第 0–7 轮、401 跳转与 payload 拆 chunk 已提交。独立变更 **压缩 `public/mock` 图片** 已实现且浏览器验证通过，仍在工作区未提交。

## 2. 轮次

| 轮次 | 主题 | 状态 | Git |
| --- | --- | --- | --- |
| 0–7 | 骨架到发布清理 | 已完成 | `b9eae0c` |
| 路线之后 | HTTP 401/403 跳转登录 | 已完成 | `cdb3c5b` |
| 路线之后 | 拆分 payload 解析 chunk | 已完成 | `1036ea0` |
| 路线之后 | 压缩 mock 图片 | **实现完成，待提交** | 工作区未提交 |

当前 HEAD 是 `1036ea0`（payload 拆分）。

## 3. 本变更

- `public/mock`：1,453,506 → 434,857 字节（约 30%）
- 可重复脚本：`python3 scripts/compress-mock-images.py`（本机 Pillow，不新增 npm 依赖）
- 路径与透明通道保持不变

## 4. 质量门（2026-08-30 实测）

```text
bun run test:unit -- --run      PASS（33 files / 89 tests）
bun run build-only              PASS
bun run smoke                   PASS
```

浏览器：首页 banner/商品、爱逛好店店铺图加载成功；375/430px 无横向溢出，控制台 0 error。

## 5. 仍可独立继续的项

- 真实后端
- Playwright
- TypeScript 7（需 `vue-tsc` 支持）
