// ============================================================================
// 蜃灵 · 选项美化 · 模块注册中心
// ----------------------------------------------------------------------------
// 每一种「类别美化」都以 SkinModule 形式注册，render.ts 会按消息渲染顺序
// 把消息 DOM 交给所有模块 process 一次。
// 新增类别只需要在 modules/ 下新建一个文件，导出一个 SkinModule，
// 然后在 index.ts 里 registerModule 即可。
// ============================================================================

export interface SkinContext {
  /** 当前主题 */
  theme: 'dark' | 'light';
  /** 楼层 id */
  messageId: number;
}

export interface SkinModule {
  /** 模块名（仅用于日志/排错） */
  name: string;
  /**
   * 处理一条已渲染的消息 DOM 节点（通常是 .mes_text 容器）。
   * 模块自行判断要不要处理（找自己关心的标签）。
   * 重复调用要幂等（用 data-gjsz-rendered 之类的标记防重）。
   */
  process: (messageEl: HTMLElement, ctx: SkinContext) => void;
}

const registry: SkinModule[] = [];

export function registerModule(m: SkinModule): void {
  registry.push(m);
}

export function getModules(): SkinModule[] {
  return registry;
}
