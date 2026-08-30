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

## 7. 本仓库第 2 轮落地证据

第 2 轮日期：2026-08-30。新增平台依赖的 registry latest 与实际安装版本一致：

| 包 | 版本 | 约束/用途 |
| --- | ---: | --- |
| `axios` | 1.20.0 | 类型化 HTTP 实例、拦截器与错误规范化 |
| `sass` | 1.103.1 | Node `>=20.19.0`；SCSS 编译 |
| `postcss` | 8.5.26 | PostCSS 8 基线 |
| `postcss-pxtorem` | 6.1.0 | peer 要求 PostCSS `^8.0.0` |

关键验证：

- 类型化环境解析覆盖缺失值、非法 Mock flag 和 production 强制禁用；
- Axios adapter 测试覆盖 Bearer Token、无 Token 和 401 错误规范化；
- Mock 处理器覆盖登录成功/失败、静态接口、未知路由和非 GET；
- `SvgIcon` 覆盖无障碍 label、旧 `iconClass` 兼容和未知图标；
- 完整 Vitest 结果为 6 files / 17 tests；
- Vite dev 的 `/api/login` 与 `/api/banner` 返回 Mock JSON；
- Vite production preview 的 `/api/login` 返回 SPA HTML，不包含 Mock Token；
- 构建 CSS 证明 16px 转为 `.42667rem`，根字号仍保持 px；
- 375、390、430px 三个真实浏览器视口均无横向溢出，根字号随视口为 37.5、39、43px；
- 空路由表产生的 Router `R0004` warning 已用临时根占位路由消除，并有解析测试；
- 新代码检索不到 `process.env` 或 Webpack `require.context`；
- HTTP 客户端没有 Vue、Router 或 UI 组件依赖。

生产构建：25 modules transformed；JavaScript 86.63 kB（gzip 33.84 kB）；CSS 0.62 kB（gzip 0.38 kB）。

## 8. 本仓库第 3 轮落地证据

第 3 轮日期：2026-08-30。Vue Router 5.3.0 与 Pinia 4.0.3 版本未变化，没有新增状态管理或路由依赖。

Router 证据：

- legacy 独立图索引确认 53 个路由模块，源文件覆盖无记录缺口；
- 运行时导入旧模块得到 56 条记录；唯一多记录模块是 `tabbar.js`（4 条）；
- manifest 测试确认 53 个唯一 source module、56 个唯一 path、56 个唯一 name；
- Router 总记录为 59：根记录、56 个旧模块记录、`/nopermission`、catch-all；
- `/` → `/index`、56 条 path/meta、相对 path 规范化、历史 name `home`、catch-all params 均有测试；
- 浏览器验证 `/index`、`/order/orderDetail`、`/classify/recommend` 和未知深层路径，控制台无 error/warn/issue。

Pinia 证据：

- 搜索代码检索只发现 Search 页面使用 `addHistory`、`setHistory`、去重、读取/写入同名 localStorage key；
- Cart 全库只有首页调用 `cart/addToCart`；
- Search 测试覆盖 hydrate、损坏数据自愈、前插去重、持久化、空关键词和清空；
- Cart 测试覆盖计数和 reset；
- `package.json` 不含 Vuex；HTTP/Router/UI 与 Store 持久化边界分离。

完整验证：8 test files / 27 tests；37 modules transformed；主 JavaScript 103.26 kB（gzip 37.23 kB）。

## 9. 本仓库第 4 轮落地证据

第 4 轮日期：2026-08-30。新增运行时依赖：Vant 4.10.0（Vue peer `^3.0.0`）与 better-scroll 2.5.1（自带 TypeScript 声明）。

公共组件证据：

- Vant 组件手动注册，Popup/Picker 使用 Vant 4 的 model 和 confirm payload；
- ConfirmDialog、AppPicker、ProgressBar、ListScroll 各有组件测试；
- ListScroll 测试证明创建一个 BetterScroll 实例并在 unmount destroy；
- Tabbar badge 读取 Pinia Cart，不存在 EventBus/Vuex；
- 浏览器控制台 0 error/warn/issue，搜索字段补齐 id/name/ARIA。

纵向链路证据：

- `/api/home` 与 `/api/search/hot` 使用类型化 `ApiResponse<T>` 和 `unwrapApiResponse`；
- Mock 处理器测试覆盖 Home banner/section 和旧热搜词；
- 路由矩阵为 3 migrated / 53 pending-view；
- Home 加购 → Search history/localStorage → Cart 数量/合计 → 支付 Picker → 删除确认完整通过；
- 375/390/430px 均无横向溢出，截图位于本地 `.omx/evidence/round4/`；
- 完整验证为 13 test files / 35 tests，Vite 402 modules transformed。

构建证据：主入口 115.84 kB（gzip 41.13 kB）；Home 4.24 kB、Search 3.86 kB、Cart 4.09 kB，均为 lazy chunks；Vant 全量 CSS 197.73 kB（gzip 53.23 kB）是下一阶段的明确优化候选。

## 10. 官方资料

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

### 平台依赖

- Axios：<https://axios-http.com/docs/intro>
- Sass：<https://sass-lang.com/documentation/>
- PostCSS：<https://postcss.org/>
- postcss-pxtorem：<https://github.com/cuth/postcss-pxtorem>

### Vue 生态

- Vue Router：<https://router.vuejs.org/>
- Pinia：<https://pinia.vuejs.org/>
- Vant 4：<https://vant-ui.github.io/vant/>
- Vitest：<https://vitest.dev/>
- Vue Test Utils：<https://test-utils.vuejs.org/>
- MSW：<https://mswjs.io/docs/>
- Vue Router typed/meta/catch-all：<https://router.vuejs.org/guide/advanced/meta.html>
- Pinia Vuex migration：<https://pinia.vuejs.org/cookbook/migration-vuex.html>
- Pinia testing：<https://pinia.vuejs.org/cookbook/testing.html>
- Vant 4：<https://vant-ui.github.io/vant/>
- BetterScroll：<https://better-scroll.github.io/docs/>

## 11. 证据边界

- 版本快照能证明查询日期的 registry 状态，不能保证未来版本；
- 第 1 轮证明“现代空壳组合可工作”，不能证明旧项目 68 个 SFC 直接兼容；
- 第 2 轮只建立基础设施和最小旧接口契约，没有证明全部历史 Mock 数据、图片或 SVG 已迁移；
- 第 3 轮迁移的是 URL/name/meta 契约与有调用证据的 Store 行为；56 个业务页面仍是明确的 pending-view，并不等于页面功能完成；
- 第 4 轮只把 Home、Search、Cart 三条路由标记为 migrated；Cart 的支付只完成选择 UI，服务端订单、库存扣减和持久购物车仍未实现；
- 旧项目未在本轮完成依赖安装和浏览器回归，因此文档没有声称旧工程当前可构建；
- 知识图谱是 best-effort，`src/views` 的已知解析缺口已经通过局部源码读取补查；
- Vant、Router、Pinia 的具体业务 API 仍需在各迁移轮按实际使用点逐项核对官方文档。
