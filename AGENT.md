# Spec-Kit Workflow v2.2 (Copy-Paste Ready)

## 🚫 严格执行规则 (最高优先级)

1. 命令格式: `/speckit.{spec|plan|tasks|implement} {feature}`
2. feature = 命令后参数 (必填，如 "kids-bird-globe")
3. 路径: `specs/{feature}/{spec.md|plan.md|tasks.md|done.md}`
4. 自动: `mkdir -p specs/{feature}`
5. 输出: **只写文件**，chat回复 `✅ specs/{feature}/{stage}.md 更新完毕`
6. **绝无代码直到 `/speckit.implement`**

## 📁 文件 → 阶段映射

`/speckit.spec` → `specs/{feature}/spec.md`
`/speckit.plan` → `specs/{feature}/plan.md`
`/speckit.tasks` → `specs/{feature}/tasks.md`
`/speckit.implement` → `src/` 代码

## 🎯 每个阶段输入/输出

### 1. `/speckit.spec {feature}`

**Action**: Create/Update `specs/{feature}/spec.md`
**Input**: 用户新需求/chat上下文
**Stop**: 更新spec后停止

### 2. `/speckit.plan {feature}`

**Input**: `specs/{feature}/spec.md`
**Action**: Create `specs/{feature}/plan.md` (技术方案)
**Stop**: 方案后停止

### 3. `/speckit.tasks {feature}`

**Input**: `specs/{feature}/plan.md`
**Action**: Create `specs/{feature}/tasks.md` (- 清单)
**Stop**: tasks后停止

### 4. `/speckit.implement {feature}`

**Input**: `specs/{feature}/spec.md + plan.md + tasks.md`
**Action**: 实现代码 → `src/`

## 示例流程

- specs/kids-bird-globe/spec.md  ✅ created
- specs/kids-bird-globe/plan.md  ✅ created
- specs/kids-bird-globe/tasks.md  ✅ created
- speckit.implement kids-bird-globe  ✅ ready to execute
