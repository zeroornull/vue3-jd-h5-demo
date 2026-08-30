# 发布与回滚

> 快照日期：2026-08-30。对应第 7 轮切换、性能与清理。

## 1. 部署契约

| 项 | 当前值 | 说明 |
| --- | --- | --- |
| `base` | `/` | 子目录部署时改 `vite.config.ts` 的 `base`，并与静态资源前缀一致 |
| History | `createWebHistory(import.meta.env.BASE_URL)` | 刷新深层 URL 需要宿主 SPA fallback |
| API | `VITE_API_BASE_URL=/api` | 构建期写入客户端 |
| Mock | 生产默认关闭 | 预览演示：`VITE_ENABLE_MOCK=true bun run preview` |

Nginx 等价配置：

```nginx
location / {
  try_files $uri $uri/ /index.html;
}

location /api/ {
  proxy_pass http://upstream-api;
}
```

GitHub Pages 等纯静态宿主需要把 `404.html` 做成 `index.html` 的副本，否则深层刷新会 404。

## 2. 本地发布等价命令

```bash
bun install --frozen-lockfile
bun run type-check
bun run lint
bun run test:unit -- --run
bun run build-only
VITE_ENABLE_MOCK=true bun run preview
# 或
bun run smoke
```

`bun run smoke` 会在 `127.0.0.1:4173` 拉起 preview，检查：

- `/index` 返回 SPA 壳；
- `/classify/product?id=product-1` 刷新仍返回 `index.html`；
- `/api/catalog` 在 Mock 开启时返回 JSON；
- `/mock/home/product-1.png` 与 `/favicon.ico` 可访问。

`public/mock` 体积约 435 kB。重新导出素材后可运行 `python3 scripts/compress-mock-images.py`（需要本机 Pillow）。

真实后端环境不要设置 `VITE_ENABLE_MOCK=true`。

## 3. 回滚

1. 回退到上一轮提交（第 6 轮 `65244ee`，或本轮提交的 parent）；
2. 同步回退 `bun.lock` 与 `package.json`；
3. `rm -rf node_modules dist` 后执行 `bun install --frozen-lockfile`；
4. 再跑 `bun run ci`。

不要用 `bun update --latest` 作为回滚手段。TypeScript 7 仍不在兼容集内。

## 4. `legacy/` 边界

`legacy/` 被 `.gitignore`、ESLint ignore 和 TypeScript include 排除，不参与安装、构建、测试和发布。新克隆仓库没有这份目录；需要对照旧工程时只能使用本机备份。
