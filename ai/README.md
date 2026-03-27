# AI Agent Workflow — kids-bird-globe

本目录包含项目的 AI 辅助开发配置，将 **spec-kit** 规范驱动流程与 **gstack** (`gk`) AI 代理工具集成。

## 目录结构

```
ai/
├── README.md           ← 本文件
├── INTEGRATION.md      ← spec-kit 与 gstack 的详细衔接指南
├── gstack.yaml         ← gstack 行为配置（安全护栏、技术栈、命令默认值）
└── setup-agents.sh     ← 环境检查与初始化脚本
```

## 快速开始

```bash
# 1. 运行环境检查
chmod +x ai/setup-agents.sh
./ai/setup-agents.sh

# 2. 如果 gk 未安装，按提示执行：
curl -fsSL http://get.gstack.io/please | sh
gk version

# 3. 开始使用
# 在 Cursor 中用 spec-kit 命令驱动流程，
# 在终端中用 gk 命令辅助审查和生成。
```

## 核心理念

### spec-kit 负责"做什么"

- `/speckit.spec` — 定义需求
- `/speckit.plan` — 设计方案
- `/speckit.tasks` — 拆解任务
- `/speckit.implement` — 执行实现

### gstack 负责"AI 怎么帮"

- `gk /plan` — AI 审查技术方案
- `gk /review` — AI 代码审查
- `gk /qa` — 自动化质量检查
- `gk /ship` — 发布前验证

### 角色映射

| gstack 角色 | 对应阶段                    | 职责               |
|-------------|----------------------------|--------------------|
| CEO         | `/speckit.spec`            | 产品视角审查需求    |
| ENG         | `/speckit.plan` + implement | 架构设计与实现     |
| QA          | `gk /review` + `gk /qa`   | 代码审查与质量保障  |
| SHIP        | `gk /ship`                 | 发布验证           |

## 详细文档

- 完整的阶段衔接流程见 [INTEGRATION.md](./INTEGRATION.md)
- gstack 行为配置见 [gstack.yaml](./gstack.yaml)
