// ============================================================================
// 蜃灵 · 选项美化 · 渲染调度器
// ----------------------------------------------------------------------------
// 监听消息渲染 / 更新事件，把 .mes_text 容器交给所有已注册模块。
// 模块自行幂等（已处理过的元素打了标记就跳过）。
// ============================================================================

import { getModules } from './registry';
import { getTheme } from './theme';

function processMessageById(messageId: number): void {
  if (!Number.isFinite(messageId) || messageId < 0) return;
  const w = window.parent || window;
  let $msg = $(`#chat .mes[mesid="${messageId}"] .mes_text`, w.document);
  // 兼容不同主题/插件下消息正文节点 class 差异
  if (!$msg.length) {
    $msg = $(`#chat .mes[mesid="${messageId}"] [class*="mes_text"]`, w.document);
  }
  if (!$msg.length) return;
  const ctx = { theme: getTheme(), messageId };
  const mods = getModules();
  $msg.each((_, el) => {
    mods.forEach(m => {
      try {
        m.process(el as HTMLElement, ctx);
      } catch (e) {
        console.warn(`[蜃灵选项美化][${m.name}]`, e);
      }
    });
  });
}

function processAllExisting(): void {
  const w = window.parent || window;
  $('#chat .mes', w.document).each((_, el) => {
    const id = parseInt($(el).attr('mesid') || '', 10);
    if (!Number.isNaN(id)) processMessageById(id);
  });
}

export function initRender(): { destroy: () => void } {
  const handlers: Array<{ event: string; fn: (id: number) => void }> = [];

  const onRender = (id: number) => {
    processMessageById(id);
  };
  const onUpdate = (id: number) => {
    if (!Number.isFinite(id) || id < 0) return;
    // 重渲染会重建 .mes_text，需要把模块的 data-gjsz-rendered 标记一并清掉
    const w = window.parent || window;
    $(`#chat .mes[mesid="${id}"] [data-gjsz-rendered]`, w.document).removeAttr('data-gjsz-rendered');
    processMessageById(id);
  };

  eventOn(tavern_events.CHARACTER_MESSAGE_RENDERED, onRender);
  handlers.push({ event: tavern_events.CHARACTER_MESSAGE_RENDERED, fn: onRender });

  eventOn(tavern_events.USER_MESSAGE_RENDERED, onRender);
  handlers.push({ event: tavern_events.USER_MESSAGE_RENDERED, fn: onRender });

  eventOn(tavern_events.MESSAGE_UPDATED, onUpdate);
  handlers.push({ event: tavern_events.MESSAGE_UPDATED, fn: onUpdate });

  eventOn(tavern_events.MESSAGE_SWIPED, onRender);
  handlers.push({ event: tavern_events.MESSAGE_SWIPED, fn: onRender });

  // 脚本启用后，处理一遍当前已经渲染好的消息
  setTimeout(processAllExisting, 50);

  return {
    destroy: () => {
      handlers.forEach(h => {
        try {
          eventRemoveListener(h.event, h.fn as any);
        } catch {
          /* noop */
        }
      });
    },
  };
}
