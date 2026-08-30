# vue3-jd-h5 现代化迁移文档

> 文档基线日期：2026-08-29；进度快照：2026-08-30
>
> 目标：将旧工程逐轮迁移为 **Bun + TypeScript + 最新兼容稳定版 Vue 生态**，每一轮都可独立验收、暂停和回滚。

## 1. 当前仓库状态

- 旧工程已经完整移动到根目录 `legacy/`。
- 根目录 `.gitignore` 已加入 `/legacy/`，因此旧工程只是**本机迁移参考副本**，不会被 Git 跟踪或提交。
- 根目录已经完成 Bun + TypeScript + Vue + Vite 现代工程初始化，并生成 `bun.lock`。
- 当前第 0–7 轮路线已落地。第 7 轮切换、性能与清理已实现，仍在工作区未提交。
- 56 条旧模块路由全部为 migrated，pending-view 为 0。
- 活进度单见 [06-current-progress.md](./06-current-progress.md)。

> [!WARNING]
> `legacy/` 被忽略后，新克隆仓库不会包含它，而且当前新仓库的提交历史已经重写为单根提交。需要长期保留旧项目时，必须单独备份本机 `legacy/`；不能依赖当前远端仓库恢复它。

## 2. 文档导航

| 文档 | 用途 |
| --- | --- |
| [00-legacy-baseline.md](./00-legacy-baseline.md) | 旧项目技术基线、数量盘点、迁移风险和行为冻结清单 |
| [01-migration-roadmap.md](./01-migration-roadmap.md) | 目标技术栈、版本策略、逐轮实施方案和每轮验收标准 |
| [02-learning-guide.md](./02-learning-guide.md) | Bun、Vite、TypeScript、Vue Router、Pinia、测试体系的学习路径与示例 |
| [03-round-playbook.md](./03-round-playbook.md) | 多轮协作规约、每轮操作模板、检查清单、回滚与交接模板 |
| [04-version-evidence-and-sources.md](./04-version-evidence-and-sources.md) | 版本快照、官方资料、兼容性实测结果和已知限制 |
| [05-route-migration-matrix.md](./05-route-migration-matrix.md) | 53 个旧路由模块、56 条 URL/name/view 契约和 Store 使用对账 |
| [06-current-progress.md](./06-current-progress.md) | 当前进度、已迁/待迁边界、质量门和下一轮提示词 |
| [07-release-and-rollback.md](./07-release-and-rollback.md) | 发布契约、SPA fallback、preview smoke 与回滚 |

## 3. 迁移轮次总览

| 轮次 | 主题 | 状态 | 主要产物 | 退出条件 |
| --- | --- | --- | --- | --- |
| 0 | 盘点、归档、文档化 | **已完成** | `legacy/`、根级 `.gitignore`、本目录文档 | 归档存在、忽略生效、路线可执行 |
| 1 | 初始化现代工程骨架 | **已完成** | Bun 锁文件、Vue/Vite/TS 配置、空壳应用 | 类型检查、单测、Lint、构建全部通过 |
| 2 | 迁移平台基础设施 | **已完成** | 环境变量、样式、SVG、Mock、HTTP 客户端 | 基础设施测试通过，不迁业务页 |
| 3 | 迁移路由与状态 | **已完成** | Router 5、Pinia、路由 manifest、持久化 | 56 条路由清单和有效 Store 行为对齐 |
| 4 | 迁移公共组件与首个纵向切片 | **已完成** | 布局、Tabbar、Home/Search/Cart 首批页面 | Home→Search→Cart 端到端链路通过 |
| 5 | 分域迁移剩余页面 | **已完成** | 56 条 migrated 路由 | 当前 56 migrated / 0 pending |
| 6 | 类型收紧与质量门禁 | **已完成** | unknown API 边界、组件测试、GitHub Actions | `any` 受控，质量命令稳定通过 |
| 7 | 切换、性能与清理 | **实现完成，待提交** | SPA preview、按需 Vant CSS、发布说明、smoke | 新应用可预览，回滚说明完整 |

## 4. “最新依赖”的项目定义

本项目采用：

> **在同一时间点能够共同通过安装、类型检查、测试、Lint 和生产构建的最新稳定兼容组合。**

不采用：

> 对所有依赖无差别执行 `bun update --latest`，然后把无法工作的组合称为“已升级”。

原因是 2026-08-29 的实际验证中：官方 `create-vue` 生成组合使用 TypeScript `~6.0.0`，可以在 Bun 1.4.0 下完整通过；无约束升级到 TypeScript 7.0.2 后，`vue-tsc` 3.3.11 会出现 `Failed to locate tsc module path from shim`。因此 TypeScript 7 必须作为单独升级门处理。

完整证据见 [04-version-evidence-and-sources.md](./04-version-evidence-and-sources.md)。

## 5. 下一轮建议输入

下一次对话可以直接使用：

```text
迁移 7 轮目标已经完成。后续工作请作为独立变更，不要再编号为第 8 轮。完整边界见 [06-current-progress.md](./06-current-progress.md)。
```
