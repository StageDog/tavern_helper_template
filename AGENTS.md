# 酒馆助手前端界面与脚本开发 - AGENTS规范

> 本文档为AI编码助手提供完整的项目开发规范、技术路线和工具使用指南

---

## 📋 目录

1. [项目概述](#1-项目概述)
2. [项目结构与分类](#2-项目结构与分类)
3. [核心技术栈](#3-核心技术栈)
4. [接口使用规范](#4-接口使用规范)
5. [构建配置规范](#5-构建配置规范)
6. [酒馆变量系统](#6-酒馆变量系统)
7. [前端界面开发](#7-前端界面开发)
8. [脚本开发](#8-脚本开发)
9. [MVU变量框架](#9-mvu变量框架)
10. [Chrome DevTools MCP](#10-chrome-devtools-mcp)
11. [最佳实践](#11-最佳实践)
12. [高级技巧](#12-高级技巧)

---

## 1. 项目概述

### 1.1 项目定位

本项目专门用于编写酒馆助手 ([Tavern Helper](https://n0vi028.github.io/JS-Slash-Runner-Doc/guide/关于酒馆助手/介绍.html)) 所支持的前端界面或脚本。它们在酒馆 (SillyTavern) 中以前台或后台的形式运行，可以在代码中直接使用酒馆助手所提供的接口。

### 1.2 应用场景

- **UI美化**: 为角色卡提供更好的UI显示，如将消息楼层中纯文本的状态栏美化为有动态效果、有交互的HTML状态栏
- **交互增强**: 实现非纯文本的游玩体验，如监听现实时间或酒馆事件来实现meta游戏、播放多媒体文件
- **体验优化**: 优化酒馆使用体验，如用jQuery为预设提示词条目新增复制按钮
- **外部连接**: 连接外部应用程序，如通过socket.io-client连接外部服务器
- **功能扩展**: 新增额外功能，如每20楼在后台调用一次LLM来生成对之前剧情的总结

### 1.3 技术特性

- **运行方式**: 所有代码在浏览器中运行，支持iframe沙盒隔离
- **开发语言**: TypeScript（严格类型检查）
- **前端框架**: Vue 3 + Composition API
- **状态管理**: Pinia + Zod（数据校验）
- **样式方案**: SCSS + Vue SFC scoped styles
- **构建工具**: Webpack 5（已配置完整loader和插件）

### 1.4 设计与性能规范

- **实现方式应尽量简洁**: 项目实现方式应保持结构简单、依赖精炼，避免堆叠不必要的动画与资源加载
- **资源加载受限**: 考虑到大部分场景运行在性能较弱的手机浏览器，需要严格控制脚本体积、外部资源请求次数与内存占用，并合理拆分懒加载
- **移动端优化优先**: 全部UI与交互必须针对移动浏览器进行自适应与优化，确保触控操作舒适、布局响应迅速且不产生横向滚动

---

## 2. 项目结构与分类

### 2.1 目录结构

```
src/
├── APP/              # 前端界面项目
├── 界面示例/          # 界面项目模板
├── 脚本示例/          # 脚本项目模板
└── 模板/             # 项目模板文件夹

dist/                 # 构建输出目录（自动生成）
├── APP/
├── 界面示例/
└── 脚本示例/

@types/               # 酒馆助手API类型定义
├── function/         # 核心功能函数类型
└── iframe/           # 框架和插件接口类型
```

### 2.2 项目类型判定

- **前端界面项目**: `src/xxx` 文件夹中既有 `index.ts` 也有 `index.html`
  - 特点: 前台显示，有独立UI界面
  - 示例: `src/APP`, `src/界面示例`

- **脚本项目**: `src/xxx` 文件夹中仅有 `index.ts`
  - 特点: 后台运行，无界面
  - 示例: `src/脚本示例`

---

## 3. 核心技术栈

### 3.1 依赖库

项目使用pnpm作为包管理器，预装以下第三方库：

**核心框架:**
- `vue` - Vue 3 框架
- `vue-router` - Vue路由
- `pinia` - 状态管理

**开发工具:**
- `typescript` - TypeScript支持
- `jquery` - DOM操作
- `lodash` - 工具库
- `zod` - 数据校验
- `toastr` - 消息提示

**视觉与动画:**
- `gsap` - 动画库
- `pixi.js` - 2D渲染
- `@pixi/react` - React集成

**其他:**
- `dedent` - 文本格式化
- `jquery-ui` - UI组件
- `yaml` - YAML解析
- `@vueuse/core` - Vue组合式API

### 3.2 第三方库使用原则

- **优先使用第三方库**而不是原生API
- 使用`jquery`而不是原生DOM操作
- 使用`zod`进行数据校验和纠错
- 使用`gsap`制作动画效果
- 使用`vueuse`提供的组合式API

### 3.3 CDN使用与第三方库管理

项目提供免费的CDN服务支持，所有第三方库和GitHub文件都可以通过CDN访问。

**国内访问优化**：
- 使用 `https://testingcf.jsdelivr.net` 镜像确保国内网络环境可正常访问
- 不推荐使用 `https://cdn.jsdelivr.net`（国内可能无法访问）

**第三方库添加与管理**：
- 为项目添加第三方库时，**推荐使用** `pnpm add 第三方库名` 来安装
- 模板文件夹已配置webpack，会在打包时自动将第三方库转换为jsdelivr CDN链接
- 这可以避免在多个脚本或界面中重复打包相同的第三方库，减少总体积
- 转换后的CDN链接将使用 `https://testingcf.jsdelivr.net/npm/` 前缀

**手动CDN引用**：
```typescript
// ✅ 正确：使用国内可访问的镜像
import something from 'https://testingcf.jsdelivr.net/npm/package-name@version/+esm';

// ❌ 错误：可能无法在国内访问
import something from 'https://cdn.jsdelivr.net/npm/package-name@version/+esm';
```

---

## 4. 接口使用规范

### 4.1 @types目录限制 ⚠️ **重要**

- `@types`目录包含了所有酒馆和酒馆助手提供的依赖函数、接口和类型定义
- **禁止超出**`@types`文件夹中定义的函数和接口进行开发
- 不得自建接口或使用未在`@types`中定义的全局函数

### 4.2 @types目录结构

**function/目录 - 核心功能函数:**

| 文件 | 主要函数 | 说明 |
|------|----------|------|
| `variables.d.ts` | `getVariables`, `replaceVariables`, `updateVariablesWith`, `insertOrAssignVariables`, `insertVariables`, `deleteVariable` | 变量操作 |
| `chat_message.d.ts` | `getChatMessages`, `setChatMessages`, `createChatMessages`, `deleteChatMessages`, `rotateChatMessages` | 消息处理 |
| `displayed_message.d.ts` | `retrieveDisplayedMessage`, `formatAsDisplayedMessage` | 显示消息操作 |
| `slash.d.ts` | `triggerSlash` | STScript命令执行 |
| `script.d.ts` | `getButtonEvent`, `getScriptButtons`, `replaceScriptButtons`, `appendInexistentScriptButtons`, `getScriptInfo`, `replaceScriptInfo` | 脚本按钮管理 |
| `builtin.d.ts` | `builtin` | 内置工具访问 |
| `generate.d.ts` | `generate`, `generateRaw`, `stopGenerationById`, `stopAllGeneration` | 内容生成 |
| `raw_character.d.ts` | `RawCharacter`, `getCharData`, `getCharAvatarPath`, `getChatHistoryBrief`, `getChatHistoryDetail` | 角色卡操作 |
| `global.d.ts` | `waitGlobalInitialized`, `initializeGlobal` | 全局接口管理 |
| `inject.d.ts` | `injectPrompts`, `uninjectPrompts` | 提示词注入 |
| `util.d.ts` | `substitudeMacros`, `getLastMessageId`, `errorCatched` | 工具函数（全局） |
| `iframe/util.d.ts` | `getCurrentMessageId`, `getScriptId`, `getIframeName`, `reloadIframe` | iframe工具（iframe专用） |
| `audio.d.ts` | `playAudio`, `pauseAudio`, `getAudioList`, `replaceAudioList`, `insertAudioList`, `getAudioSettings`, `setAudioSettings` | 音频播放 |
| `lorebook.d.ts` | `getLorebookSettings`, `setLorebookSettings`, `getLorebooks`, `deleteLorebook`, `createLorebook`, `getCharLorebooks`, `setCurrentCharLorebooks` | 世界书设置 |
| `lorebook_entry.d.ts` | `getLorebookEntries`, `replaceLorebookEntries`, `updateLorebookEntriesWith`, `setLorebookEntries`, `createLorebookEntries`, `deleteLorebookEntries` | 世界书条目操作 |
| `worldbook.d.ts` | `getWorldbookNames`, `createWorldbook`, `deleteWorldbook`, `getWorldbook`, `replaceWorldbook`, `updateWorldbookWith` | 世界书管理 |
| `preset.d.ts` | `getPresetNames`, `loadPreset`, `createPreset`, `deletePreset`, `getPreset`, `replacePreset`, `updatePresetWith` | 预设管理 |
| `extension.d.ts` | `isAdmin`, `getExtensionType`, `getExtensionStatus`, `isInstalledExtension`, `installExtension`, `uninstallExtension` | 扩展管理 |
| `macro_like.d.ts` | `registerMacroLike` | 宏注册 |
| `tavern_regex.d.ts` | `formatAsTavernRegexedString`, `getTavernRegexes`, `replaceTavernRegexes` | 正则脚本操作 |
| `import_raw.d.ts` | `importRawCharacter`, `importRawChat`, `importRawPreset`, `importRawWorldbook` | 导入原始数据 |
| `version.d.ts` | `getTavernHelperVersion`, `getTavernVersion` | 版本信息 |

**iframe/目录 - 框架和插件接口:**

| 文件 | 主要接口 | 说明 |
|------|----------|------|
| `event.d.ts` | `eventOn`, `eventEmit`, `eventOnce`, `eventMakeFirst`, `eventMakeLast`, `eventRemoveListener`, `eventClearEvent`, `tavern_events`, `iframe_events` | 事件系统 |
| `exported.mvu.d.ts` | `Mvu` | MVU变量框架 |
| `exported.sillytavern.d.ts` | `SillyTavern` | 酒馆原生API |
| `exported.tavernhelper.d.ts` | `TavernHelper` | 酒馆助手API |
| `exported.ejstemplate.d.ts` | `EJS` | EJS模板引擎 |
| `script.d.ts` | `waitForInit` | 脚本框架初始化 |
| `variables.d.ts` | iframe变量操作 | iframe变量操作 |

### 4.3 接口使用示例

```typescript
// 变量操作
const variables = getVariables({ type: 'script' }); // 在脚本内自动获取当前脚本ID
replaceVariables(newVars, { type: 'script' });
updateVariablesWith(vars => { /* 处理 */ return vars; }, { type: 'script' });

// 消息处理
const messages = getChatMessages('0-{{lastMessageId}}');
await setChatMessages([{ message_id: 5, message: 'new content' }]);
await createChatMessages([{ role: 'user', message: 'Hello' }]);
await deleteChatMessages([5]);

// 获取最新楼层号
const lastId = getLastMessageId();

// 前端界面获取所在楼层号
const messageId = getCurrentMessageId(); // 在消息iframe内使用

// 角色卡操作
const charData = getCharData('current');
const avatarPath = getCharAvatarPath('current');

// 全局接口（需先初始化）
await waitGlobalInitialized('Mvu');
Mvu.getMvuData({ type: 'message', message_id: 'latest' });

// 事件监听
eventOn(tavern_events.MESSAGE_RECEIVED, (message_id) => {
  console.log('收到消息:', message_id);
});

// 生成内容
const result = await generate({ user_input: '你好', should_stream: true });

// 提示词注入
injectPrompts([{ id: 'custom', role: 'system', content: '你是助手', position: 'in_chat', depth: 0 }]);

// 重新加载iframe
reloadIframe();
```

---

## 5. 构建配置规范

### 5.1 webpack.config.ts（可修改，需谨慎）

- `webpack.config.ts` 是项目的构建配置文件，**允许修改，但必须谨慎**
- 该文件已配置好所有必要的loader、插件和优化选项，包括：
  - Vue Loader（用于Vue SFC编译）
  - TypeScript Loader（用于.ts/.tsx文件编译）
  - SCSS Loader（用于.scss文件编译和提取）
  - MiniCssExtractPlugin（用于CSS提取）
  - HtmlWebpackPlugin（用于HTML打包）
  - VueUse自动导入组件和指令
  - 代码混淆和压缩优化
- 修改此文件可能导致构建失败或功能异常，建议每次改动后立即本地构建验证

### 5.2 已配置的Loader和插件

- **Vue Loader** - 用于Vue SFC编译
- **TypeScript Loader** - 用于.ts/.tsx文件编译
- **SCSS Loader** - 用于.scss文件编译和提取
- **MiniCssExtractPlugin** - 用于CSS提取
- **HtmlWebpackPlugin** - 用于HTML打包
- **VueUse自动导入** - 自动导入组件和指令
- **代码混淆和压缩优化** - 混淆代码，提升性能

### 5.3 内置全局库

酒馆运行时已内置以下全局库，可直接使用：

- `Vue` - Vue 3 (`window.Vue`)
- `VueRouter` - Vue Router 4 (`window.VueRouter`)
- `$` / `jQuery` - jQuery 3 (`window.$/window.jQuery`)
- `_` - Lodash (`window._`)
- `toastr` - 消息提示 (`window.toastr`)
- `PIXI` - Pixi.js (`window.PIXI`)
- `YAML` - YAML解析 (`window.YAML`)
- `z` - Zod (`window.z`)

### 5.4 特殊导入方式

```typescript
// 1. 导入文件内容（原始字符串）
import html_content from './html.html?raw';
import json_content from './json.json?raw';

// 2. 导入HTML（最小化）
import html from './file.html';

// 3. 导入Markdown（解析为HTML）
import markdown from './file.md';

// 4. 导入Vue组件
import Component from './Component.vue';

// 5. 导入样式（自动插入<head>）
import './index.scss';

// 6. 导入打包后的脚本/样式（可在jQuery中使用）
import javascript_content from './script.ts?raw';
import css_content from './style.scss?raw';
```

### 5.5 SillyTavern 正则替换粘贴规范（重要）

> 适用场景：你想把 `dist/**/index.html` 的整份内容粘贴到酒馆「正则脚本/正则替换」的“替换为”输入框里（通常会用到 `$1` 占位注入）。

- **禁止**直接粘贴 `dist/**/index.html`：酒馆会将替换内容序列化为 JSON 字符串保存，JSON 会自动反转义 `\n`/`\t`/`\r`/`\b`/`\uXXXX` 等序列，导致打包脚本中的字符串/正则被破坏，最终在酒馆控制台出现 `Invalid or unexpected token` 并渲染空白。
- **必须**改用 `dist/**/paste.html`：该文件由构建后脚本自动生成，保留 `$1` 注入位，同时将内联脚本包装为 base64 运行时解码执行，避免 JSON 反转义与 `$1` 误替换问题。
- **如果你不需要“整页粘贴”**，优先用 URL 加载方式（推荐）：把 `dist/**/index.html` 上传到可访问地址（如 jsdelivr 或本地静态服务器），再用 jQuery `$('...').load(url)` 或使用同目录的 `dist/**/loader.js` 进行加载。
- **更推荐的规避方式（从根上减少注入）**：对于“消息楼层 iframe”界面，不要把正文/选项用 `$1` 注入到 HTML 里，改用 `getCurrentMessageId()` 定位当前楼层，再用 `getChatMessages(message_id)` 读取该楼层消息文本并解析 `<content>/<option>`；这样基本不再依赖“整页粘贴”，也就不会触发 JSON 反转义破坏脚本的问题。

**影响说明（提前告知）**
- `paste.html` 的功能行为与原 `index.html` 等价，但会增加一次 base64 解码与脚本重建开销；在性能较弱的移动端首帧可能更慢，不建议频繁重复注入同一界面。
- 如果你把数据注入从 `$1` 切换为 `getChatMessages` 读取：界面将以“聊天记录里保存的楼层消息”为唯一数据源；因此楼层消息本身必须包含 `<content>/<option>` 等标签（而不是只存在于正则替换结果里），否则界面会显示为空。

---

## 6. 酒馆变量系统

### 6.1 变量类型

酒馆变量用于持久化存储前端界面、脚本的数据，可通过酒馆助手的`getVariables`、`replaceVariables`等接口读写。

| 类型 | type值 | 说明 |
|------|--------|------|
| 全局变量 | `'global'` | 在酒馆中全局一致 |
| 角色卡变量 | `'character'` | 绑定在当前角色卡上 |
| 聊天变量 | `'chat'` | 绑定在当前聊天文件上 |
| 消息楼层变量 | `'message'` | 绑定在特定楼层上，需指定`message_id` |
| 脚本变量 | `'script'` | 绑定在特定脚本上 |
| 扩展变量 | `'extension'` | 绑定在特定扩展上，需指定`extension_id` |

### 6.2 使用示例

```typescript
// 读取变量
const globalVars = getVariables({ type: 'global' });
const charVars = getVariables({ type: 'character' });
const chatVars = getVariables({ type: 'chat' });
const messageVars = getVariables({ type: 'message', message_id: 5 });
const scriptVars = getVariables({ type: 'script' }); // 当前脚本

// 写入变量
replaceVariables({ key: 'value' }, { type: 'global' });

// 更新变量
updateVariablesWith(vars => {
  _.set(vars, 'path.to.value', newValue);
  return vars;
}, { type: 'chat' });

// 插入或修改变量
insertOrAssignVariables({ newKey: 'newValue' }, { type: 'chat' });

// 删除变量
deleteVariable('path.to.key', { type: 'chat' });

// 使用Zod进行数据校验
const Settings = z.object({
  button_selected: z.boolean().default(false)
}).prefault({});
const settings = Settings.parse(getVariables({ type: 'script', script_id: getScriptId() }));
```

---

## 7. 前端界面开发

### 7.1 项目判定

如果`src/xxx`文件夹中既有`index.ts`文件也有`index.html`文件，则它是前端界面项目。

前端界面以iframe的形式在酒馆消息楼层中前台显示，有一个自己的界面。

### 7.2 index.html规范

前端界面的`index.html`仅可填写静态`<body>`内容，不得引用项目中其他文件：

```html
<head>
  <!-- 保留空白，webpack打包时会插入样式、脚本等 -->
</head>
<body>
  <!-- 这里写<div>、<span>等静态内容 -->
  <!-- 也可以只写<div id="app"></div>交给vue渲染 -->
</body>
```

**禁止事项:**
- ❌ 禁止使用`<link>`导入样式
- ❌ 禁止使用`<script>`引用本地脚本
- ❌ 禁止使用`<img src="">`占位

### 7.3 样式规范

**简单样式:**
- 可在index.html中直接使用TailwindCSS
- 需要新建`@import 'tailwindcss'`的CSS文件并导入

**复杂样式:**
- 优先使用Vue组件的`<style lang="scss">`标签
- 或在TypeScript中`import './index.scss'`

### 7.4 iframe适配要求

- ❌ 禁止使用`vh`等受宿主高度影响的单位
- ✅ 使用`width`和`aspect-ratio`让高度动态调整
- ❌ 避免使用`min-height`、`overflow: auto`等强制撑高父容器的元素
- ✅ 页面整体应适配容器宽度，不产生横向滚动条
- ✅ 优先卡片形状，无背景颜色（除非明确要求）

### 7.5 正确加载/卸载

```typescript
// ✅ 正确：使用jQuery初始化
$(() => {
  toastr.success('界面加载成功！');
  createApp(App).use(router).mount('#app');
});

// ✅ 正确：使用jQuery和pagehide事件卸载
$(window).on('pagehide', () => {
  toastr.info('界面已卸载');
});

// ❌ 错误：使用DOMContentLoaded
document.addEventListener("DOMContentLoaded", fn);

// ❌ 错误：在全局作用域执行代码
toastr.success('这会在每次导入时执行');
```

### 7.6 Vue开发规范

```typescript
// 优先使用Vue编写界面
// Vue Router必须使用createMemoryHistory()
const router = createRouter({
  history: createMemoryHistory(),
  routes: [...]
});

// 监听Vue响应式数据变化并同步到酒馆数据
watchEffect(() => {
  replaceVariables(klona(settings.value), { type: 'script', script_id: getScriptId() });
});

// 状态管理使用Pinia
export const useSettingsStore = defineStore('settings', () => {
  const settings = ref(Settings.parse(getVariables({ type: 'script', script_id: getScriptId() })));
  watchEffect(() => {
    replaceVariables(klona(settings.value), { type: 'script', script_id: getScriptId() });
  });
  return { settings };
});
```

### 7.7 获取界面所在楼层号

```typescript
// 前端界面中获取所在楼层的楼层号（推荐）
const message_id = getCurrentMessageId(); // 在消息iframe内使用

// 或者通过iframe名称获取
const message_id = getMessageId(getIframeName());
```

---

## 8. 脚本开发

### 8.1 项目判定

如果`src/xxx`文件夹中仅有`index.ts`文件，则它是脚本项目。

脚本以iframe的形式在酒馆后台运行，没有自己的界面，只有代码部分可供编写。

### 8.2 jQuery使用

脚本中的jQuery直接作用于整个酒馆页面而非仅作用于脚本所在的iframe：

```typescript
// ✅ 选择酒馆页面的body
$('body')

// ❌ 选择脚本iframe的body
$(document.body)
```

### 8.3 Vue组件挂载

当需要在脚本中向酒馆页面挂载Vue组件时：

```typescript
// 使用jQuery创建挂载位置
const $app = $('<div id="app"></div>');
$('body').append($app);

// 挂载Vue组件
app.mount($app[0]);
```

### 8.4 样式处理

由于脚本运行在iframe中，样式仅会应用于iframe内。向酒馆网页添加DOM时，需要将样式复制到酒馆网页的`<head>`中：

```typescript
export function teleport_style() {
  $(`<div>`)
    .attr('script_id', getScriptId())
    .append($(`head > style`, document).clone())
    .appendTo('head');
}

export function deteleport_style() {
  $(`head > div[script_id="${getScriptId()}"]`).remove();
}
```

### 8.5 脚本设置

使用脚本变量和Zod为用户提供自定义设置：

```typescript
const Settings = z.object({
  button_enabled: z.boolean().default(false),
  theme: z.enum(['light', 'dark']).default('light')
}).prefault({});

const settings = ref(Settings.parse(getVariables({ type: 'script', script_id: getScriptId() })));
```

### 8.6 按钮功能

脚本可以注册按钮事件：

```typescript
// 获取按钮事件类型
const eventType = getButtonEvent('按钮名');
eventOn(eventType, () => {
  console.log('按钮被点击了');
});

// 获取脚本按钮列表
const buttons = getScriptButtons();

// 替换按钮列表
replaceScriptButtons([
  { name: '开始', visible: true },
  { name: '设置', visible: true }
]);

// 追加不存在的按钮
appendInexistentScriptButtons([
  { name: '重新开始', visible: true }
]);
```

### 8.7 脚本信息

```typescript
// 获取脚本作者注释
const info = getScriptInfo();

// 替换脚本作者注释
replaceScriptInfo('新的脚本描述');
```

---

## 9. MVU变量框架

### 9.1 概述

MVU变量框架是一个独立的酒馆助手脚本，作用于消息楼层变量。它允许：
- 在世界书中设置消息楼层变量
- 在世界书或聊天记录中初始化消息楼层变量
- 用AI输出更新消息楼层变量

### 9.2 使用流程

```typescript
// 1. 等待初始化（必须）
await waitGlobalInitialized('Mvu');

// 2. 读取MVU数据
const data = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
// 或获取当前界面所在楼层的数据
const data = Mvu.getMvuData({ type: 'message', message_id: getMessageId(getIframeName()) });

// 3. 自行解析MVU命令（用于generate等不自动解析的场景）
const result = await Mvu.parseMessage(messageString, oldData);

// 4. 写回数据
await Mvu.replaceMvuData(newData, { type: 'message', message_id: 'latest' });

// 5. 重新加载初始变量
await Mvu.reloadInitVar(data);
```

### 9.3 事件系统

MVU提供以下事件：

```typescript
// 新开聊天对变量初始化时触发
eventOn(Mvu.events.VARIABLE_INITIALIZED, (variables, swipe_id) => {
  // variables: MvuData
  // swipe_id: swipes索引
});

// 某轮变量更新开始时触发
eventOn(Mvu.events.VARIABLE_UPDATE_STARTED, (variables) => {
  // variables: MvuData（更新前的数据）
});

// 对文本成功解析了所有更新命令时触发
eventOn(Mvu.events.COMMAND_PARSED, (variables, commands, message_content) => {
  // variables: MvuData
  // commands: 命令信息数组
  // message_content: 原始消息内容
});

// 某轮变量更新结束时触发
eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, (variables, variables_before_update) => {
  // variables: 更新后的MvuData
  // variables_before_update: 更新前的MvuData
});

// 即将用更新后的变量更新楼层时触发
eventOn(Mvu.events.BEFORE_MESSAGE_UPDATE, ({ variables, message_content }) => {
  // variables: MvuData
  // message_content: 将要更新到楼层的消息内容
});
```

### 9.4 数据结构

```typescript
type MvuData = {
  /** 已被mvu初始化initvar条目的世界书列表 */
  initialized_lorebooks: string[];
  /** 实际的变量数据 */
  stat_data: Record<string, any>;
};

type CommandInfo =
  | { type: 'set'; full_match: string; args: [path, new_value] | [path, expected_old, new_value]; reason: string }
  | { type: 'insert'; full_match: string; args: [path, value] | [path, index, value]; reason: string }
  | { type: 'delete'; full_match: string; args: [path] | [path, key]; reason: string }
  | { type: 'add'; full_match: string; args: [path, delta]; reason: string };
```

---

## 10. Chrome DevTools MCP

### 10.1 概述

Chrome DevTools MCP通过Model Context Protocol (MCP)为AI助手提供完整的Chrome DevTools功能访问权限，提供**6大类共26个工具功能**。

### 10.2 工具分类

#### 10.2.1 Input automation (8个工具) - 输入自动化

- `click` - 点击指定元素
- `drag` - 拖拽元素到目标位置
- `fill` - 在输入框输入文本或选择下拉选项
- `fill_form` - 批量填充多个表单元素
- `handle_dialog` - 处理浏览器弹出的对话框
- `hover` - 悬停在指定元素上
- `press_key` - 按键或组合键操作
- `upload_file` - 通过元素上传文件

#### 10.2.2 Navigation automation (6个工具) - 导航自动化

- `close_page` - 关闭指定索引的页面
- `list_pages` - 获取所有打开的页面列表
- `navigate_page` - 导航到URL或历史操作
- `new_page` - 创建新页面
- `select_page` - 选择页面作为上下文
- `wait_for` - 等待指定文本在页面上出现

#### 10.2.3 Emulation (2个工具) - 模拟

- `emulate` - 模拟CPU和网络条件
- `resize_page` - 调整页面窗口大小

#### 10.2.4 Performance (3个工具) - 性能分析

- `performance_analyze_insight` - 分析性能跟踪中的特定洞察
- `performance_start_trace` - 开始性能跟踪记录
- `performance_stop_trace` - 停止性能跟踪记录

#### 10.2.5 Network (2个工具) - 网络请求

- `get_network_request` - 获取指定的网络请求
- `list_network_requests` - 列出所有网络请求

#### 10.2.6 Debugging (5个工具) - 调试

- `evaluate_script` - 在当前页面执行JavaScript函数
- `get_console_message` - 根据ID获取控制台消息
- `list_console_messages` - 列出所有控制台消息
- `take_screenshot` - 截取页面或元素截图
- `take_snapshot` - 获取页面的文本快照（基于无障碍树）

### 10.3 典型工作流程

```typescript
// 1. 获取页面快照（获取元素uid）
take_snapshot({ verbose: true });

// 2. 导航到指定URL
navigate_page({ type: 'url', url: 'https://example.com' });

// 3. 等待页面加载
wait_for({ text: '欢迎', timeout: 5000 });

// 4. 填充表单
fill_form({
  elements: [
    { uid: 'element-1', value: '用户名' },
    { uid: 'element-2', value: '密码' }
  ]
});

// 5. 点击提交按钮
click({ uid: 'submit-button' });

// 6. 截取结果截图
take_screenshot({ format: 'png', fullPage: true });
```

---

## 11. 最佳实践

### 11.1 代码规范

**优先使用TypeScript而非JavaScript**
- ✅ 使用TypeScript提供更好的类型检查
- ✅ 利用接口定义和类型推断
- ❌ 避免使用any类型

**优先使用酒馆助手提供的接口**
- ✅ 使用`getChatMessages()`而非`SillyTavern.chat`
- ✅ 使用`getLorebookSettings()`而非直接操作酒馆变量
- ✅ 酒馆助手接口抽象层次更高，更符合TypeScript类型系统

### 11.2 数据管理

**使用Pinia + Zod管理状态**

```typescript
// 用Zod定义类型和默认值
const Settings = z.object({
  button_selected: z.boolean().default(false)
}).prefault({});

// 使用Pinia实现响应式读写
export const useSettingsStore = defineStore('settings', () => {
  const settings = ref(Settings.parse(getVariables({ type: 'script', script_id: getScriptId() })));

  watchEffect(() => {
    replaceVariables(klona(settings.value), { type: 'script', script_id: getScriptId() });
  });

  return { settings };
});
```

**去除Proxy层**

```typescript
// 当需要监听Vue响应式数据变化并存入酒馆数据时
watchEffect(() => {
  replaceVariables(klona(settings.value), { type: 'script', script_id: getScriptId() });
});
```

### 11.3 界面开发

**优先使用Vue编写界面**
- ✅ Vue比jQuery或DOM操作更简单
- ✅ 可使用Pinia、VueRouter和其他第三方库
- ❌ Vue Router的createRouter()不能写在`$(() => {})`中，必须在全局执行

**Vue Router配置**

```typescript
// ✅ 正确：使用createMemoryHistory()
const router = createRouter({
  history: createMemoryHistory(),
  routes: [...]
});
```

**多媒体资源处理**

```typescript
// 当有很多多媒体资源时，使用@pixi/react在.tsx中编写界面
// 使用pixi.js实现资源预先加载
```

### 11.4 重载机制

```typescript
// 完全重载前端界面或脚本（简单方式）
let chat_id = SillyTavern.getCurrentChatId?.();
eventOn(tavern_events.CHAT_CHANGED, (new_chat_id) => {
  if (chat_id !== new_chat_id) {
    chat_id = new_chat_id;
    reloadIframe(); // ✅ 推荐：使用reloadIframe()代替window.location.reload()
  }
});

// 或者使用window.location.reload()（功能相同，但会重置所有全局状态）
window.location.reload();
```

### 11.5 @pixi/react使用场景

```typescript
// 当有很多多媒体资源时，前端界面更像是一个完整的游戏
// 应该使用@pixi/react在.tsx中编写界面
// 并使用pixi.js实现资源预先加载等逻辑
```

---

## 12. 高级技巧

### 12.1 资源与CDN

- 首选 `https://testingcf.jsdelivr.net` 访问npm/GitHub资源
- 新增依赖优先用 `pnpm add` 让模板自动转CDN
- 免费字体可用 ZeoSeven Fonts，图标用 FontAwesome
- 注意色彩对比度，推荐 Adobe 色彩对比度检查器

### 12.2 前端界面职责

前端界面仅负责定位插入位置，不解析数据。数据解析在代码中使用 `getChatMessages` 等完成。可在 `.cursor/rules` 中追加自定义辅助规则扩展提示。

### 12.3 性能与加载

- 为减轻酒馆渲染卡顿，可把大块HTML换成外链加载
- 若需发布可自动更新的界面/脚本，使用 GitHub + jsdelivr 镜像域名
- 即使模板提到删除 `LimitChunkCountPlugin` 以分割，也请在充分理解影响后再调整

### 12.4 设计与原型

建议先用 Figma 做原型（可配合 Figma MCP），再按设计还原。保持移动端友好与高对比度可读性。

### 12.5 外部通信

可用 `socket.io-client` 等浏览器库与外部应用通信，大批量数据注意服务端 `maxHttpBufferSize`。

### 12.6 酒馆功能速查

@types 列出全部可用接口，先查文档/类型再编码，避免重复造轮子。

### 12.7 jQuery操作宿主

脚本可直接改酒馆页面元素，也可用 `tavern_events.CHAT_COMPLETION_PROMPT_READY` 等事件原地改提示词。数组需原地修改（如 `splice`），不要整体替换。

### 12.8 流程与流式界面

简单方案在前端界面内用 `generate` + `iframe_events.STREAM_TOKEN_RECEIVED_*` 做流式。进阶可隐藏原楼层，自建流式并监听 `MESSAGE_SEND`/`STREAM_TOKEN_RECEIVED`/`MESSAGE_RECEIVED`。

### 12.9 文件与构建选项

可用 `import './file?raw'` 直接拿本地文本。`// @obfuscate` 触发混淆，`// @no-ci` 可让模板 CI 跳过打包（谨慎使用，本仓库仍按需执行）。

---

## 📚 参考资料

### 官方文档

- [酒馆助手介绍](https://n0vi028.github.io/JS-Slash-Runner-Doc/guide/关于酒馆助手/介绍.html)
- [MVU变量框架](https://github.com/MagicalAstrogy/MagVarUpdate)
- [Chrome DevTools官方文档](https://developer.chrome.com/docs/devtools/)
- [Puppeteer文档](https://puppeteer.github.io/puppeteer/)
- [MCP协议规范](https://modelcontextprotocol.io/)

### 项目文件

- `/src/APP/` - 实际项目示例
- `/src/界面示例/` - 前端界面模板
- `/src/脚本示例/` - 脚本项目模板
- `/模板/**/新建为src文件夹中的文件夹` - 项目模板
- `/@types/` - 酒馆助手和酒馆API类型定义
- `/slash_command.txt` - STScript命令列表

### 关键配置文件

- `/webpack.config.ts` - 构建配置文件
- `/package.json` - 依赖管理
- `/pnpm-lock.yaml` - 锁定版本

---

## ⚠️ 重要注意事项

1. **谨慎修改webpack.config.ts** - 构建配置文件已优化，修改可能导致构建失败
2. **禁止超出@types接口** - 所有开发必须使用@types中定义的接口
3. **正确使用加载/卸载时机** - 使用jQuery而非DOMContentLoaded
4. **Vue Router必须使用MemoryHistory** - 前端界面和脚本都是iframe
5. **样式隔离处理** - 脚本向酒馆添加DOM时需特殊处理样式
6. **安全警告** - Chrome调试端口打开时避免浏览敏感网站
7. **使用waitGlobalInitialized** - 使用MVU等全局接口前必须先等待初始化
8. **iframe专用函数** - `getCurrentMessageId()` 只能在消息iframe内使用，`getScriptId()` 只能在脚本内使用
9. **重载选择** - 推荐使用 `reloadIframe()` 代替 `window.location.reload()`

---

**文档版本**: v2.1
**最后更新**: 2026-01-03
**维护者**: 酒馆助手开发团队

---

> 💡 **提示**: 本文档为AI助手专用开发规范，遵循此规范可以确保与酒馆助手的完美兼容性和最佳性能表现。
