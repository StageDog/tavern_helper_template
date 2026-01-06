# Trae 项目开发规范

## 项目概述

本项目是酒馆助手 (Tavern Helper) 的前端界面和脚本开发模板,用于在 SillyTavern 中创建交互式界面和功能脚本。

### 技术栈
- **语言**: TypeScript 6.0.0-dev
- **框架**: Vue 3、React 19、Pinia 3、Vue Router 4
- **构建工具**: Webpack 5
- **样式**: TailwindCSS 4、SCSS
- **工具库**: jQuery、jQuery UI、Lodash、GSAP、Zod 4、PIXI.js
- **包管理器**: pnpm

### 核心特性
- 类型安全的 TypeScript 开发
- 支持 Vue 3 和 React 19 双框架
- MVU 变量框架集成
- 自动化构建和 CDN 优化
- 完整的类型定义 (@types)

---

## 项目结构

```
tavern_helper_template/
├── .trae/                    # Trae 项目规范 (本文件)
├── .cursor/                   # Cursor AI 规则
├── .roo/                     # Roo AI 规则
├── .vscode/                  # VS Code 配置
├── @types/                   # 酒馆和酒馆助手类型定义
├── dist/                     # 构建输出目录
├── src/                      # 源代码目录
│   ├── 脚本示例/             # 脚本示例项目
│   │   └── index.ts         # 脚本入口文件
│   ├── 界面示例/             # 前端界面示例项目
│   │   ├── index.html       # 界面 HTML 入口
│   │   ├── index.ts         # 界面 TypeScript 入口
│   │   └── store.ts         # Pinia 状态管理
│   ├── 寒冬末日/             # 完整示例项目
│   ├── 美人团/               # 完整示例项目
│   ├── 角色卡示例/           # 完整示例项目
│   └── util/                 # 通用工具函数
│       ├── common.ts         # 通用工具
│       └── script.ts         # 脚本工具
├── 初始模板/                 # 项目模板
├── package.json              # 项目配置
├── tsconfig.json             # TypeScript 配置
├── eslint.config.mjs         # ESLint 配置
├── .prettierrc              # Prettier 配置
├── tailwind.config.js        # TailwindCSS 配置
└── webpack.config.ts         # Webpack 配置 (禁止修改)
```

### 项目类型判定

**前端界面项目**: 文件夹中同时包含 `index.ts` 和 `index.html`
**脚本项目**: 文件夹中仅包含 `index.ts`

---

## 开发规范

### TypeScript 规范

#### 1. 类型安全
- **强制使用 TypeScript**,禁止使用 JavaScript
- 启用严格模式 (`strict: true`)
- 禁止使用 `any` 类型,使用 `unknown` 或具体类型替代
- 使用 Zod 进行运行时数据验证

```typescript
import { z } from 'zod';

const SettingsSchema = z.object({
  enabled: z.boolean().default(false),
  threshold: z.coerce.number().min(0).max(100).default(50),
});

type Settings = z.infer<typeof SettingsSchema>;
```

#### 2. 类型导入
- 优先使用类型导入 (`import type`)
- 使用 `@types` 目录中的类型定义
- 禁止超出 `@types` 目录定义接口

```typescript
import type { ChatMessage } from '@types/function/chat_message';
import { getChatMessages } from '@types/function/chat_message';
```

#### 3. 变量声明
- 优先使用 `const`,需要重新赋值时使用 `let`
- 禁止使用 `var`
- 使用解构赋值简化代码

```typescript
const { enabled, threshold } = settings;
const [count, setCount] = useState(0);
```

### Vue 3 规范

#### 1. 组件设计
- 使用 Composition API (`<script setup>`)
- 使用 TypeScript 定义 Props 和 Emits
- 使用 Pinia 进行状态管理

```vue
<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue';
import { useSettingsStore } from './store';

const props = defineProps<{
  value: number;
}>();

const emit = defineEmits<{
  update: [value: number];
}>();

const store = useSettingsStore();
const localValue = ref(props.value);

watchEffect(() => {
  emit('update', localValue.value);
});
</script>
```

#### 2. 响应式数据处理
- 使用 `ref` 处理基本类型
- 使用 `reactive` 处理对象
- 使用 `computed` 计算派生值
- 使用 `watchEffect` 自动追踪依赖

```typescript
const count = ref(0);
const user = reactive({ name: '', age: 0 });
const doubleCount = computed(() => count.value * 2);

watchEffect(() => {
  console.log(`Count: ${count.value}`);
});
```

#### 3. 样式处理
- 优先使用 TailwindCSS
- 复杂样式使用 SCSS (`<style lang="scss">`)
- 使用 Scoped 样式避免污染

```vue
<template>
  <div class="p-4 bg-blue-500 rounded-lg">
    <span class="text-white">{{ message }}</span>
  </div>
</template>

<style scoped lang="scss">
.custom-class {
  @apply flex items-center justify-center;
}
</style>
```

### React 19 规范

#### 1. 函数组件
- 使用函数组件和 Hooks
- 使用 TypeScript 定义 Props 类型
- 使用 `@pixi/react` 处理多媒体内容

```typescript
import { useState, useEffect } from 'react';
import { Stage, Sprite } from '@pixi/react';

interface Props {
  value: number;
  onChange: (value: number) => void;
}

export function Counter({ value, onChange }: Props) {
  const [count, setCount] = useState(value);

  useEffect(() => {
    onChange(count);
  }, [count, onChange]);

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>+</button>
      <span>{count}</span>
    </div>
  );
}
```

### jQuery 规范

#### 1. DOM 操作
- 使用 `$()` 选择元素
- 使用链式调用提高可读性
- 优先使用事件委托

```typescript
$(() => {
  $('#app').on('click', '.button', function() {
    $(this).toggleClass('active');
  });
});
```

#### 2. 脚本中的 jQuery
- 脚本中的 jQuery 作用于整个酒馆页面
- 使用 `window.parent.$` 获取父页面的 jQuery

```typescript
const $ = window.parent.$ as JQueryStatic;
```

---

## 代码风格

### ESLint 配置

项目使用 ESLint 进行代码检查,配置文件: `eslint.config.mjs`

**主要规则**:
- 禁止使用 `var` (`no-var: error`)
- 禁止重复声明 (`no-redeclare: off`)
- 禁止未使用的变量 (`@typescript-eslint/no-unused-vars: off`)
- 强制使用 `const` (`prefer-const: warn`)
- 禁止 Yoda 条件 (`yoda: error`)

**运行检查**:
```bash
pnpm lint        # 检查代码
pnpm lint:fix    # 自动修复
```

### Prettier 配置

项目使用 Prettier 进行代码格式化,配置文件: `.prettierrc`

**配置项**:
```json
{
  "arrowParens": "avoid",
  "bracketSpacing": true,
  "printWidth": 120,
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "useTabs": false
}
```

**运行格式化**:
```bash
pnpm format      # 格式化代码
```

### 代码格式示例

```typescript
import { ref, computed } from 'vue';
import { z } from 'zod';

const Schema = z.object({
  name: z.string(),
  age: z.coerce.number(),
});

type Data = z.infer<typeof Schema>;

const data = ref<Data>({ name: '', age: 0 });
const isAdult = computed(() => data.value.age >= 18);

async function fetchData() {
  const response = await fetch('/api/data');
  const result = await response.json();
  data.value = Schema.parse(result);
}
```

---

## 构建流程

### Webpack 配置

**重要**: `webpack.config.ts` 是项目的构建配置文件,**禁止修改**

该文件已配置:
- Vue Loader (Vue SFC 编译)
- TypeScript Loader (TS 文件编译)
- SCSS Loader (样式编译和提取)
- MiniCssExtractPlugin (CSS 提取)
- HtmlWebpackPlugin (HTML 打包)
- VueUse 自动导入
- 代码混淆和压缩优化

### 构建命令

```bash
pnpm build:dev    # 开发模式构建
pnpm build        # 生产模式构建
pnpm watch        # 监听文件变化自动构建
```

### CDN 资源引用

**国内访问优化**:
- 使用 `https://testingcf.jsdelivr.net` 镜像
- 不推荐使用 `https://cdn.jsdelivr.net` (国内可能无法访问)

**通过 pnpm 添加第三方库 (推荐)**:
```bash
pnpm add lodash
pnpm add gsap
```

Webpack 会自动将第三方库转换为 CDN 链接,避免重复打包。

**手动引用 CDN 资源**:
```typescript
import something from 'https://testingcf.jsdelivr.net/npm/package-name@version/+esm';
```

### 特殊导入方式

#### 导入文件内容
```typescript
import htmlContent from './file.html?raw';
import jsonContent from './file.json?raw';
import jsContent from './script.ts?raw';
import cssContent from './style.scss?raw';
```

#### 导入 Markdown
```typescript
import markdown from './file.md';
```

#### 导入 Vue 组件
```typescript
import Component from './Component.vue';
```

---

## 酒馆交互

### @types 接口使用规范

**@types 目录限制**:
- `@types` 目录包含所有酒馆和酒馆助手提供的接口定义
- **禁止超出** `@types` 目录定义的函数和接口
- 不得自建接口或使用未定义的全局函数

**核心接口**:

**function/ 目录**:
- `variables.d.ts` - 变量操作: `getVariables`, `replaceVariables`, `klona`
- `chat_message.d.ts` - 消息处理: `getChatMessages`, `sendMessage`
- `slash.d.ts` - STScript 命令: `triggerSlash`
- `script.d.ts` - 脚本管理: `getScriptId`, `eventOn`
- `builtin.d.ts` - 内置工具: `toastr`, `$`, `jQuery`
- `generate.d.ts` - 内容生成: `generate`
- `character.d.ts` - 角色卡: `getCurrentCharacterId`, `getCharacterCard`
- `global.d.ts` - 全局 API: `getIframeName`, `window`, `document`
- `audio.d.ts` - 音频播放: `playAudio`
- `lorebook.d.ts` - 世界书: `replaceWorldbook`

**iframe/ 目录**:
- `exported.sillytavern.d.ts` - 酒馆原生 API
- `exported.tavernhelper.d.ts` - 酒馆助手 API
- `exported.mvu.d.ts` - MVU 变量框架: `Mvu.getMvuData`, `Mvu.parseMessage`
- `exported.ejstemplate.d.ts` - EJS 模板引擎
- `event.d.ts` - 事件系统: `tavern_events`
- `script.d.ts` - 脚本框架: `waitForInit`

### 变量操作

```typescript
import { getVariables, replaceVariables, klona } from '@types/function/variables';
import { getScriptId } from '@types/function/script';

const Settings = z.object({
  enabled: z.boolean().default(false),
});

const settings = ref(
  Settings.parse(
    getVariables({ type: 'script', script_id: getScriptId() })
  )
);

watchEffect(() => {
  replaceVariables(
    klona(settings.value),
    { type: 'script', script_id: getScriptId() }
  );
});
```

### 消息处理

```typescript
import { getChatMessages, getCurrentMessageId } from '@types/function/chat_message';

const messages = getChatMessages(getCurrentMessageId());
```

### 事件监听

```typescript
import { eventOn, getButtonEvent } from '@types/function/script';
import { tavern_events } from '@types/iframe/event';

eventOn(getButtonEvent('按钮名'), () => {
  console.log('按钮被点击了');
});

eventOn(tavern_events.CHAT_CHANGED, (chatId: string) => {
  console.log('聊天已切换:', chatId);
});
```

### MVU 变量框架

MVU (Model-View-Update) 是基于 Zod Schema 的变量管理框架。

**核心特性**:
- 类型安全 (Zod 4.x)
- 运行时验证
- JSON Patch 标准更新 (RFC 6902)
- 幂等操作支持

**使用示例**:
```typescript
import { Mvu } from '@types/iframe/exported.mvu';

const mvuData = Mvu.getMvuData();
const parsed = Mvu.parseMessage(message);
```

**MVU 系统组件**:
1. 变量结构设计 (Zod 脚本)
2. 变量初始化 (YAML)
3. 变量更新规则 (YAML)
4. 变量处理指令集 (YAML)
5. 动态内容展示 (EJS)
6. HTML 状态展示

详细文档见: `.cursor/rules/MVU组件包/`

---

## 最佳实践

### 1. 性能优化

#### 代码分割
```typescript
const LazyComponent = defineAsyncComponent(() => import('./LazyComponent.vue'));
```

#### 防抖和节流
```typescript
import { useDebounceFn } from '@vueuse/core';

const { run: debouncedSave } = useDebounceFn(() => {
  saveData();
}, 300);
```

#### 资源预加载
```typescript
import { Assets } from 'pixi.js';

await Assets.load('/assets/image.png');
```

### 2. 错误处理

#### Zod 验证
```typescript
import { prettifyErrorWithInput } from '@/util/common';

try {
  const data = Schema.parse(input);
} catch (error) {
  if (error instanceof z.ZodError) {
    toastr.error(prettifyErrorWithInput(error));
  }
}
```

#### 异步错误
```typescript
try {
  await fetchData();
} catch (error) {
  console.error('获取数据失败:', error);
  toastr.error('操作失败,请重试');
}
```

### 3. 类型安全

#### 避免类型断言
```typescript
const element = document.getElementById('app');
if (element) {
  element.textContent = 'Hello';
}
```

#### 使用类型守卫
```typescript
function isString(value: unknown): value is string {
  return typeof value === 'string';
}
```

### 4. 代码复用

#### 使用工具函数
```typescript
import { assignInplace, chunkBy, uuidv4 } from '@/util/common';

const array: number[] = [];
assignInplace(array, [1, 2, 3]);
const chunks = chunkBy(array, (a, b) => Math.abs(a - b) <= 1);
const id = uuidv4();
```

#### 使用 Composables
```typescript
export function useCounter(initialValue = 0) {
  const count = ref(initialValue);
  const increment = () => count.value++;
  const decrement = () => count.value--;
  return { count, increment, decrement };
}
```

### 5. 样式最佳实践

#### 优先使用 TailwindCSS
```vue
<div class="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <span class="text-lg font-semibold">标题</span>
</div>
```

#### 使用 SCSS 变量
```scss
$primary-color: #3b82f6;

.button {
  background-color: $primary-color;
}
```

#### 响应式设计
```vue
<div class="w-full aspect-video">
  <img src="image.jpg" class="w-full h-full object-cover" />
</div>
```

---

## 工作流程

### 开发流程

1. **创建项目**
   - 复制 `初始模板/` 中的模板
   - 重命名文件夹为项目名称
   - 根据需求修改代码

2. **开发调试**
   ```bash
   pnpm watch    # 启动监听模式
   ```
   - 修改代码后自动重新构建
   - 在酒馆中测试功能

3. **代码检查**
   ```bash
   pnpm lint        # 检查代码规范
   pnpm format      # 格式化代码
   ```

### 测试流程

1. **功能测试**
   - 在酒馆中加载前端界面或脚本
   - 测试所有功能是否正常
   - 检查控制台是否有错误

2. **兼容性测试**
   - 测试不同浏览器兼容性
   - 测试不同酒馆版本兼容性

3. **性能测试**
   - 检查加载时间
   - 检查内存占用
   - 检查渲染性能

### 打包流程

1. **生产构建**
   ```bash
   pnpm build    # 生产模式构建
   ```
   - 代码压缩和混淆
   - 生成到 `dist/` 目录

2. **验证构建**
   - 检查 `dist/` 目录内容
   - 在酒馆中测试构建产物

### 发布流程

1. **提交代码**
   ```bash
   git add .
   git commit -m "描述"
   git push
   ```

2. **自动打包**
   - GitHub Actions 自动运行 `bundle.yaml`
   - 自动构建并更新 `dist/` 目录

3. **使用 CDN**
   - 通过 jsdelivr CDN 访问构建产物
   - 示例: `https://testingcf.jsdelivr.net/gh/username/repo/dist/项目名/index.html`

---

## 常见问题

### Q1: 如何添加新的第三方库?

```bash
pnpm add package-name
```

Webpack 会自动处理打包和 CDN 转换。

### Q2: 如何调试前端界面?

1. 打开浏览器开发者工具
2. 切换到 iframe 的上下文
3. 在 Console 中查看日志

### Q3: 如何处理样式冲突?

- 使用 Scoped 样式
- 使用 CSS Modules
- 使用 TailwindCSS 工具类

### Q4: 如何优化加载性能?

- 使用代码分割
- 预加载关键资源
- 使用 CDN 加速
- 压缩和混淆代码

### Q5: 如何处理类型错误?

- 检查 `@types` 目录中的类型定义
- 使用 `z.infer` 推断类型
- 使用类型守卫确保类型安全

---

## 附录

### 有用的命令

```bash
pnpm build:dev      # 开发模式构建
pnpm build          # 生产模式构建
pnpm watch          # 监听模式
pnpm format         # 格式化代码
pnpm lint           # 检查代码
pnpm lint:fix       # 自动修复
pnpm dump           # 生成 Schema
pnpm sync           # 同步模板
```

### 相关文档

- [酒馆助手文档](https://n0vi028.github.io/JS-Slash-Runner-Doc/)
- [Vue 3 文档](https://vuejs.org/)
- [React 19 文档](https://react.dev/)
- [Zod 文档](https://zod.dev/)
- [TailwindCSS 文档](https://tailwindcss.com/)
- [项目 README](./README.md)

### 联系方式

如有问题,请提交 Issue 或 Pull Request。
