# vue3-jd-h5-demo

旧 Vue CLI 工程的现代化迁移版本，目标技术栈为 Bun、TypeScript、Vue、Vite、Vue Router、Pinia、Axios 与 Vitest。

当前第 0–7 轮迁移路线已落地，HTTP 401/403 会清会话并回到登录页。活进度见 [docs/06-current-progress.md](./docs/06-current-progress.md)，发布与回滚见 [docs/07-release-and-rollback.md](./docs/07-release-and-rollback.md)。

## 环境

- Bun 1.4.0
- Node.js `^22.18.0 || >=24.12.0`，用于需要 Node fallback 的工具

## 安装

```bash
bun install --frozen-lockfile
```

## 开发

```bash
bun run dev
```

## 质量检查

```bash
bun run type-check
bun run test:unit -- --run
bun run lint
bun run build
bun run smoke
bun run ci
```

生产预览（带开发 Mock）：

```bash
bun run build-only
VITE_ENABLE_MOCK=true bun run preview
```

## 目录说明

- `src/`：新的 TypeScript + Vue 应用；
- `docs/`：分轮迁移与学习文档；
- `legacy/`：迁移前旧工程的本地参考副本，已被 Git 忽略，不参与构建或发布。

> `legacy/` 不会进入远端仓库，而且当前新仓库的历史已经重写。若需要长期保留旧代码，请单独备份当前本机副本。
