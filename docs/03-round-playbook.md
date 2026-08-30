# 多轮迁移执行手册

## 1. 为什么必须分轮

本项目同时跨越 Vue CLI → Vite、JS → TS、Vuex → Pinia、Router 早期版 → Router 5、Vant 3 → 4。一次性迁移会让错误来源无法区分。

每轮必须满足：

- 目标单一；
- 变更可审查；
- 有进入条件；
- 有退出条件；
- 有新鲜验证输出；
- 有明确未完成项；
- 能独立回滚。

## 2. 每轮开始模板

```markdown
## 第 N 轮：<名称>

### 目标
- 本轮最终要得到什么可见结果？

### 范围
- 会修改哪些目录/模块？

### 非范围
- 本轮明确不做什么？

### 进入条件
- 上一轮哪些命令已经通过？
- 是否存在未解决 blocker？

### 风险
- 哪些旧行为容易回归？

### 验证
- 最小测试是什么？
- 完整门禁是什么？
```

## 3. 标准执行顺序

1. 阅读本轮路线和上轮交接；
2. 获取干净 Git 状态并理解已有用户改动；
3. 运行进入条件中的测试；
4. 为待迁行为添加/确认回归证据；
5. 做最小实现；
6. 运行目标测试；
7. 运行完整门禁；
8. 检查依赖、锁文件和 Git diff；
9. 更新轮次状态、决策、风险和学习记录；
10. 在退出条件全部满足时结束本轮。

不要在测试失败后直接进入下一轮。

## 4. 标准验证矩阵

| 变更类型 | 最小验证 | 完整验证 |
| --- | --- | --- |
| 配置/依赖 | 安装 + 相关命令 | type-check + lint + unit + build |
| 纯 TS 工具 | 目标单测 + type-check | lint + unit + build |
| Router | 路由测试 + 构建 | 全部门禁 + 深层 URL smoke |
| Pinia | Store 单测 | 全部门禁 + 页面集成 |
| Vue 组件 | 组件测试 | 全部门禁 + 响应式截图 |
| Axios/API | Mock 请求测试 | 全部门禁 + 开发/生产开关验证 |
| 样式/移动端 | 目标视口截图 | build + 375/390/430px 对比 |
| 发布配置 | build/preview | 部署等价 smoke + 回滚演练 |

统一质量命令：

```bash
bun install --frozen-lockfile
bun run type-check
bun run lint
bun run test:unit -- --run
bun run build
```

如果 package scripts 的名字在第 1 轮有调整，应同步更新所有文档，避免文档与代码分叉。

## 5. 旧/新对账表模板

迁移页面、路由或接口时使用：

| 旧项 | 新项 | 状态 | 行为差异 | 测试/证据 | 决策 |
| --- | --- | --- | --- | --- | --- |
| `/search` | `/search` | 已迁移 | 无 | `search.route.spec.ts` | 保持 |
| `/old-page` | — | 已删除 | 页面下线 | 产品说明/无引用证据 | 删除 |

允许的状态只有：

- 待迁移；
- 迁移中；
- 已迁移；
- 合并；
- 删除（必须说明）；
- 阻塞（必须说明）。

不能用“差不多完成”作为状态。

## 6. 依赖变更模板

```markdown
### 依赖变更：<package>

- 旧版本：
- 新版本：
- 变更原因：
- 官方迁移资料：
- peer/engine 约束：
- 锁文件变化：
- 验证命令与结果：
- 已知风险：
- 回滚方式：
```

一次只处理一个相关工具链簇。示例：

- Vue + compiler-sfc + Router + Pinia；
- Vite + plugin-vue + Vitest；
- ESLint + eslint-plugin-vue + TS config；
- Vant 及其导入策略。

## 7. 本轮交接模板

```markdown
## 第 N 轮交接

### 已完成
- ...

### 验证证据
- `bun run type-check`: PASS
- `bun run test:unit -- --run`: PASS（X files / Y tests）
- `bun run lint`: PASS
- `bun run build`: PASS

### 关键决策
- ...

### 未完成/风险
- ...

### 下一轮进入条件
- ...

### 推荐下一轮范围
- ...
```

## 8. 回滚规则

### 代码回滚

- 每轮保持独立提交；
- 不用删除 `legacy/` 解决新工程问题；
- 回滚本轮时不回滚用户的其他并行改动；
- 若锁文件变更导致问题，代码和 `bun.lock` 必须一起回滚。

### 依赖回滚

1. 恢复 `package.json` 和 `bun.lock`；
2. 删除 `node_modules`；
3. `bun install --frozen-lockfile`；
4. 重新运行门禁。

### 行为回滚

如果新实现与旧行为不一致：

1. 先保留失败测试/截图；
2. 判断是历史行为必须保留，还是批准的有意变化；
3. 有意变化写入对账表；
4. 未批准变化回滚实现，而不是修改测试迎合代码。

## 9. 多轮对话提示词

### 第 1 轮

```text
执行 docs/01-migration-roadmap.md 第 1 轮。只初始化 Bun + Vue + TypeScript 现代骨架，保留 docs 和 /legacy/ ignore，不迁任何业务代码。完成后运行 type-check、unit、lint、build，并更新轮次状态与验证证据。
```

### 第 2 轮

```text
执行 docs/01-migration-roadmap.md 第 2 轮。迁移 Vite 环境变量、Axios 基础客户端、Mock、移动端样式和 SVG 基础设施；不要迁业务页面或 Vuex。先补基础设施测试，完成后运行全部门禁并更新文档。
```

### 第 3 轮

```text
执行 docs/01-migration-roadmap.md 第 3 轮。迁移 Router 和 Pinia，建立 53 个旧路由模块对账表；先处理 search store，再处理 cart 的缺失 products 依赖。不要开始大批页面迁移。运行全部门禁并更新文档。
```

### 第 4 轮及以后

```text
按 docs/01-migration-roadmap.md 迁移 <业务域>，范围只包含这个纵向切片的路由、API、Store、组件、页面和测试。对照 legacy 记录有意差异，运行 type-check、lint、unit、build 和目标视口截图验证，更新交接文档后停止。
```

当前下一子域是钱包。可直接使用 [06-current-progress.md](./06-current-progress.md) 里的提示词，不要把未提交的个人中心改动和钱包改动混进同一个提交。

## 10. 完成定义

一轮只有在以下全部成立时才算完成：

- 计划内功能已经实现；
- 计划外功能没有偷偷混入；
- 新鲜验证全部通过，或无法运行的项已明确说明原因和替代证据；
- 文档和实际命令一致；
- 没有未说明的测试跳过、类型忽略或依赖漂移；
- 下一轮进入条件清楚；
- Git diff 可审查、可回滚。
