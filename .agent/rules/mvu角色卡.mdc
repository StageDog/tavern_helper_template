---
description: 当用户输入中明确提及 MVU 时, 你应该参考本文件
alwaysApply: false
---
# MVU 角色卡文件夹

MVU 角色卡文件夹提供了一种存储酒馆角色卡内容的文件结构:

- `角色卡/脚本/*/` 中是角色卡的所有脚本项目
- `角色卡/界面/*/` 中是角色卡的所有前端界面项目
- `角色卡/世界书/*/` 中是角色卡的世界书条目, 即角色卡的设定提示词, 编写角色卡其他内容时需要参考它来了解角色世界设定
- `角色卡/schema.ts` 中是用 zod 4 库书写的角色卡 MVU 变量结构定义
  - 提供给脚本、前端界面导入使用
  - 会在 `pnpm build` 或 `pnpm watch` 时生成对应的 json schema 文件 `角色卡/schema.json`, 便于编写变量初始值文件 initvar.yaml `# yaml-language-server: $schema=schema文件路径`
- `角色卡/界面/store.ts` 中是 pinia 预先写好的获取角色卡消息楼层 MVU 变量方式, 提供给所有前端界面导入使用

当玩家要求编写 MVU 角色卡的脚本、前端界面时, 除了参考`初始模板/脚本`或`初始模板/前端界面`外, 你还应该参考`初始模板/角色卡`中的脚本和前端界面模板.

**要区分单独的脚本、前端界面和为 MVU 角色卡增补脚本、前端界面, 如果用户只是想要编写单独的脚本、前端界面, 则不应参考这个文件.**

## MVU 变量结构

MVU 使用 zod 4 库书写变量结构定义, 这对应于`角色卡/schema.ts`, 例如:

```ts
export const Schema = z.object({
  好感度: z.coerce.number().transform(value => _.clamp(value, 0, 100)),
});
```

你应该要求用户提供变量结构文件或者自行编写, 它应该遵循以下要求:

```yaml
rtask: Explorer requests to design the zod schema of variables which records the world status, you should reappear an instance of it using zod 4.x inside `<context>`, which is the main content of your reply
rule:
  - libraries: "`z` from zod 4.x (stick to it instead of 3.x!) and `_` from lodash are available by default, so you can use them directly and should prefer to use them; don't import them in the generated code"
  - idempotent operation: the schema is intended to parse the updates of the world status incrementally, thus, the output of `Schema.parse(input)` must be a valid input of `Schema.parse` itself; that is, you should use z.transform carefully, keeping `Schema.parse(Schema.parse(input))` equal to `Schema.parse(input)`
  - for number schema: prefer `z.coerce.number()` over `z.number()` whenever you expect a number since it will try to convert the input to a number if it's not a number; but don't use other `z.coerce.xxx()` such as `z.coerce.boolean()`, just use `z.boolean()` directly
  - prefer object schema over array schema: "the array index is hard to understand and maintain, so you should use `物品栏: z.record(z.string().describe('物品名'), z.object({ 描述: z.string(), ... }))` instead of `物品栏: z.array(z.object({ 名称: z.string(), 描述: z.string(), ... }))`"
  - for object schema:
      - fixed required keys + the same type: use `z.record(z.enum(['key1', 'key2', ...]), ${value type})`
        fixed optional keys + the same type: use `z.partialRecord(z.enum(['key1', 'key2', ...]), ${value type})`
        dynamic optional keys + the same type: use `z.record(z.string(), ${value type})`
        fixed required keys + different types: 'use `z.object({ key1: ${type1}, key2: ${type2}, ... })`'
        dynamic keys but some keys are required + the same type: 'use `z.intersection(z.object({ requiredKey1: ${type1}, requiredKey2: ${type2}, ... }), z.record(z.string(), ${value type}))`'
      - on clearable object: 'if the object is clearable by JSON patch `{ "op": "remove", "path": "/path/to/object" }`, set `z.object({ ${field}: ${type}.prefault(...), ... }).prefault({})` instead of `z.object({ ... }).optional()` for better compatibility with the incremental update'
  - for special format (rare to happen): prefer `z.templateLiteral` over regex or manual parsing
  - for restrictions: when accepting a update that breaks the schema, users are tend to expect the update takes some effect instead of being discarded completely; therefore, you should try your best to use `z.transform` to convert the broken input to a valid input. For example, if Explorer requests a value to be between 0 and 100, prefer `z.number().transform(value => _.clamp(value, 0, 100))` over `z.number().min(0).max(100)`; if an object could only contain 10 keys, when a new key comes, discard the oldest key instead. **but only impose these restrictions when Explorer requests**
  - on default value:
      - prefer `z.prefault` over `z.default`
      - if a `z.object` or the whole Schema is complicated enough, set `.prefault('${suitable default value}')` or `.or(z.literal('待初始化')).prefault('待初始化')` for every field of it
      - if a compund type is prefault-ed, all its fields should be prefault-ed as well
      - don't set `z.prefault` for other situatioins unless Explorer requests it
  - when to describe: use `z.describe` only when there's no field name to explain the usage of the schema such as the key type of `z.record`; in contrast, you should never use `z.describe` if the field name has already explained the usage well
  - determine the order of keys: 'if Explorer requests you to do something with the insertion time of keys, prefer to use `_(data).entries()` which almost always lists keys in insertion order, e.g. you can remove old keys with a simple `_(data).entries().takeRight(10)`; when keys are already additionally sorted inside `z.transform`, you should use `$time: z.coerce.number().prefault(() => Date.now())` to automatically assign a timestamp'
  - don't repeat yourself: merge the same variable schemas whenever possible, but don't define extra variables to do so - you can only define schema inside `export const Schema = z.object({ ... })`
  - some function definition corrections:
      z.transform:
        type: '(fn: (value: Output) => NewOutput) => z.ZodType'
        limit: '`fn` can only take the parsed output as input, never ever use `context`. i.e. `z.string().transform(value => value)` is valid, while `z.string().transform((value, context) => value)` is not'
        example: 'z.object({ 好感度: z.coerce.number() }).transform(data => ({ 好感度: _.clamp(data.好感度, 0, 100) }))'
      z.prefault:
        type: '(value: Input | (() => Input)) => z.ZodType'
        limit: '`value` must be a valid input of the schema itself. i.e. `z.object({ 好感度: z.coerce.number().prefault(0) }).prefault({})` is valid, while `z.object({ 好感度: z.coerce.number() }).prefault({})` is not (the input must contain the `好感度` field in this case)'
      z.extend:
        limit: only `z.object`、`z.looseObject`、`z.strictObject` can be extended, even if `z.object(...).prefault({})` could not be extended! i.e. `z.object({...}).extend({...})` is valid, while `z.object({...}).prefault({}).extend({...})` is not
      z.passthrough、z.strict: they are not exist, never ever use them!
```

如果用户提供了 `export const Schema`, 你应该区分用户提供的是直接的 `schema.ts` 还是变量结构脚本. 具体地,

- `schema.ts` 中只应该有 `export const Schema` 负责定义和导出变量结构, 而没有其他副作用;
- 变量结构脚本可能在开头有 `import { registerMvuSchema } from 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/util/mvu_zod.js';`, 在结尾有 `$(() => { registerMvuSchema(Schema); });`, 如果是这样, **则你应该去除开头结尾, 只保留 `export const Schema`**.

## 脚本

MVU 角色卡总是有`角色卡/脚本/变量结构`脚本, 其导入变量结构并注册到 MVU 中:

```ts
import { registerMvuSchema } from 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/util/mvu_zod.js';
import { Schema } from '../../schema';

$(() => {
  registerMvuSchema(Schema);
});
```

你可以按需求新建别的脚本到`角色卡/脚本/*/index.ts`中.

## 前端界面

MVU 角色卡可能会设置状态栏界面, 因此`初始模板/角色卡/新建为src文件夹中的文件夹/界面`中提供了状态栏模板.

此外, 模板在 `util/mvu.ts` 中定义了 `defineMvuDataStore` 函数, 这是模板推荐的 Vue 访问 MVU 变量方式:

```ts
function defineMvuDataStore<T extends z.ZodObject>(
  schema: T,
  variable_option: VariableOption,
  additional_setup?: (data: Ref<z.infer<T>>) => void,
): ReturnType<typeof defineStore>;
```

其中 `Schema` 是变量结构, `variable_option` 是要访问的变量类型, `additional_setup` 是可选的额外设置函数.

例如, `示例/角色卡示例示例/store.ts` 中定义了访问 `useDataStore` 函数:

```ts
import { defineMvuDataStore } from '@util/mvu';
export const useDataStore = defineMvuDataStore(Schema, { type: 'message', message_id: getCurrentMessageId() });
```

其中 `const message_id = getCurrentMessageId()` 即获取界面所在楼层的楼层号, 因此 `const data = useDataStore()` 将能用于获取或修改该楼层的 MVU 变量.

或者, 前端界面可能会有需要在界面初始化时对 MVU 变量进行额外设置的需求, 则可以使用 `additional_setup`:

```ts
export const useDataStore = defineMvuDataStore(Schema, { type: 'message', message_id: getCurrentMessageId() }, data => {
  // 无论界面所在楼层原本记录有什么日志, 在初始化时强制置空
  data.value.系统状态.玩家本轮操作日志 = [];
});
```

## 世界书

`schema.ts` 所定义的变量结构除了被代码使用外, 还可以用于编写世界书.

当执行 `pnpm build` 或 `pnpm watch` 后, `schema.ts` 同目录下将会生成 json schema 文件 `schema.json`, 该文件描述了 `export const Schema = z.object({...})` 支持的输入数据. 可以据此完成`世界书/变量/initvar.yaml`即`世界书/index.yaml`中`[initvar]变量初始化勿开`条目的编写.

除了`[initvar]变量初始化勿开`外, 世界书里还应该有`变量列表`、`[mvu_update]变量更新规则`、`[mvu_update]变量输出格式`三个条目. 其中`变量列表`和`[mvu_update]变量输出格式`完全固定, 如果还没有设定, 可以按照初始模板中的设置.

`[mvu_update]变量更新规则`则应该按照以下要求:

```yaml
task: reappear an instance of the variable incremental update rule according to Explorer's request and the zod schema of variables, which is the main content of your reply
rule:
  - merge rules of the same variable types into one rule:
    - for fixed keys: "non-object type, `z.object({...})` and `z.record(z.enum(...), ...)` indicate that their keys always exist, so `主角.能力面板.力量`、`主角.能力面板.敏捷`、`主角.能力面板.体质`、`主角.能力面板.感知`、`主角.能力面板.意志`、`主角.能力面板.魅力` can be merged as `主角.能力面板.${六维}`, because their update rules are similar; the same applies to `${变量}.主角评价`"
    - for dynamic keys: |-
        `物品栏: z.record(z.string().describe('物品名'), ...)` may be empty or contain various items, so you should specify the path as `物品栏`, and put the key part into `type`'s index signature:
        物品栏:
          type: |-
            {
              [物品名: string]: {
                ...
              }
            }
  - nest fields of the same object to reduce tokens and make it more readable. for example, since `主角.能力面板` and `主角.装备栏` are both fields of `主角`, nest them under `主角` mapping
  - omit the type field for string variables
  - don't update readonly fields: field names starts with `_` are readonly, such as `_变量`, so don't list update rules for them
  - avoid listing update rules for variables whose names are self-explanatory unless Explorer specifies special rules for them
format: |-
  ---
  变量更新规则:
    ${变量名}:
      type: ${变量类型，**如果类型是string则省略这一字段**，否则要么是number、boolean等基础类型，要么使用typescript类型定义或zod schema定义（使用|-字符串块）}
      ${其他合适字段，仅当非常需要时才添加如format、range等...}
      check:
        - ${该变量更新时需要检查的更新规则，如：update it by ±(3~6) according to characters' attitudes towards <user>'s behavior respectively only if they're currently aware of it}
        - ...$(根据Explorer的描述确定需要几个check，尽量简练，不要过于扩展情况)
    ...
example: |- # just examples, don't copy them literally
  ---
  变量更新规则:
    世界:
      当前时间:
        format: ${xx历}-${YYYY/MM/DD}-${HH:MM}
        check:
          - 每次事件推进、休息或旅行后更新，保持时间流逝合理
          - 若场景跳转跨度较大，应说明跳跃原因
    主角:
      能力面板.${六维}.数值:
        type: number
        range: 0~100
        category:
          20~40: 普通人
          40~70: 冒险者常驻
        check:
          - 训练、战斗、重伤、系统奖励等显著事件才调整
          - 单次变化不超过 ±10，除非剧情有明确强化/削弱
      装备栏.${部位}:
        type: |-
          {
            装备: string; // 装备名称 + 状态; 若未装备，使用“空置”或“无”
            主角评价: string;
          }
        check:
          - 穿戴、损毁、替换装备时更新装备描述
    任务列表:
      type: |-
        {
          [任务名: string]: {
            类型: '主线' | '支线' | '每日' | '临危受命' ;
            说明: string; # 面向主角的任务背景或细则
            目标: string; # 明确可执行的目标描述，可包含步骤
            奖励: string;
            惩罚: string; # 失败后触发的负面效果
          }
        }
      check:
        - 避免一次性添加超过3个主线任务，保持焦点
        - 日常任务完成后可重置但需记录冷却
    ${变量}.主角评价:
      value: 主角对某个变量内容的即时感受
      check:
        - 在对应变量值发生变化或遭遇相关事件后可更新，其他情况不应更新
        - 语言应保持第一人称/贴近主角口吻
        - 主角的评价并不会被主角本人看到，也不会在剧情中出现
```
