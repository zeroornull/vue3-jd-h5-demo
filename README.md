# vue3-jd-h5-demo

旧 Vue CLI 工程的现代化迁移版本，目标技术栈为 Bun、TypeScript、Vue、Vite、Vue Router、Pinia、Axios 与 Vitest。

当前完成到第 3 轮：现代工程骨架、平台基础设施、旧路由 URL 契约和 Search/Cart Pinia 基线已经就绪；业务页面仍等待后续纵向切片迁移。迁移路线、学习材料和每轮验收标准见 [docs/README.md](./docs/README.md)。

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
```

## 目录说明

- `src/`：新的 TypeScript + Vue 应用；
- `docs/`：分轮迁移与学习文档；
- `legacy/`：迁移前旧工程的本地参考副本，已被 Git 忽略，不参与构建或发布。

> `legacy/` 不会进入远端仓库，而且当前新仓库的历史已经重写。若需要长期保留旧代码，请单独备份当前本机副本。
