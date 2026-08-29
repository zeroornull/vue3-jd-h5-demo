# 版本证据、兼容性实测与官方资料

## 1. 证据日期与范围

- 查询/验证日期：2026-08-29（Asia/Shanghai）。
- 本机 Bun：1.4.0。
- 本机 Node fallback：22.23.2。
- 版本来源：官方 npm registry `latest` dist-tag、Bun 官方 GitHub release、官方文档、`create-vue` 实际脚手架。
- 版本会变化；真正执行后续轮次时必须重新查询并运行验证。

## 2. Registry latest 快照

| 包 | 2026-08-29 latest |
| --- | ---: |
| `vue` | 3.5.42 |
| `vue-router` | 5.3.0 |
| `pinia` | 4.0.3 |
| `vite` | 8.2.2 |
| `@vitejs/plugin-vue` | 6.0.8 |
| `typescript` | 7.0.2 |
| `vue-tsc` | 3.3.11 |
| `axios` | 1.20.0 |
| `mitt` | 3.0.1 |
| `better-scroll` | 2.5.1 |
| `vant` | 4.10.0 |
| `eslint` | 10.9.1 |
| `eslint-plugin-vue` | 10.10.0 |
| `@vue/eslint-config-typescript` | 14.9.0 |
| `vitest` | 4.1.11 |
| `@vue/test-utils` | 2.5.0 |
| `jsdom` | 30.0.1 |
| `prettier` | 3.9.6 |
| `sass` | 1.103.1 |
| `postcss` | 8.5.26 |
| `postcss-pxtorem` | 6.1.0 |
| `vite-plugin-svg-icons` | 2.0.1 |
| `msw` | 2.15.0 |
| `create-vue` | 3.23.0 |

查询示例：

```bash
curl -fsSL https://registry.npmjs.org/vue/latest
curl -fsSL https://registry.npmjs.org/%40vitejs%2Fplugin-vue/latest
```

不要只读取版本号，也要查看 `engines` 与 `peerDependencies`。

## 3. 关键 engine / peer 约束

查询当日可见约束：

- Vite 8.2.2：Node `^20.19.0 || >=22.12.0`；
- `@vitejs/plugin-vue` 6.0.8：同样要求 Node `^20.19.0 || >=22.12.0`，支持 Vite 5—8；
- `create-vue` 3.23.0：声明 Node `^22.18.0 || >=24.12.0`；
- Vue Router 5.3.0：要求 Vue `^3.5.34 || ^4.0.0`，并声明与 Vite 7/8、Pinia 3/4 的 peer 关系；
- Pinia 4.0.3：要求 Vue `^3.5.11`、TypeScript `>=5.6.0`；
- ESLint 10.9.1：Node `^20.19.0 || ^22.13.0 || >=24`；
- Vitest 4.1.11：支持 Vite 6—8，Node `^20.0.0 || ^22.0.0 || >=24.0.0`；
- Vant 4.10.0：Vue peer 为 `^3.0.0`。

Bun 能运行这些工具的实际结果仍必须以项目门禁为准。Node engine 是工具上游声明，也是团队保留 Node fallback 时的最低约束参考。

## 4. 官方脚手架实测

使用命令：

```bash
bunx --bun create-vue@latest app \
  --ts --router --pinia --vitest --eslint --prettier --bare
cd app
bun install
bun run type-check
bun run test:unit -- --run
bun run lint
bun run build
```

生成的核心依赖范围：

```json
{
  "dependencies": {
    "pinia": "^4.0.2",
    "vue": "^3.5.40",
    "vue-router": "^5.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^6.0.8",
    "@vue/eslint-config-typescript": "^14.9.0",
    "eslint": "^10.7.0",
    "typescript": "~6.0.0",
    "vite": "^8.1.5",
    "vitest": "^4.1.10",
    "vue-tsc": "^3.3.7"
  }
}
```

安装解析到 Vue 3.5.42、Router 5.3.0、Pinia 4.0.3、Vite 8.2.2、TypeScript 6.0.3、Vue TSC 3.3.11、Vitest 4.1.11。

实测结果：

- `vue-tsc --build`：PASS；
- Vitest：1 file / 1 test PASS；
- Oxlint + ESLint：PASS；
- Vite build：PASS。

脚手架测试出现一个关于未来 `configLoader: 'native'` 的 Vite warning：`vitest.config.ts` 无扩展名导入 `./vite.config`。第 1 轮最终使用显式 `./vite.config.ts`，并在仅用于工具链、`noEmit: true` 的 `tsconfig.node.json` 中启用 `allowImportingTsExtensions`；类型检查和测试均通过，warning 已消除。

## 5. 无约束追新失败实测

在已通过的临时脚手架中执行：

```bash
bun update --latest
bun run type-check
```

`bun update --latest` 将 TypeScript 从 6.0.3 升级到 7.0.2，随后 `vue-tsc` 3.3.11 失败：

```text
Error: Failed to locate tsc module path from shim
```

结论：

- npm `latest` 各包单独看都是稳定发布，但不等于组合兼容；
- 官方脚手架对 TypeScript 使用 `~6.0.0` 是有效兼容约束；
- 本项目的“最新依赖”必须由完整门禁定义；
- TypeScript 7 升级需要等待/验证 Vue TSC 支持并作为独立变更处理。

## 6. 本仓库第 1 轮落地证据

第 1 轮使用 Bun 1.4.0、create-vue 3.23.0 在根目录建立实际工程，而不仅是临时兼容性实验。

最终核心解析版本：

- Vue 3.5.42；
- Vue Router 5.3.0；
- Pinia 4.0.3；
- Vite 8.2.2；
- TypeScript 6.0.3；
- `vue-tsc` 3.3.11；
- Vitest 4.1.11；
- Oxlint 与 `eslint-plugin-oxlint` 1.80.0。

验证结果：

```text
bun install --frozen-lockfile   PASS（锁文件无漂移）
bun run type-check              PASS
bun run test:unit -- --run      PASS（1 file / 1 test）
bun run lint                    PASS
bun run build                   PASS
```

Vite 生产构建：24 modules transformed；JavaScript 86.54 kB（gzip 33.81 kB）；CSS 0.19 kB（gzip 0.14 kB）。

Lint 首次执行暴露出 ESLint flat config 不会自动使用 Git ignore：它扫描了 `legacy/`，并在失败前自动修改 9 个旧文件。处理方式不是修旧代码，而是把 `legacy/**` 加入 ESLint 全局忽略，再从迁移前基线恢复那 9 个文件。最终对旧归档的 423 个文件逐字节复核结果为 0 缺失、0 差异。

## 7. 官方资料

### Vue

- Quick Start：<https://vuejs.org/guide/quick-start>
- Tooling：<https://vuejs.org/guide/scaling-up/tooling>
- TypeScript：<https://vuejs.org/guide/typescript/overview.html>
- State Management / Pinia recommendation：<https://vuejs.org/guide/scaling-up/state-management.html>
- create-vue：<https://github.com/vuejs/create-vue>

官方要点：新 Vue 项目使用 create-vue/Vite；Vite 只转译，CLI 类型检查使用 `vue-tsc`；Vuex 处于维护模式，新项目推荐 Pinia；VS Code 推荐 Vue - Official 扩展并禁用 Vetur。

### Bun

- Package manager：<https://bun.com/docs/pm>
- Install / frozen lockfile：<https://bun.com/docs/pm/cli/install>
- Lockfile：<https://bun.com/docs/pm/lockfile>
- Scripts：<https://bun.com/docs/pm/cli/run>
- Bun GitHub releases：<https://github.com/oven-sh/bun/releases>

官方要点：使用文本 `bun.lock`；`bun install --frozen-lockfile` 或 `bun ci` 保证 CI 不漂移；`bun pm migrate` 可迁移 Yarn/npm/pnpm 锁文件。

### Vite

- Guide：<https://vite.dev/guide/>
- Config：<https://vite.dev/config/>
- Server options：<https://vite.dev/config/server-options>
- Env variables：<https://vite.dev/guide/env-and-mode>

### Vue 生态

- Vue Router：<https://router.vuejs.org/>
- Pinia：<https://pinia.vuejs.org/>
- Vant 4：<https://vant-ui.github.io/vant/>
- Vitest：<https://vitest.dev/>
- Vue Test Utils：<https://test-utils.vuejs.org/>
- MSW：<https://mswjs.io/docs/>

## 8. 证据边界

- 版本快照能证明查询日期的 registry 状态，不能保证未来版本；
- 第 1 轮证明“现代空壳组合可工作”，不能证明旧项目 68 个 SFC 直接兼容；
- 旧项目未在本轮完成依赖安装和浏览器回归，因此文档没有声称旧工程当前可构建；
- 知识图谱是 best-effort，`src/views` 的已知解析缺口已经通过局部源码读取补查；
- Vant、Router、Pinia 的具体业务 API 仍需在各迁移轮按实际使用点逐项核对官方文档。
