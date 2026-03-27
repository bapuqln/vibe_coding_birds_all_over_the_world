# Spec-Kit + gstack Integration Guide

本项目使用 **spec-kit** (v0.3.0) 管理需求 → 方案 → 任务 → 实现的全流程，同时引入 **gstack** (`gk`) 作为 AI 辅助层，在关键阶段提供代码生成、审查和质量保障。

## 架构概览

```
┌─────────────────────────────────────────────────────────┐
│                    Cursor IDE                           │
│                                                         │
│  ┌──────────────┐    ┌──────────────┐                   │
│  │  spec-kit    │    │   gstack     │                   │
│  │  /speckit.*  │───▶│   gk /...    │                   │
│  │  (规范驱动)   │    │  (AI 辅助)   │                   │
│  └──────┬───────┘    └──────┬───────┘                   │
│         │                   │                           │
│         ▼                   ▼                           │
│  specs/{feature}/     src/ (代码产出)                    │
│  ├── spec.md                                            │
│  ├── plan.md                                            │
│  └── tasks.md                                           │
└─────────────────────────────────────────────────────────┘
```

## 阶段衔接

### Stage 1: 需求定义 `/speckit.spec`

```bash
# 在 Cursor 中执行 spec-kit 命令
/speckit.spec kids-bird-globe
```

产出 `specs/kids-bird-globe/spec.md`。此阶段 gstack 不介入。

### Stage 2: 技术方案 `/speckit.plan`

```bash
# 1. spec-kit 生成方案
/speckit.plan kids-bird-globe

# 2. (可选) 用 gstack 对方案做 AI 审查
gk /plan --context specs/kids-bird-globe/plan.md
```

gstack 读取 `plan.md`，输出补充建议（架构风险、遗漏边界等），你可以手动合入 `plan.md`。

### Stage 3: 任务拆解 `/speckit.tasks`

```bash
/speckit.tasks kids-bird-globe
```

产出 `specs/kids-bird-globe/tasks.md`。gstack 不介入。

### Stage 4: 实现 `/speckit.implement`

这是 gstack 最核心的介入点：

```bash
# 1. spec-kit 开始实现（Cursor Agent 执行）
/speckit.implement kids-bird-globe

# 2. 实现过程中，可随时用 gstack 生成代码片段
gk /implement --task "T-2.1: Create MigrationJourneyPanel component"

# 3. 实现完成后，用 gstack 做代码审查
git add .
gk /review
```

### Stage 5: 质量验证

```bash
# gstack QA 检查
gk /qa

# 包含：
# - TypeScript 编译检查
# - Vite 构建验证
# - 代码规范扫描
```

### Stage 6: 发布准备

```bash
gk /ship
# 最终 pre-merge 验证
```

## 触发时机速查表

| spec-kit 阶段          | gstack 命令          | 触发时机           | 必要性 |
|------------------------|---------------------|--------------------|--------|
| `/speckit.spec`        | —                   | —                  | —      |
| `/speckit.plan`        | `gk /plan`          | plan.md 生成后     | 可选   |
| `/speckit.tasks`       | —                   | —                  | —      |
| `/speckit.implement`   | `gk /implement`     | 实现过程中         | 可选   |
| 代码提交前             | `gk /review`        | `git add .` 之后   | 推荐   |
| 实现完成后             | `gk /qa`            | 所有任务完成后     | 推荐   |
| 合并前                 | `gk /ship`          | PR 创建前          | 可选   |

## 终端命令模板

### 完整工作流（单次迭代）

```bash
# 0. 确认 gk 已安装
gk version

# 1. spec-kit 流程（在 Cursor 中）
/speckit.spec kids-bird-globe
/speckit.plan kids-bird-globe

# 2. gstack 方案审查
gk /plan --context specs/kids-bird-globe/plan.md

# 3. spec-kit 任务拆解 + 实现
/speckit.tasks kids-bird-globe
/speckit.implement kids-bird-globe

# 4. gstack 代码审查
git add .
gk /review

# 5. gstack QA
gk /qa
```

### 快速审查（已有代码变更时）

```bash
git add .
gk /review
# 查看审查结果，修复问题后：
gk /qa
```

## 配置文件

- `ai/gstack.yaml` — gstack 在本项目的行为配置（安全护栏、技术栈、命令默认值）
- `ai/README.md` — AI 工作流概述
- `ai/setup-agents.sh` — 一键环境检查与初始化脚本

## 注意事项

1. **spec-kit 是主驱动**：gstack 是辅助层，不替代 spec-kit 的规范流程
2. **人工确认**：gstack 生成的代码建议需要人工审查后再合入
3. **安全护栏**：`ai/gstack.yaml` 中定义了 gstack 不能自动修改的文件列表
4. **增量叠加**：所有 `ai/` 目录内容不影响 spec-kit 的 `.specify/` 和 `.cursor/commands/`
