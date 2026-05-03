# 通用交互规则

- 写入或创建长文件时，将内容分成小段、分多次写入，避免单次生成内容过长导致网络超时
- 优先使用 multi_replace_file_content 进行局部编辑，而非整文件重写

## 酒馆助手前端界面或脚本编写

@.cursor/rules/项目基本概念.mdc
@.cursor/rules/mcp.mdc
@.cursor/rules/酒馆变量.mdc
@.cursor/rules/酒馆助手接口.mdc
@.cursor/rules/前端界面.mdc
@.cursor/rules/脚本.mdc
@.cursor/rules/mvu变量框架.mdc
@.cursor/rules/mvu角色卡.mdc

## EJS 提示词模板

- 世界书条目支持 EJS 模板语法（`<%_ ... _%>`），可在发送前动态生成内容
- **EJS 参考文档**：`AA提示词模板及其它变量/ejsdocs/reference.md`,`AA提示词模板及其它变量/ejsdocs/features.md`

## 世界书条目 uid 规则

- 世界书条目的 `uid` 必须按条目在 YAML 中出现的顺序从 0 开始逐个递增分配（0, 1, 2, 3...）
- 新增条目时，uid 接续当前最大值 +1
- 不可跳号、不可重复
- 原因：同步模式会尊重定义的 uid，直接打包模式会按条目顺序从 0 强制递增分配。按顺序分配 uid 是唯一能让两种模式结果一致的方式

## 文风凝练

- 蒸馏过程参考文档：`\`示例\文风凝练提示词.txt`
-
