---
description: 当用户输入中明确提及 MVU 时, 你应该参考本文件
alwaysApply: false
---
# MVU 变量框架

MVU 变量框架是一个独立的酒馆助手脚本. 它作用于消息楼层变量, 允许酒馆角色卡作者在世界书中设置消息楼层变量, 在世界书或聊天记录中初始化消息楼层变量, 及用 AI 输出更新消息楼层变量.

`@types/iframe/exported.mvu.d.ts` 中定义了 MVU 变量框架的接口. 如果提及到 "MVU 变量" 而非仅仅提及 "变量", 则应该优先使用 MVU 变量框架的接口.

## 使用

对于使用了 MVU 的脚本或前端界面, **你必须在代码加载时, 在顶部执行以下代码**:

- 使用 `await waitGlobalInitialized('Mvu');` 等待 MVU 变量框架初始化完成, **从而能够使用 `Mvu` 这个对象** (接下来的示例中, 我会在开头都等待 MVU 变量框架初始化来提醒你这一点, 但**你在实际编写时只需要在代码顶部等待一次)**;
- 如果是前端界面, 使用 `await waitUntil(() => _.has(getVariables({type: 'message'}), 'stat_data'));` 等待所在消息楼层变量有被正确设置, **从而能够使用消息楼层变量**;
- 如果是脚本, 合理使用 `waitUntil` 等待变量被正确设置.

## 数据存储

MVU 将变量数据存储在 `_.get(某楼层变量, 'stat_data')` 中, 如 `_.get(Mvu.getMvuData({type: 'message', message_id: 5}), 'stat_data')`.

```ts
await waitGlobalInitialized('Mvu');

// 获取第 5 楼的 MVU 变量
const variables = Mvu.getMvuData({ type: 'message', message_id: 5 });
const stat_data = _.get(variables, 'stat_data');

// 获取倒数第二楼的 MVU 变量
const variables = Mvu.getMvuData({ type: 'message', message_id: -2 });
const stat_data = _.get(variables, 'stat_data');

// 在前端界面中, 获取前端界面所在楼层的 MVU 变量
const variables = Mvu.getMvuData({ type: 'message', message_id: getCurrentMessageId() });
const stat_data = _.get(variables, 'stat_data');
```

此外, 你应该总是查找用户是否在编写区域内提供了变量结构定义 `schema.ts`, 其内使用 zod 4 定义了 stat_data 字段的类型, 例如:

```ts
export const Schema = z.object({
  好感度: z.coerce.number().transform(value => _.clamp(value, 0, 100)),
});
```

则获取 MVU 变量时应该:

```ts
await waitGlobalInitialized('Mvu');
const variables = Mvu.getMvuData({ type: 'message', message_id: getCurrentMessageId() });
const stat_data = Schema.parse(_.get(variables, 'stat_data'));
```

如果编写区域内没有 `schema.ts`, 应该让用户将变量结构定义发送给你, 并去除开头的 `import` 和结尾的 `$(...)`:

```ts
// ⬇️应该去除
import { registerMvuSchema } from 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/util/mvu_zod.js';

export const Schema = z.object({
  好感度: z.coerce.number().transform(value => _.clamp(value, 0, 100)),
});

// ⬇️应该去除
$(() => {
  registerMvuSchema(Schema);
});
```

## 自行解析变量

当酒馆因用户输入或 AI 输出等而产生新消息楼层时, MVU 会自动解析消息字符串中的 MVU 命令, 并根据它更新消息楼层变量. 但通过 `generate` 等接口自行生成 AI 输出时, 不会产生新消息楼层, 因此不会自动解析 MVU 命令.

为此, MVU 提供了 `parseMessage` 接口用于自行解析包含 MVU 命令的消息字符串. 它读取旧变量情况和一个消息字符串, 得到更新后的变量结果.

```ts
await waitGlobalInitialized('Mvu');

// 获取旧变量
const old_data = Mvu.getMvuData({ type: 'message', message_id: getCurrentMessageId() });

// 请求 AI 生成
const message = await generate({ user_input: '你好' });

// 解析生成结果
const data = await Mvu.parseMessage(message, old_data);
```

为了更好的细粒度控制, 解析不会将结果写回消息楼层, 你可以自行选择如何使用 AI 回复 `message` 和变量更新结果 `data`.

也许这个 AI 请求只是为了专门进行一次变量更新, 那么你可以抛弃 `message`, 将 `data` 写回到当前楼层:

```ts
// 将更新后的变量写回楼层
await Mvu.replaceMvuData(data, { type: 'message', message_id: getCurrentMessageId() });
```

也许你是想让玩家直接在同层界面里玩 AI (具体请参考{doc}`/青空莉/工具经验/实时编写前端界面或脚本/index`), 这个 AI 请求是在请求 AI 回复剧情和更新变量, 那么你可以将回复和变量创建成新的楼层:

```ts
// 将回复和变量结果创建为新的楼层
await createChatMessages([{ role: 'assistant', message, data }]);
```

## 事件

MVU 还提供了一些事件 (`Mvu.events.xxx`), 用于监听变量变化并在那时调整变量或执行其他功能.

### COMMAND_PARSED: 变量更新命令解析完成

通过监听 "变量更新命令解析完成" 事件 (`Mvu.events.COMMAND_PARSED`), 你可以获取到对应的变量更新命令, 并对其进行修复.

例如, 修复 gemini 在中文间加入的 `-`, 如将`角色.络-络`修复为`角色.络络`:

```js
await waitGlobalInitialized('Mvu');
eventOn(Mvu.events.COMMAND_PARSED, commands => {
  commands.forEach(command => {
    command.args[0] = command.args[0].replaceAll('-', '');
  });
});
```

又比如, 将繁体字修复为简体字, 如将`絡絡`修复为`络络`:

```js
import { toSimplified } from 'chinese-simple2traditional';

await waitGlobalInitialized('Mvu');
eventOn(Mvu.events.COMMAND_PARSED, commands => {
  commands.forEach(command => {
    command.args[0] = toSimplified(command.args[0]);
  });
});
```

### VARIABLE_UPDATE_ENDED: 变量更新结束

通过监听 "变量更新结束" 事件 (`Mvu.events.VARIABLE_UPDATE_ENDED`), 你可以获取到更新前后的变量, 可以对更新结果进行额外处理.

比如, 我们可以这样弹窗显示更新前后的变量值:

```js
await waitGlobalInitialized('Mvu');
eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, (new_variables, old_variables) => {
  toastr.info(`更新前的白娅依存度是: ${_.get(old_variables, 'stat_data.白娅.依存度')}`);
  toastr.info(`更新后的白娅依存度是: ${_.get(new_variables, 'stat_data.白娅.依存度')}`);
});
```

或者, 我们可以这样修改更新后的变量值:

```js
await waitGlobalInitialized('Mvu');
eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, variables => {
  // 不管更新成了多少, 强行把白娅依存度改成 0
  _.set(variables, 'stat_data.白娅.依存度', 0);
});
```

由此我们可以做非常多功能.

其中一些是在 `schema.ts` 中能用 zod 4 直接做到的:

::::{tabs}

:::{tab} 限制依存度在 0 和 100 之间

```js
await waitGlobalInitialized('Mvu');
eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, variables => {
  _.update(variables, 'stat_data.白娅.依存度', value => _.clamp(value, 0, 100));
});
```

:::

:::{tab} 如果数量不为正数应该直接删除物品

```js
await waitGlobalInitialized('Mvu');
eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, variables => {
  _.update(variables, 'stat_data.主角.物品栏', data => _.pickBy(data, ({数量}) => 数量 > 0));
});
```

:::

:::{tab} 称号有数量上限，依存度越高越多

```js
await waitGlobalInitialized('Mvu');
eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, variables => {
  _.update(variables, 'stat_data.白娅.称号', data =>
    _(data)
      .entries()
      .takeRight(Math.ceil(_.get(variables, 'stat_data.白娅.依存度') / 10))
      .value(),
  );
});
```

:::

:::{tab} 记录好感度第一次超过 30

```js
await waitGlobalInitialized('Mvu');
eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, variables => {
  if (_.get(variables, 'stat_data.白娅.依存度') > 30) {
    _.set(variables, 'stat_data.$flag.白娅依存度突破30', true);
  }
});
```

:::

:::{tab} 青空莉死了!

```js
await waitGlobalInitialized('Mvu');
eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, variables => {
  if (_.get(variables, 'stat_data.青空莉.死亡') === true) {
    // 删除所有与青空莉相关的变量
    _.unset(variables, 'stat_data.青空莉');
  }
});
```

:::

::::

但 `schema.ts` 无法获取以前的变量情况, 因此无法利用 `old_variables` 做到下面这些:

::::{tabs}

:::{tab} 限制依存度变动幅度不超过 3

```js
await waitGlobalInitialized('Mvu');
eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, (new_variables, old_variables) => {
  const old_value = _.get(old_variables, 'stat_data.白娅.依存度');

  // 新的好感度必须在 旧好感度-3 和 旧好感度+3 之间
  _.update(new_variables, 'stat_data.白娅.依存度', value => _.clamp(value, old_value - 3, old_value + 3));
});
```

:::

:::{tab} 检测依存度突破 30

```js
await waitGlobalInitialized('Mvu');
eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, (new_variables, old_variables) => {
  const old_value = _.get(old_variables, 'stat_data.白娅.依存度');
  const new_value = _.get(new_variables, 'stat_data.白娅.依存度');
  if (old_value < 30 && new_value >= 30) {
    toastr.success('白娅依存度突破 30 了!');
  }
});
```

:::

:::{tab} 让 AI 不能更新变量

```js
await waitGlobalInitialized('Mvu');
eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, (new_variables, old_variables) => {
  // 强行将新的白娅依存度设置为旧的, 从而取消 AI 对它的更新
  _.set(new_variables, 'stat_data.白娅.依存度', _.get(old_variables, 'stat_data.白娅.依存度'));
});
```

:::

::::
