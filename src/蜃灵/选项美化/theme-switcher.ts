// ============================================================================
// 蜃灵 · 选项美化 · 主题切换浮窗
// ----------------------------------------------------------------------------
// QR 按钮触发，打开一个固定在右上角的小卡片，可以选择当前主题。
// 与 theme.ts 配合，能够同时切换：
//   1) 脚本注入的元素（[data-gjsz-skin]）
//   2) 古卷书斋远程卡片（它们读同一个 localStorage key）
// ============================================================================

import { escapeHtml } from './html';
import { getTheme, setTheme, type ThemeName } from './theme';

const PANEL_ID = 'gjsz-theme-switcher';

interface ThemeOption {
  value: ThemeName;
  badge: string;
  label: string;
  hint: string;
}

const THEMES: ThemeOption[] = [
  { value: 'light', badge: '☀ DIES', label: '复古怀旧', hint: '羊皮纸 · 沉香褐' },
  { value: 'dark', badge: '☾ NOX', label: 'Dark Academia', hint: '深木 · 烛光金' },
];

export function toggleSwitcher(): void {
  const w = window.parent || window;
  const existing = w.document.getElementById(PANEL_ID);
  if (existing) {
    existing.remove();
    return;
  }
  open();
}

function open(): void {
  const w = window.parent || window;
  const cur = getTheme();

  const itemsHTML = THEMES.map(
    t => `
    <button class="gjsz-sw-opt" type="button" data-theme-set="${t.value}" data-active="${t.value === cur ? '1' : '0'}">
      <span class="gjsz-sw-badge">${escapeHtml(t.badge)}</span>
      <span class="gjsz-sw-text">
        <span class="gjsz-sw-name">${escapeHtml(t.label)}</span>
        <span class="gjsz-sw-hint">${escapeHtml(t.hint)}</span>
      </span>
      <span class="gjsz-sw-mark">✦</span>
    </button>`,
  ).join('');

  const html = `
    <div id="${PANEL_ID}" data-gjsz-skin data-theme="${cur}">
      <div class="gjsz-sw-corner tl"></div>
      <div class="gjsz-sw-corner tr"></div>
      <div class="gjsz-sw-corner bl"></div>
      <div class="gjsz-sw-corner br"></div>
      <div class="gjsz-sw-inner">
        <div class="gjsz-sw-head">
          <span class="gjsz-sw-title">Lumen</span>
          <span class="gjsz-sw-zh">蜃 灵 · 主 题</span>
          <button class="gjsz-sw-close" type="button" title="关闭">×</button>
        </div>
        <div class="gjsz-sw-body">
          ${itemsHTML}
        </div>
        <div class="gjsz-sw-foot">— 蜃灵 §V · Lumen Mutator —</div>
      </div>
    </div>
  `;

  const $panel = $(html).appendTo(w.document.body);

  $panel.find('.gjsz-sw-close').on('click', () => $panel.remove());

  $panel.find('.gjsz-sw-opt').on('click', function () {
    const t = ($(this).attr('data-theme-set') as ThemeName) || 'dark';
    setTheme(t);
    // 同步浮窗自身高亮
    $panel.attr('data-theme', t);
    $panel.find('.gjsz-sw-opt').attr('data-active', '0');
    $(this).attr('data-active', '1');
  });

  // 点击背景空白处关闭（点卡片内部不关）
  setTimeout(() => {
    const onDocClick = (ev: MouseEvent) => {
      if (!(ev.target as HTMLElement).closest(`#${PANEL_ID}`)) {
        $panel.remove();
        w.document.removeEventListener('click', onDocClick, true);
      }
    };
    w.document.addEventListener('click', onDocClick, true);
  }, 0);
}
