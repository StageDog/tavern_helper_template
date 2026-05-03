// ============================================================================
// 蜃灵 · 选项美化 · 输入框追加工具
// ----------------------------------------------------------------------------
// 用于把点击的选项文本拼接到酒馆发送框（#send_textarea）末尾，
// 不替换用户已有内容；自动加换行；并触发 input 事件让酒馆自适应高度。
// ============================================================================

export function appendToInput(text: string): void {
  if (!text) return;

  const w = window.parent || window;
  const ta = w.document.getElementById('send_textarea') as HTMLTextAreaElement | null;
  if (!ta) {
    toastr?.warning?.('找不到酒馆发送框 #send_textarea，无法追加选项');
    return;
  }

  const cur = ta.value || '';
  let prefix = '';
  if (cur.length > 0 && !/[\s\n]$/.test(cur)) {
    prefix = '\n';
  }
  ta.value = cur + prefix + text;

  // 触发 input 事件，让 SillyTavern 自适应高度 / 同步草稿
  ta.dispatchEvent(new Event('input', { bubbles: true }));
  ta.dispatchEvent(new Event('change', { bubbles: true }));

  // 滚到末尾、聚焦
  try {
    ta.focus();
    ta.setSelectionRange(ta.value.length, ta.value.length);
  } catch {
    /* noop */
  }
}
