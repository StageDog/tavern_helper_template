# 酒馆助手前端界面或脚本编写

@.cursor/rules/项目基本概念.mdc
@.cursor/rules/mcp.mdc
@.cursor/rules/酒馆变量.mdc
@.cursor/rules/酒馆助手接口.mdc
@.cursor/rules/前端界面.mdc
@.cursor/rules/脚本.mdc
@.cursor/rules/mvu变量框架.mdc
@.cursor/rules/mvu角色卡.mdc

# Codex 脚本打包与发布指引

当任务涉及脚本构建、`dist`、脚本 JSON 打包、`tavern-helper-script.config.json`、`pnpm` 安装/构建问题、`.github/workflows` 发布流程时，先阅读：

@.codex/skills/tavern-helper-script/SKILL.md

关键避坑：

- 先用 `CI=true pnpm install --frozen-lockfile` 明确恢复依赖，再运行构建。
- 使用 `pnpm build:js` 编译脚本 JS；只有明确需要 schema dump 或 tavern_sync 副作用时才用 `pnpm build:all`。
- 使用 `pnpm package:script` 生成 Tavern Helper `type: "script"` JSON。
- 不要依赖 `package.json.pnpm.onlyBuiltDependencies`；pnpm 构建脚本许可放在 `pnpm-workspace.yaml`。
- 如果 registry 出现 `ECONNREFUSED`、`UND_ERR_DESTROYED` 或长时间逐包重试，停止命令并请求允许联网重跑，不要等待重试耗时。
