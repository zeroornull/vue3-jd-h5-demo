# 第 0 轮：旧项目基线与迁移风险

## 1. 基线结论

旧工程是一个约 2020—2021 年风格的 Vue 3 早期项目：

- 构建：Vue CLI 4.5 / Webpack / Babel。
- 语言：JavaScript，源代码内没有 TypeScript 文件。
- UI：Vant 3，全量注册并全量加载样式。
- 路由：Vue Router 4 早期版本，53 个拆分的 JavaScript 路由模块。
- 状态：Vuex 4，当前可见模块主要是 `cart` 与 `search`。
- HTTP：Axios 被安装到 `app.config.globalProperties.$http`。
- 移动端适配：`lib-flexible` + `postcss-pxtorem`，设计根值为 37.5。
- SVG：Webpack 的 `svg-sprite-loader` + `require.context`。
- Mock：一部分 MockJS 代码在 `src/mock/`，另一部分开发接口直接写在 `vue.config.js` 的 dev server 钩子中。
- 组件风格：68 个 Vue SFC 都能检索到 `export default {}`，迁移不能假定它们已经是 `<script setup>`。

## 2. 数量盘点

盘点对象现在位于 `legacy/`。

| 项目 | 数量 | 说明 |
| --- | ---: | --- |
| `.vue` 文件 | 68 | 页面和公共组件 |
| `.js` 文件 | 66 | 入口、Router、Vuex、插件、工具等 |
| Router 模块 | 53 | `legacy/src/router/modules/*.js` |
| `.scss` 文件 | 5 | 多数样式也直接写在 SFC 中 |
| PNG/JPG/JPEG/SVG 等资源 | 268 | 移动端图片和 SVG 资源较重 |
| `require.context` | 3 处 | Router、全局组件、SVG 自动注册 |
| `process.env` | 3 处 | Router base、Vuex strict、Axios base URL |
| 使用 `vue-click-outside` 的页面 | 7 | 需要验证 Vue 3/TS 兼容性或移除 |

这些数据是迁移前的本地源文件扫描结果。知识图谱对 `src/views` 记录了 6 个局部解析缺口，因此数量型结论同时用文件系统扫描校验，而不是只依赖图索引。

## 3. 旧依赖与目标处理方式

| 旧依赖/机制 | 旧版本范围 | 目标处理 |
| --- | --- | --- |
| `@vue/cli-service` | `~4.5.0` | 删除，改为 Vite 8 |
| Babel Vue CLI preset | `~4.5.0` | 删除；Vite 负责语法转换，`vue-tsc` 负责类型检查 |
| Vue | `^3.0.0` | 升到最新兼容 Vue 3.5 稳定版 |
| Vue Router | `^4.0.0-0` | 升到 Router 5，并修复通配路由语法与类型 |
| Vuex | `^4.0.0-0` | 迁移到 Pinia 4；Vuex 处于维护模式 |
| Vant | `^3.0.0` | 升到 Vant 4；逐项处理 Toast、组件 API 和样式差异 |
| Axios 全局属性 | `^1.7.4` | 升级 Axios，导出显式 `http` 客户端与类型化 API，不再依赖 `$http` 魔法属性 |
| `svg-sprite-loader` | `^5.2.1` | 改为 Vite 兼容 SVG 方案；先保持现有 `<svg-icon>` 契约 |
| `require.context` | Webpack 专有 | 改为 `import.meta.glob` 或显式导入 |
| `process.env.*` | Vue CLI 约定 | 改为 `import.meta.env.*`，公开变量统一使用 `VITE_` 前缀 |
| `vue.config.js` dev Mock | Vue CLI 专有 | 提取为独立 Mock 模块；建议在第 2 轮评估 MSW |
| `lib-flexible` | `^0.3.2` | 首先保行为，再用现代 CSS/视觉回归决定是否删除 |
| `postcss-pxtorem` | `^5.1.1` | 升级到兼容 PostCSS 8 的版本并建立移动端视觉基线 |
| `vue-click-outside` | `^1.1.0` | 不直接照搬；优先用本地 Vue 3 指令/组合式函数替代，避免保留陈旧全局依赖 |
| `mitt` | `^2.1.0` | 旧代码未检索到实际使用；确认后删除或只在明确事件场景保留 |

## 4. 关键迁移风险

### 4.1 Vue CLI 到 Vite 不是配置文件改名

以下能力必须逐一重建：

1. `vue.config.js` 的 `publicPath: './'` → `vite.config.ts` 的 `base`。
2. `chainWebpack` SVG loader → Vite 插件或原生 SVG 导入策略。
3. dev server `before(app)` → 独立 Mock 服务/插件。
4. `require.context` → `import.meta.glob`。
5. `process.env.BASE_URL` / `VUE_APP_*` → `import.meta.env.BASE_URL` / `VITE_*`。

### 4.2 Router 升级风险

旧项目的 404 路由使用：

```js
{ path: '/*', name: '404' }
```

现代 Router 应使用可命名的 catch-all：

```ts
{ path: '/:pathMatch(.*)*', name: 'not-found' }
```

同时，53 个路由模块由 Webpack 动态加载。迁移时必须建立“旧路由清单 → 新路由清单”对账，防止静默漏页。

### 4.3 Vuex 到 Pinia 是行为迁移

`cart` 模块引用了 `rootState.products` 和 `products/decrementProductInventory`，但当前 Store 入口只注册了 `cart`、`search`。这表示旧代码可能存在未完成、已失效或依赖遗漏的逻辑。不能机械翻译成 Pinia；应先用测试定义当前期望，再决定修复还是删除。

### 4.4 Axios 插件存在隐式耦合

旧代码通过 `$http` 注入所有组件，并在拦截器里直接操作 Router、Toast 与 `localStorage`。现代化目标是：

- `http.ts` 只负责请求、响应和通用错误规范化；
- 鉴权跳转通过可测试回调或应用层服务处理；
- API 层导出有输入/输出类型的函数；
- 组件显式 import API，不依赖全局属性类型增强。

### 4.5 Vant 3 到 4 有 API 差异

例如旧代码使用 `Toast(...)`。Vant 4 推荐的函数式调用是 `showToast(...)`。这类差异应通过代码搜索逐项迁移，而不是只升级 `package.json`。

### 4.6 旧源文件已有语法/尾部内容异常信号

知识图谱在 5 个节点页面末尾发现 `</style>` 后还有单独的 `]`，另有一个 SCSS 局部解析异常。它们可能是历史残留，也可能影响构建。第 1 轮不修改这些旧文件；进入相关页面迁移轮次时，先加回归用例或明确删除理由。

涉及的旧页面：

- `legacy/src/views/node/areaNode.vue`
- `legacy/src/views/node/cityNode.vue`
- `legacy/src/views/node/industryNode.vue`
- `legacy/src/views/node/stateNode.vue`
- `legacy/src/views/node/superNode.vue`

## 5. 行为冻结清单

在迁移业务代码前，至少保存以下可比较证据：

- [ ] 主要路由 URL 清单和页面截图。
- [ ] 登录成功、失败、Token 过期、未登录跳转行为。
- [ ] 首页、搜索、购物车、订单、钱包主要交互。
- [ ] 375px、390px、430px 三个视口的关键页面截图。
- [ ] 关键接口的请求方法、参数、响应和错误状态。
- [ ] 现有 Mock 接口行为。
- [ ] SVG 图标名称与使用位置。
- [ ] 生产构建基础路径和静态资源 URL。

如果旧工程无法在当前 Node/Bun 环境运行，应把“无法运行的命令、错误日志、可运行的历史 Node 版本”记录下来，而不是假装已有可用基线。

## 6. 归档规则

根 `.gitignore` 包含：

```gitignore
/legacy/
```

验证命令：

```bash
git check-ignore -v legacy/package.json legacy/src/main.js
```

预期两条路径都由根 `.gitignore` 的 `/legacy/` 命中。
