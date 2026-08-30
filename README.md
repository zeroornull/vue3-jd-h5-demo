# vue3-jd-h5-demo

旧 Vue CLI 工程的现代化迁移版本，目标技术栈为 Bun、TypeScript、Vue、Vite、Vue Router、Pinia、Axios 与 Vitest。

当前第 5 轮分域页面已提交，第 6 轮类型收紧与质量门禁已落地：路由矩阵为 56 migrated / 0 pending。活进度见 [docs/06-current-progress.md](./docs/06-current-progress.md)，路线和学习材料见 [docs/README.md](./docs/README.md)。

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
bun run ci
```

## 目录说明

- `src/`：新的 TypeScript + Vue 应用；
- `docs/`：分轮迁移与学习文档；
- `legacy/`：迁移前旧工程的本地参考副本，已被 Git 忽略，不参与构建或发布。

> `legacy/` 不会进入远端仓库，而且当前新仓库的历史已经重写。若需要长期保留旧代码，请单独备份当前本机副本。
