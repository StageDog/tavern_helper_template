# 酒馆助手界面: 显示和允许玩家修改变量

{{ prolog }}

MVU 有一个便利的设计: 它会在 AI 回复结束后, 自动在回复末尾附加一串特殊文本: `<StatusPlaceHolderImpl/>`. \
这串文本本身只是一个占位符, 没有任何作用. 但你可以用酒馆正则捕获它, 将它——

- {menuselection}`仅格式提示词` 为空, 这样一来, 这段文本不会被发送给 AI——也就是说它不会占用任何 token!
- {menuselection}`仅格式显示` 为我们想要展示的任何内容: 可以是单纯一句话, 也可以是一个可互动的前端界面.

## 仅格式提示词: 不发送界面占位符

我们新增一个局部正则, 命名为 `[不发送]界面占位符` (按照青空莉的正则命名习惯, `[不发送]` 表示不发送给 AI, `[隐藏]` 表示不显示给玩家, 或者 `[按作用命名]`):

::::{tabs}

:::{tab} 正则设置

```yaml
脚本名称: [不发送]界面占位符
查找正则表达式: <StatusPlaceHolderImpl/>
替换为:
作用范围:
  - [ ] 用户输入
  - [x] AI输出
短暂:
  - [ ] 仅格式显示
  - [x] 仅格式提示词
```

:::

:::{tab} 图片参考
:::{figure} 正则_不发送界面占位符.png
:::
:::

::::

## 仅格式显示: 显示界面

同样地, 我们新建一个局部正则, 命名为 `[界面]状态栏`. 这次我们将勾选 {menuselection}`仅格式显示`, 将占位符替换为我们要显示的状态栏:

::::{tabs}

:::{tab} 正则设置

```yaml
脚本名称: [界面]状态栏
查找正则表达式: <StatusPlaceHolderImpl/>
替换为: 见下文
作用范围:
  - [ ] 用户输入
  - [x] AI输出
短暂:
  - [x] 仅格式显示
  - [ ] 仅格式提示词
```

:::

:::{tab} 图片参考

照着图片的话, 会显示成`见下文`三个字, 但不会作为提示词发给 AI:

:::{figure} 正则_界面状态栏.png
:::

:::

::::

### 纯文本界面

与 `<user>`、`{{user}}` 等酒馆宏相同, `{{format_message_variable::变量}}` 除了作为提示词在发送给 ai 时被替换, 也会在显示时被替换. \
因此我们可以将 `<StatusPlaceHolderImpl/>` 替换为一串带有 `{{format_message_variable::变量}}` 的文本, 来显示变量值:

```text
💖 白娅当前依存度: {{format_message_variable::stat_data.白娅.依存度}}
```

这样, 每次 AI 回复的下方都会自动显示这行文字, 并显示正确的数值:

:::{figure} 纯文本状态栏.png
:::

当然, 你也可以使用 HTML 和 CSS 进行美化:

```html
<style>
/* 在这里写你的CSS样式 */
.status-bar {
  font-size: 14px;
  color: #ff69b4;
  border: 1px solid #ff69b4;
  padding: 5px;
  border-radius: 8px;
}
</style>
<div class="status-bar">
💖 白娅当前依存度: {{format_message_variable::stat_data.白娅.依存度}}
</div>
```

:::{figure} 美化状态栏.png
:::

不过, 我其实非常不建议你只为了显示变量值而做个状态栏: 想看变量值的玩家会自己开变量管理器看. \
比起只显示数值, 你可以做更多有趣的事情:

:::{video} 折叠状态栏.mp4
:align: center
:::

### 前端界面

至于包含复杂代码的前端界面, 这已超出本教程范围……但其实用{doc}`/青空莉/工具经验/实时编写前端界面或脚本/index`拷打 AI 写起来很简单!

在前端界面中, 你不仅仅可以显示变量值或做一些简单的美化——你还能让玩家和界面交互!

[角色卡示例](https://github.com/StageDog/tavern_helper_template/tree/main/示例/角色卡示例)中为了演示这一点, 在界面中支持了直接增减白娅依存度; 同时, 变量管理器中对变量的修改也会实时更新在界面上:

:::{video} 依存度状态栏.mp4
:align: center
:::

但你当然可以做得更复杂, 比如:

- 允许玩家通过界面修改变量, 为操纵的天选者发布任务
- 请求 AI 生成
- Galgame 风格界面
- 直接制作杀戮尖塔等游戏 (是的, 有很多这类角色卡)!

:::::{tabs}

::::{tab} 发布任务

:::{video} 任务界面状态栏.mp4
:align: center
:::

::::

::::{tab} 流式 Galgame 界面

:::{video} ../../../../青空莉/工具经验/实时编写前端界面或脚本/进阶技巧/流式界面.mp4
:align: center
:::

::::

:::::

总之, 电脑建议用{doc}`/青空莉/工具经验/实时编写前端界面或脚本/index`, 电脑建议用{doc}`/青空莉/工具经验/实时编写前端界面或脚本/index`, 电脑建议用{doc}`/青空莉/工具经验/实时编写前端界面或脚本/index`!

当然, 如果你是手机端, 那想生成复杂前端界面是很困难的……可以尝试将*变量结构*和*下面的前端界面模板*发给 AI 来制作:

:::{admonition} 手机上的简易前端界面模板
:class: hint, dropdown

- 如果需要能在界面里修改变量, 除了下面的提示词, 你还需要发送[这段提示词](https://github.com/StageDog/tavern_helper_template/blob/main/.cursor/rules/mvu变量框架.mdc)给 AI.
- 如果需要能在界面里请求 AI 生成、修改世界书、修改预设、播放音乐等等, 你还需要按需发送[对应的类型定义文件](https://n0vi028.github.io/JS-Slash-Runner-Doc/guide/功能详情/请求生成.html)给 AI.

**当然如果你有电脑, 我更建议你用{doc}`/青空莉/工具经验/实时编写前端界面或脚本/index`来让 AI 边自己看酒馆网页边编写状态栏.**

````{code-block} html
:force:
```html
<head>
  <style>
  ${纯 CSS 设计样式}
  </style>
  <script type="module">
    ${
      逻辑代码
      example: |-
        function populateCharacterData() {
          const all_variables = getAllVariables();

          const property_value = _.get(all_variables, 'stat_data.${variable path}', 'N/A');
          $('#${character}-${variable path}').text(property_value);
          ...
        }

        function toggleSection($header) {
          // 优先使用 jquery 而不是 javascript 的 DOM 操作
          const $content = $header.next('.section-content');
          $content.toggleClass('expanded');

          const $arrow = $header.find('span:last-child');
          $arrow.text($content.hasClass('expanded') ? '▼' : '►');
        }

        async function init() {
          await waitGlobalInitialized('Mvu');
          populateCharacterData();

          $('.section-header').on('click', function () {
            toggleSection($(this));
          });
        }

        $(errorCatched(init));
    }
  </script>
</head>
<body>
  <div class="card-body">
    <div class="section">
      <div class="section-header">
        <span>${角色名} 核心状态</span>
        <span>▼</span>
      </div>
      <div class="section-content expanded">
        <div class="property">
          <div class="property-name">${variable name in Chinese}</div>
          <div class="property-value-container">
            <span class="property-value" id="${character}-${variable path}">--</span>
          </div>
        </div>
        <div class="property">
          <div class="property-name">${...}</div>
          <div class="property-value-container">
            <span class="property-value" id="${...}">--</span>
          </div>
        </div>
        ...
      </div>
    </div>
    <div class="section">
      <div class="section-header">
        <span>世界状态</span>
        <span>►</span>
      </div>
      <div class="section-content">${...}</div>
    </div>
    ...
  </div>
</body>
```
````

:::

(MVU_记录玩家在前端界面的操作)=

### 记录玩家在前端界面的操作

不过, 在玩家与前端界面交互时, 除了更新对应的变量, 我还建议你记录下玩家的操作日志: 如果只是更新对应变量, 对于剧情 AI 而言, 就像是变量无理由地发生了变化.

例如, 假设你记录了`积分`变量, 上一次剧情中玩家有 100 积分, 本次剧情中玩家与前端界面交互, 用 100 积分兑换了 "大师之剑". 如果没有记录玩家的操作日志, 剧情 AI 将会看到玩家无理由地失去了 100 积分、获得了 "大师之剑"——它很可能认为变量发生了错乱, 尝试去修正它!

为了解决这个问题, 我建议你在变量结构中添加一个类似`系统日志`的变量:

- 清空: 当前端界面渲染完成时, 让 AI 判断这个前端界面是不是在最新楼层 (也就是说, 它属于最新 AI 回复), 如果在就把这个`系统日志`变量清空;
- 记录: 把玩家在界面上所做的修改变量操作都记录到`系统日志`变量里, 比如`<user>用 100 积分兑换了 "大师之剑"`.
- 发给 AI: `系统日志`也是你设置的变量, 自然是会发给 AI 的.

## 回顾

至此, 我们利用 `<StatusPlaceHolderImpl/>` 占位符制作了这样一个界面:

- 显示不消耗任何 token;
- AI 对它只需要更新需要更新的变量, 而不需要像传统状态栏一样每次都输出所有信息.

**但不要让这里的界面教程限制了你的想象力.**

你没必要非要用 `<StatusPlaceHolderImpl/>` 来显示界面, 你可以用其他任何方式来显示它: 你可以自己定义一个输出格式, 让 AI 输出其他必要信息, 然后通过酒馆正则捕获它, 替换为你的界面.

## 在消息开头显示界面

此外, 即便使用 `<StatusPlaceHolderImpl/>` 占位符, 你也可以调整酒馆正则, 来在消息开头而不是结尾 `<StatusPlaceHolderImpl/>` 实际位置显示界面:

::::{tabs}

:::{tab} 正则设置

```yaml
脚本名称: [界面]状态栏
查找正则表达式: /(.*)<StatusPlaceHolderImpl/>/s
替换为:
  你的界面
  $1
作用范围:
  - [ ] 用户输入
  - [x] AI输出
短暂:
  - [x] 仅格式显示
  - [ ] 仅格式提示词
```

:::

:::{tab} 结果

:::{figure} 显示在开头.png
:::

:::

::::

以此为例, **不要让这里的界面教程限制了你的想象力.**
