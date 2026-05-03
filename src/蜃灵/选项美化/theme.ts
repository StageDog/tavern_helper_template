// ============================================================================
// 蜃灵 · 选项美化 · 主题状态
// ----------------------------------------------------------------------------
// 与 src/蜃灵/古卷书斋 中的卡片共用同一个 localStorage key，从而互相联动。
// 切换时会同步设置：
//   - 所有 [data-gjsz-skin] 元素的 data-theme（脚本模块挂载的元素）
//   - 古卷书斋远程导入卡片本身（它们也在监听同一 key 并自有切换逻辑）
// ============================================================================

const KEY = 'gjsz-shenling-theme';

export type ThemeName = 'dark' | 'light';

export function getTheme(): ThemeName {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function setTheme(t: ThemeName): void {
  try {
    localStorage.setItem(KEY, t);
  } catch {
    /* noop */
  }
  applyTheme(t);
}

/** 把主题应用到当前所有脚本模块挂载的元素 */
export function applyTheme(t: ThemeName): void {
  const w = window.parent || window;
  w.document.querySelectorAll('[data-gjsz-skin]').forEach(el => {
    el.setAttribute('data-theme', t);
  });
  // 通知正则导入的远程卡片们一起切换
  // 它们各自的 IIFE 里会去读 localStorage —— 这里发自定义事件让它们重读
  try {
    w.document.dispatchEvent(new CustomEvent('gjsz:theme-change', { detail: t }));
  } catch {
    /* noop */
  }
}

export function toggleTheme(): ThemeName {
  const next: ThemeName = getTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}
