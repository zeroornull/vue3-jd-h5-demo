# Bun + TypeScript + Vue 现代化迁移路线

## 1. 目标与边界

### 1.1 最终目标

最终根目录应成为一个可复现、可测试、可持续升级的现代 Vue SPA：

- Bun 负责依赖安装、锁文件和脚本执行；
- Vue 3 最新兼容稳定版；
- Vite 8；
- TypeScript 严格模式；
- Vue Router 5；
- Pinia 4；
- Vant 4；
- Vitest + Vue Test Utils；
- ESLint/Oxlint + Prettier；
- CI 使用冻结锁文件安装；
- `legacy/` 只作本地对照，不参与构建和提交。

### 1.2 非目标

迁移期间不同时做以下大范围变更：

- 不重新设计全部 UI；
- 不把每个 Options API 组件强制重写成 Composition API；
- 不在缺少测试时“顺手修复”所有历史业务问题；
- 不无差别替换所有依赖；
- 不在同一轮同时改构建系统、业务逻辑和视觉设计。

### 1.3 核心原则

1. **先得到绿色空壳，再搬基础设施，再搬业务。**
2. **TypeScript 迁移与 Composition API 重写解耦。** Options API 也可以先加 `lang="ts"` 和 `defineComponent`。
3. **按业务纵向切片迁移。** 每批包含 Router、Store/API、组件、页面和测试。
4. **兼容性优先于版本数字。** 只提交能通过全部质量门的依赖组合。
5. **每轮一个提交边界。** 每轮结束都能构建、验收和回滚。

## 2. 版本基线（2026-08-29）

### 2.1 首轮推荐的“最新兼容稳定集”

以下范围以 2026-08-29 的 `create-vue@3.23.0` 实际输出和 Bun 1.4.0 实测为基准：

| 包/工具 | 首轮建议 | 当日 registry latest | 说明 |
| --- | --- | --- | --- |
| Bun | `1.4.0` | `1.4.0` | 记录到 `packageManager`，CI 同版本 |
| Vue | `^3.5.40` | `3.5.42` | 安装解析到 3.5.42 |
| Vue Router | `^5.2.0` | `5.3.0` | 安装解析到 5.3.0 |
| Pinia | `^4.0.2` | `4.0.3` | 安装解析到 4.0.3 |
| Vite | `^8.1.5` | `8.2.2` | 安装解析到 8.2.2 |
| `@vitejs/plugin-vue` | `^6.0.8` | `6.0.8` | 与 Vite 8 兼容 |
| TypeScript | `~6.0.0` | `7.0.2` | **暂不升 7**；见兼容门说明 |
| `vue-tsc` | `^3.3.7` | `3.3.11` | 与 TS 6 实测通过 |
| Vitest | `^4.1.10` | `4.1.11` | 与 Vite 8 实测通过 |
| ESLint | `^10.7.0` | `10.9.1` | 使用 flat config |
| Vant | 第 2/4 轮安装 `^4.10.0` | `4.10.0` | 不在空壳轮提前搬 UI |
| Axios | 第 2 轮安装 `^1.20.0` | `1.20.0` | 建立类型化客户端后再搬接口 |

> 版本表是时间快照，不是永久事实。执行某一轮时先查询 registry，但任何升级都必须重新通过该轮全部验证。

### 2.2 TypeScript 7 兼容门

2026-08-29 实测：

1. 官方脚手架组合（TypeScript 6.0.3）通过 `type-check`、单测、Lint、构建；
2. `bun update --latest` 将 TypeScript 升至 7.0.2；
3. `vue-tsc` 3.3.11 随即失败：`Failed to locate tsc module path from shim`。

因此在 `vue-tsc` 或上游工具明确支持前，不把 TypeScript 7 放进第 1 轮。以后升级时必须新建独立变更并满足：

```bash
bun install --frozen-lockfile
bun run type-check
bun run test:unit -- --run
bun run lint
bun run build
```

## 3. 目标目录结构

目标结构建议如下：

```text
.
├── docs/
├── legacy/                 # 本机对照副本，Git ignored
├── public/
├── src/
│   ├── api/                # 类型化 API 函数和 DTO
│   ├── assets/
│   ├── components/
│   ├── composables/
│   ├── directives/
│   ├── layouts/
│   ├── mocks/
│   ├── router/
│   ├── stores/
│   ├── styles/
│   ├── types/
│   ├── views/
│   ├── App.vue
│   └── main.ts
├── env.d.ts
├── eslint.config.ts
├── index.html
├── package.json
├── bun.lock
├── tsconfig*.json
├── vite.config.ts
└── vitest.config.ts
```

不要提前创建空目录。只有某轮真正引入职责时才添加目录和文件。

## 4. 分轮实施方案

## 第 0 轮：盘点与归档（已完成）

**产物**：

- `legacy/` 本机旧工程副本；
- 根 `.gitignore` 的 `/legacy/` 规则；
- 本文档集；
- 旧工程依赖、路由、Store、资源和构建机制盘点。

**验收**：

```bash
test -f legacy/package.json
test -f legacy/src/main.js
git check-ignore -q legacy/package.json
test -f docs/README.md
```

## 第 1 轮：现代工程骨架（已完成，2026-08-29）

### 本轮只做什么

1. 使用官方 `create-vue` 在临时目录生成配置，功能标志：
   - TypeScript；
   - Vue Router；
   - Pinia；
   - Vitest；
   - ESLint；
   - Prettier；
   - bare 模板。
2. 把脚手架文件有选择地合并到根目录，保留：
   - `docs/`；
   - `/legacy/` ignore；
   - `.omx/` 本地状态。
3. 增加 `packageManager: "bun@1.4.0"`。
4. 生成 `bun.lock`，删除/不创建其他包管理器锁文件。
5. 建立最小 `App.vue` 和一个 smoke test。

### 安全脚手架方式

根目录已经有 `docs/` 和 `.gitignore`，不要直接用 `--force` 覆盖根目录。建议先生成到临时目录：

```bash
workdir="$(mktemp -d)"
cd "$workdir"
bunx --bun create-vue@latest vue3-jd-h5 \
  --ts --router --pinia --vitest --eslint --prettier --bare
cd vue3-jd-h5
bun install
```

审核生成文件与依赖后，再逐项合并到项目根目录。尤其要手工合并 `.gitignore`，不能丢失 `/legacy/`。

### 本轮不做什么

- 不复制 `legacy/src`；
- 不安装 Vant/Axios/better-scroll；
- 不迁移 Router 模块；
- 不迁移 Vuex；
- 不做 UI 重构。

### 验收

```bash
bun install --frozen-lockfile
bun run type-check
bun run test:unit -- --run
bun run lint
bun run build
```

所有命令必须退出码为 0。若脚手架自身给出 warning，也要记录并判断是否可消除；不能只看最后一个命令。

### 实际落地记录

- 使用 `create-vue` 3.23.0 的 `--ts --router --pinia --vitest --eslint --prettier --bare` 组合；
- `packageManager` 固定为 `bun@1.4.0`，只生成 `bun.lock`；
- 安装解析到 Vue 3.5.42、Router 5.3.0、Pinia 4.0.3、Vite 8.2.2、TypeScript 6.0.3、`vue-tsc` 3.3.11 与 Vitest 4.1.11；
- 将 Oxlint 与 `eslint-plugin-oxlint` 对齐到 1.80.0，消除脚手架初始 peer warning；
- `vitest.config.ts` 使用显式 `.ts` 导入，并在工具链 TSConfig 中启用 `allowImportingTsExtensions`，消除 Vite 的未来 native config loader warning；
- ESLint 明确忽略 `legacy/**`，防止本地旧工程进入新项目质量门；
- 删除未使用的示例 Counter Store，保留最小 App、Router/Pinia 安装和 App smoke test；
- 用户要求本轮不提交，因此所有第 1 轮改动保持在工作区。

### 实际验证证据

```text
bun install --frozen-lockfile   PASS（368 installs / 405 packages，无变化）
bun run type-check              PASS
bun run test:unit -- --run      PASS（1 file / 1 test）
bun run lint                    PASS（Oxlint + ESLint）
bun run build                   PASS（Vite 8.2.2）
```

生产构建结果：JavaScript 86.54 kB（gzip 33.81 kB），CSS 0.19 kB（gzip 0.14 kB）。旧工程归档也重新逐文件验证：423 个基线文件 0 缺失、0 内容差异。

### 学习目标

- `bun install`、`bun add`、`bun run`、`bun.lock`；
- Vite 只转译、`vue-tsc` 独立类型检查；
- TypeScript project references；
- ESM 配置文件和 `type: module`。

## 第 2 轮：平台基础设施（已完成，2026-08-30）

### 工作项

1. **Vite 配置**
   - `@` 别名；
   - `base` 策略；
   - `public/` 静态资源；
   - dev server 配置。
2. **环境变量**
   - `.env.*` 只暴露 `VITE_*`；
   - `env.d.ts` 声明必需变量；
   - 敏感信息不得进入客户端变量。
3. **HTTP**
   - 引入最新兼容 Axios；
   - 建立 `src/api/http.ts`；
   - 定义错误类型、超时、Token 注入；
   - 不再使用 `app.config.globalProperties.$http`。
4. **Mock**
   - 把 `legacy/vue.config.js` 内的注册、登录、Banner、分类等接口提取出来；
   - 小规模可写 Vite dev plugin；若需要浏览器与测试共享 Mock，评估 MSW；
   - Mock 只能在显式开发开关下启用。
5. **样式与移动端适配**
   - 迁移全局 SCSS；
   - 升级 PostCSS 8 兼容插件；
   - 暂时保持 375 设计稿行为；
   - 建立 375/390/430px 截图基线后再考虑移除 `lib-flexible`。
6. **SVG**
   - 用 Vite 兼容方案替换 `svg-sprite-loader`；
   - 优先保持 `<svg-icon name="...">` 现有调用契约。

### 测试

- Axios 请求头、401/403/404 和网络错误；
- 环境变量缺失时的失败方式；
- Mock 开关；
- SVG 图标 smoke test；
- PostCSS 构建产物包含预期单位。

### 验收

除第 1 轮的四个命令外，还要证明：

- 生产构建没有启用 Mock；
- 代码中没有新增 `process.env` 或 `require.context`；
- HTTP 客户端不依赖 Vue 组件实例。

### 实际落地记录

1. **环境变量**
   - 新增 `.env.example`、`.env.development`、`.env.production` 和 `.env.test`；
   - 只公开 `VITE_API_BASE_URL` 与 `VITE_ENABLE_MOCK`；
   - `env.d.ts` 提供类型，`parseAppEnv` 负责空值和布尔字符串校验；
   - Mock 即使配置为 true，也只允许在 development 生效。
2. **HTTP**
   - 引入 Axios 1.20.0；
   - `createHttpClient` 每次创建独立实例，支持 Token provider 和测试 adapter；
   - 请求头使用 `Authorization: Bearer ...`；
   - Axios 错误统一收窄为不依赖 Router、Toast 或 Vue 实例的 `HttpError`；
   - 不使用 `app.config.globalProperties.$http`。
3. **Mock**
   - 未引入 MSW；当前接口规模用项目内纯处理器 + Vite `configureServer` middleware 即可；
   - `apply: 'serve'` 确保 Mock 插件不进入 build；
   - 迁移注册、登录、Banner、rolling list 和 classify 的最小开发契约；
   - 登录 Token 改为确定性的 `mock-token-<username>`，便于测试。
4. **移动端样式**
   - 引入 Sass 1.103.1、PostCSS 8.5.26、postcss-pxtorem 6.1.0；
   - 继续使用 375 设计宽度对应的 `rootValue: 37.5`；
   - 使用 CSS 根字号替代 `lib-flexible`，并在 540px 封顶；
   - `:root` 和 `html` 不参与 px-to-rem，避免根字号产生 rem 自引用；
   - `node_modules` 不参与转换。
5. **SVG**
   - 不引入 `svg-sprite-loader` 或额外 Vite SVG 插件；
   - 用 `import.meta.glob(..., { eager: true, query: '?raw' })` 加载仓库自有 SVG；
   - `SvgIcon` 支持 `name`、无障碍 label、尺寸，并保留旧 `iconClass`/`className` 作为迁移桥；
   - raw HTML 只来自构建期匹配的仓库自有文件，不接受运行时外部字符串。
6. **迁移期路由占位**
   - 浏览器 smoke 发现第 1 轮空路由表会对 `/` 产生 Router `R0004` warning；
   - 增加一个无 UI、无旧业务依赖的 `/` 占位路由，并用解析测试锁定；
   - 第 3 轮建立真实路由表时删除该占位项。

### 实际验证证据

```text
bun install --frozen-lockfile   PASS
bun run type-check              PASS
bun run test:unit -- --run      PASS（6 files / 17 tests）
bun run lint                    PASS
bun run build                   PASS（Vite 8.2.2）
development Mock smoke          PASS（login/banner 返回 JSON）
production preview Mock check   PASS（/api/login 未返回 Mock）
```

构建产物：25 modules transformed；JavaScript 86.63 kB（gzip 33.84 kB）；CSS 0.62 kB（gzip 0.38 kB）。CSS 产物确认 `body` 的 16px 转为 `.42667rem`，同时 `html` 的 54px 根字号保持 px。

真实浏览器视口基线已覆盖 375×812、390×812、430×812：三个视口均无横向溢出，根字号分别为 37.5px、39px、43px；截图保存在本地 `.omx/evidence/round2/`，不进入 Git。

Bun 阻止了 Sass 间接依赖 `@parcel/watcher` 的一个 postinstall。项目没有将其加入 trusted dependencies：冻结安装、类型检查、单测、开发服务器和生产构建均已通过，因此当前没有执行不必要的第三方生命周期脚本。

第 1 轮已由外部状态提交为 `7150c1b`；用户未要求本轮提交，因此第 2 轮改动保留在工作区。

## 第 3 轮：Router 与 Pinia（已完成，2026-08-30）

### Router

1. 为每个路由模块使用 `RouteRecordRaw`；
2. 用显式模块聚合或 `import.meta.glob('./modules/*.ts', { eager: true })`；
3. 修复 catch-all；
4. 使用 `import.meta.env.BASE_URL`；
5. 生成旧/新路由对账表；
6. 对动态 import 做构建验证。

### Pinia

1. `search` 先迁移：状态少、可验证、含持久化；
2. `cart` 后迁移：先处理不存在的 `products` 根模块依赖；
3. Store 类型从真实领域对象推导，不先写宽泛 `Record<string, any>`；
4. 持久化封装为小型 storage adapter，测试 JSON 损坏、无存储和 SSR/测试环境。

### 验收

- 旧路由 53 个模块每项都有“已迁移/合并/删除并说明”状态；
- 404、重定向、嵌套路由、懒加载有测试；
- Search 与 Cart 的关键行为有 Store 单测；
- 不再安装 Vuex。

### 实际路由落地

- 单独索引并读取本机 `legacy/`，确认 53 个模块实际导出 56 条路由记录；
- `tabbar.js` 是唯一数组导出模块，贡献 `/index`、`/classify`、`/shopCart`、`/mine` 四条；
- 56 条记录无重复 path/name、无缺失旧组件目标；
- `recommend` 的相对 path `classify/recommend` 规范为真实 URL `/classify/recommend`，同时保留原值；
- `orderDetail` 的历史 name `home` 暂时保留，避免无证据破坏命名跳转；
- `legacy-manifest.ts` 保存 source module、旧/新 path、name、legacy view、`meta.index` 和迁移状态；
- `routes.ts` 使用 `import.meta.glob('./modules/*.ts', { eager: true })` 聚合 `legacy.ts` 与 `system.ts`；
- 根路径保持重定向 `/index`，`/nopermission` 保持历史 URL，catch-all 升级为 `/:pathMatch(.*)*`；
- 旧业务页面尚未复制，56 条 URL 统一指向 `MigrationPendingView`，meta 明确标为 `pending-view`；
- 新增真实 `NotFoundView`；第 2 轮临时 `migration-placeholder` 已删除；
- `bun run docs:routes` 从 manifest 生成 [05-route-migration-matrix.md](./05-route-migration-matrix.md)。

### 实际 Pinia 落地

**Search：**旧页面实际执行“读取 `localStorage.searchHistory` → 新关键词前插 → `Set` 去重 → JSON 持久化 → 可清空”。新 `useSearchStore` 保持该契约，并增加空关键词保护、损坏 JSON 和错误数据形状自愈。持久化通过小型 `StorageLike`/JSON adapter 实现，没有增加持久化插件。

**Cart：**全库只有首页调用 `cart/addToCart`，旧 mutation 忽略 payload，只让 `count` 加一。新 `useCartStore` 只迁移计数与 reset。旧 `cartProducts`、`cartTotalPrice`、`addProductToCart` 依赖未注册的 `rootState.products` 和 `products/decrementProductInventory`，且没有调用者，因此明确延期到商品/购物车纵向切片，不伪造 Product Store。

### 实际验证证据

```text
bun install --frozen-lockfile   PASS（400 installs / 447 packages，无变化）
bun run docs:routes             PASS（53 modules / 56 records）
bun run type-check              PASS
bun run test:unit -- --run      PASS（8 files / 27 tests）
bun run lint                    PASS
bun run build                   PASS（37 modules transformed）
```

浏览器 smoke：`/` 重定向 `/index`；`/order/orderDetail` 保留 name `home`；`/classify/recommend` 使用规范 URL；未知深层路径进入 404；控制台 0 error/warn/issue。

构建主包 103.26 kB（gzip 37.23 kB）；迁移占位页和 404 分别生成独立懒加载 chunk。第 2 轮已由外部状态提交为 `2077ac8`，用户未要求本轮提交，因此第 3 轮改动保留在工作区。

## 第 4 轮：公共组件与首个纵向切片（已完成，2026-08-30）

建议迁移顺序：

1. App/layout；
2. SVG Icon、Popup、Picker、ProgressBar、ListScroll、Tabbar；
3. Home；
4. Search；
5. Cart；
6. 与这些页面直接关联的 API、Store 和路由。

### 策略

- 先将 SFC 改成 `<script lang="ts">` 并给 props/emits/ref 加类型；
- 只有重写确实降低复杂度时才改成 `<script setup>`；
- Vant 3 → 4 按实际 API 用量迁移；
- 全量 `app.use(Vant)` 可作为短期过渡，但要记录包体积，后续评估按需导入；
- better-scroll 实例必须保存在 `shallowRef`/局部变量中，并在卸载时销毁；旧 `ListScroll.vue` 中实例作用域不完整，应通过测试修复而不是原样照抄。

### 验收

- 首页 → 搜索 → 加入/查看购物车的首个纵向链路可运行；
- 关键组件有单测；
- 375/390/430px 截图对比通过；
- Vant 控制台警告为 0；
- 切片代码中不新增隐式 `any`。

### 实际公共组件落地

- `App.vue` 成为轻量 Router outlet + `AppTabbar` 布局，Tabbar 只在 `showTabbar` 路由显示；
- Vant 4.10.0 按组件手动注册，当前没有自动导入插件；样式暂时使用 `vant/lib/index.css`，其 197.73 kB（gzip 53.23 kB）成为后续按需样式优化基线；
- `ConfirmDialog` 替代旧 Popup，使用 Teleport、`alertdialog`、`aria-modal`、遮罩点击和类型化 model/emits；
- `AppPicker` 用 Vant 4 Picker/Popup，正确处理 `PickerConfirmEventParams.selectedOptions`；
- `ProgressBar` 使用 clamp/round 和完整 progressbar ARIA；
- `ListScroll` 使用 better-scroll 2.5.1 的 `BScrollInstance`、`shallowRef`、类型化事件和 expose API，并在卸载时 destroy；
- `AppTabbar` 直接读取 Pinia Cart badge，不再依赖 EventBus/Vuex；
- `SvgIcon` 增加本切片需要的 8 个仓库自有 SVG。

### 实际纵向切片

**Home：**新增类型化 `/api/home`，迁移 3 张旧 Banner、4 张商品图、快捷入口、Vant Swipe/CountDown/Tabs、商品卡片、进度、价格和加购。只复制本切片需要的旧资源，没有搬整个 assets。

**Search：**新增类型化 `/api/search/hot`，迁移 7 个旧热搜词、自动 focus、trim/空值校验、Search Pinia history、JSON 持久化和 `ConfirmDialog` 清空历史。搜索页隐藏底部 Tabbar。

**Cart：**第 3 轮计数 Store 扩展为类型化 `CartItem`：商品快照、库存范围内数量、选择/全选、选中数量/合计、删除和 reset。页面迁移 Vant Checkbox/Stepper/Empty，并用 AppPicker 选择支付方式；订单创建明确延期到订单域。

路由 manifest 将 `index`、`search`、`shopCart` 改为 `migrated`，其余 53 条保持 `pending-view`；路由组件映射为三个懒加载页面，生成式对账表同步更新。

### 实际验证证据

```text
bun install --frozen-lockfile   PASS（419 installs / 466 packages，无变化）
bun run docs:routes             PASS（3 migrated / 53 pending-view）
bun run type-check              PASS
bun run test:unit -- --run      PASS（13 files / 35 tests）
bun run lint                    PASS
bun run build                   PASS（402 modules transformed）
```

真实浏览器端到端：Home 加购后 badge=1；Search 输入两端有空格的“空调扇”后持久化为 `["空调扇"]`；返回 Home 后进入 Cart，数量加到 2、合计 ¥250；支付 Picker 选择“微信支付”；编辑 → 删除所选 → ConfirmDialog 后进入空购物车。控制台最终 0 error/warn/issue。

375、390、430px 三个视口均无横向溢出，根字号分别为 37.5、39、43px；Home 截图保存在本地 `.omx/evidence/round4/`。第 3 轮已由外部状态提交为 `3e175b6`，用户未要求本轮提交，因此第 4 轮改动保留在工作区。

生产构建主入口 115.84 kB（gzip 41.13 kB）；Home/Search/Cart JS 分别约 4.24/3.86/4.09 kB，均为独立懒加载 chunk。完整 Vant CSS 为当前已知体积风险，未在本轮引入额外构建插件来掩盖它。

## 第 5 轮：分域迁移剩余页面

按可独立验收的域拆分，每个域单独一轮或子轮：

1. 登录/注册/找回密码；
2. 商品/分类/榜单/秒杀；
3. 订单/物流/申诉；
4. 钱包/消费池；
5. 节点申请与节点页面；
6. 个人中心/地址/设置/消息；
7. 商店详情/关注/帮助与其他低频页。

每个域必须包含：

- 路由；
- DTO/API；
- Store（若有）；
- 组件和页面；
- 单测/交互测试；
- 响应式截图；
- 旧/新差异记录。

不要按“先复制全部 `.vue`，最后统一修类型”的方式迁移；那会制造长期不可运行的中间状态。

### 子轮 5A：商品 / 分类 / 榜单 / 秒杀（已完成，2026-08-30）

迁移路由：`/classify`、`/classify/product`、`/classify/recommend`、`/chainCatSpike`、`/specialSpike`、`/brandSpike`、`/newProductLaunch`、`/premiumRanking`、`/foundGoodGoods`、`/loveShop`。矩阵由 3 migrated / 53 pending 更新为 13 migrated / 43 pending。

**领域层：**扩展 Catalog 类型为 `CatalogProduct`、variant、category/group、campaign、store；新增 `/api/catalog`、开发 Mock 和 `useCatalogStore`。Mock 数据包含 4 分类、8 商品、7 活动和 2 好店。Catalog 选择器按传入 ID 顺序返回数据，避免榜单/活动顺序被底层数组改写。

**共享组件：**新增 `PageHeader`、`ProductCard`、`StoreCard`。ProductCard 统一详情跳转、品牌/标签、价格、排行、进度、关注和加购；StoreCard 统一店铺 Logo、精选图和关注数。复用既有 ListScroll、ProgressBar、SvgIcon、Vant Swipe/Tabs/Popup/Stepper。

**页面：**`CategoryView` 使用双 BetterScroll 分类/内容布局；`RecommendationView` 支持 category query 和分批显示；`ProductDetailView` 支持 gallery、收藏、variant、库存范围内数量和加购/立即购买；`CampaignView` 根据 route name 渲染 flash/ranking/new/discovery/shops 五种形态，取代 7 份重复静态页面模板。

**资源：**选择性复制 12 个旧商品/活动/店铺图片到 `public/mock/catalog/`，没有搬整个 legacy assets。旧 vue-click-outside、DropList、Swiper 旧组件、随机商品图和重复静态卡片没有迁入。

**验证：**分类 → 数码推荐 → 智能手表详情；蓝色表带 ×2 加购后 cart badge=2；优品排行第一名严格按 Campaign ID 为降噪耳机；链猫秒杀提醒、发现好货关注、爱逛好店和新品首发均通过。分类 375px、详情 390px、活动 430px 无横向溢出，控制台 0 error/warn/issue。

```text
bun install --frozen-lockfile   PASS（419 installs / 466 packages，无变化）
bun run docs:routes             PASS（13 migrated / 43 pending-view）
bun run type-check              PASS
bun run test:unit -- --run      PASS（15 files / 41 tests）
bun run lint                    PASS
bun run build                   PASS（429 modules transformed）
```

构建主入口 117.41 kB（gzip 41.50 kB）；Campaign 4.28 kB、ProductDetail 4.99 kB、Recommendation 1.93 kB。Category chunk 为 116.23 kB（gzip 29.79 kB），主要因为 BetterScroll 仅在该懒加载页面引入，这是后续评估原生滚动或更细插件入口的体积基线。Vant 全量 CSS 仍为 197.73 kB（gzip 53.23 kB）。

商品子域已提交为 `7fc8243`。本子域没有迁认证、订单、钱包、节点或个人中心。

### 子轮 5B：登录 / 注册 / 找回密码（实现完成，2026-08-30，待提交）

迁移路由：`/login`、`/register/emailRegister`、`/register/emailRegisterTwo`、`/register/phoneRegister`、`/register/phoneRegisterTwo`、`/mine/forgetPassword`。矩阵由 13 migrated / 43 pending 更新为 19 migrated / 37 pending。

**领域层：**新增 `AuthUser` / `AuthSession` 类型、POST `/api/auth/*`、开发 Mock 和 `useAuthStore`。Token 继续使用旧 key `localStorage.token`，并额外持久化类型化 `authUser`。hydrate 要求两者同时有效，损坏或残缺会话会清除。两步注册草稿只存在内存。开发验证码固定 `123456`；新密码必须 8～64 位且同时包含字母和数字。

**守卫：**`installAuthGuards` 读取 `requiresAuth` / `guestOnly`。未登录访问 `/mine`、`/order`、`/wallet`、`/myFocus` 会带着 `redirect` 去登录页；已登录访问认证页则回到安全的站内路径。`safeRedirectPath` 拒绝 `//` 与外链。`/mine/forgetPassword` 虽在 `/mine` 下，仍是访客页。旧 Router 没有这类守卫，这是有意新增的契约。

**页面：**`AuthShell` 统一页头、Logo 和卡片；邮箱/手机注册共享 `RegisterStartView` 与 `RegisterCompleteView`，由 route name 区分渠道。旧登录页的登录/注册处理是空函数，新实现补全了可运行闭环，没有复刻空按钮，也没有迁「TOP 金服」第三方入口。

**Mock：**POST `/api/auth/login|send-code|register|reset-password` 为页面契约；旧 GET `/api/login`、`/api/register` 仍保留。演示账号：`demo@example.com` / `Password123`、`13800138000` / `Password123`；旧 `zhangsan` / `123456`、`tom` / `123` 可继续登录。Vite Mock 插件现在读取 POST JSON body。

**验证：**质量门 2026-08-30 通过。本次文档同步没有重跑 375/390/430px 浏览器端到端，认证页视觉回归仍待补。本子域没有迁订单、钱包、节点、个人中心、改密页或 HTTP 401 自动跳转。

```text
bun run type-check              PASS
bun run test:unit -- --run      PASS（19 files / 54 tests）
bun run lint                    PASS
bun run build-only              PASS（450 modules transformed）
```

构建主入口 123.90 kB（gzip 43.95 kB）。认证懒加载 chunk：Login 2.51 kB、RegisterStart 2.90 kB、RegisterComplete 2.99 kB、ForgotPassword 3.52 kB。Vant 全量 CSS 仍约 199 kB（gzip 53.64 kB）。

活进度和下一个订单子域提示词见 [06-current-progress.md](./06-current-progress.md)。

## 第 6 轮：类型收紧与质量门禁

### TypeScript

- 开启并保持 `strict`；
- 禁止用全局 `any` 消音；
- 外部响应先以 `unknown` 进入，在 API 边界验证/收窄；
- 为 `RouteMeta`、环境变量、资源导入补充声明；
- 删除不必要的 `@ts-ignore`，必要例外必须有问题链接或删除条件。

### 测试与 CI

- Vitest：Store、API、composable、关键组件；
- Vue Test Utils：props/emits、Vant 交互包装；
- 可选 MSW：API Mock 在开发和测试中复用；
- Playwright/Cypress 二选一做核心 E2E；
- CI 使用 `bun ci` 或 `bun install --frozen-lockfile`；
- CI 顺序：install → type-check → lint → unit → build → e2e。

### 验收

所有门禁可在干净环境重复执行；无未说明的跳过测试；锁文件无漂移。

## 第 7 轮：切换、性能与清理

### 工作项

- 校验 `base`、history fallback、CDN/静态资源路径；
- 比较首屏资源、路由 chunk、图片体积和关键 Web Vitals；
- 删除临时兼容层、无用依赖、旧注释和废弃类型；
- 确认 `legacy/` 不参与构建、测试和发布；
- 编写发布与回滚说明；
- 更新 README 与维护手册。

### 最终验收

```bash
rm -rf node_modules dist coverage
bun ci
bun run type-check
bun run lint
bun run test:unit -- --run
bun run build
```

然后在部署等价环境执行 smoke/E2E，确认刷新深层路由、静态资源和 API base URL 正确。

## 5. 每轮依赖升级规约

1. 查询当日 stable dist-tag 和 peer dependencies；
2. 一次只升级一个工具链簇，例如 Vue/Vue Router/Pinia 或 Vite/plugin-vue/Vitest；
3. 生成/更新 `bun.lock`；
4. 运行完整门禁；
5. 阅读实际 diff，不提交无关升级；
6. 在本文件或版本证据文档记录“为什么升级、验证了什么、如何回滚”。

生产与 CI 禁止：

```bash
bun update --latest
```

可以在临时分支/临时目录中用它发现候选升级，但不能跳过兼容验证。
