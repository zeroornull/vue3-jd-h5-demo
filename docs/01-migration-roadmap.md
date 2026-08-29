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

## 第 2 轮：平台基础设施

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

## 第 3 轮：Router 与 Pinia

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

## 第 4 轮：公共组件与首个纵向切片

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
