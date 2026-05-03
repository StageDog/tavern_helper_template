import { getThemeSelection, setThemeSelection } from './state';
import { THEME_SETS, type ThemePart, type ThemeSelection } from './themes';
import type { RenderContext } from './types';
import { escapeHtml } from './utils/escape';

const MODAL_ID = 'sl-theme-modal';

function groupTitle(part: ThemePart): string {
  if (part === 'top') return '顶部状态栏';
  if (part === 'bottom') return '尾部状态栏';
  return '选项';
}

function buildPartSection(part: ThemePart, selection: ThemeSelection): string {
  const activeId = selection[part];
  const buttons = THEME_SETS[part]
    .map(theme => {
      const active = theme.id === activeId ? '1' : '0';
      return `
      <button type="button" class="sl-theme-btn" data-part="${part}" data-theme-id="${theme.id}" data-active="${active}">
        <span class="sl-theme-name">${escapeHtml(theme.name)}</span>
        <span class="sl-theme-hint">${escapeHtml(theme.hint)}</span>
      </button>`;
    })
    .join('');

  return `
    <section class="sl-modal-group">
      <div class="sl-modal-group-title">${escapeHtml(groupTitle(part))}</div>
      ${buttons}
    </section>`;
}

function buildModalHtml(selection: ThemeSelection): string {
  return `
  <div id="${MODAL_ID}">
    <div class="sl-modal-card">
      <div class="sl-modal-inner">
        <div class="sl-modal-head">
          <div class="sl-modal-title">蜃灵 · 统一渲染主题</div>
          <button type="button" class="sl-close-btn" title="关闭">×</button>
        </div>
        <div class="sl-modal-grid">
          ${buildPartSection('top', selection)}
          ${buildPartSection('bottom', selection)}
          ${buildPartSection('branch', selection)}
        </div>
      </div>
    </div>
  </div>`;
}

export function toggleThemeModal(refresh: (ctx: RenderContext) => void): void {
  const w = window.parent || window;
  const existed = w.document.getElementById(MODAL_ID);
  if (existed) {
    existed.remove();
    return;
  }

  const initial = getThemeSelection();
  const $modal = $(buildModalHtml(initial)).appendTo(w.document.body);

  const close = () => {
    $modal.remove();
  };

  $modal.on('click', event => {
    if (event.target === $modal[0]) {
      close();
    }
  });

  $modal.find('.sl-close-btn').on('click', close);

  $modal.find<HTMLButtonElement>('.sl-theme-btn').on('click', function () {
    const part = (this.getAttribute('data-part') ?? '') as ThemePart;
    const themeId = this.getAttribute('data-theme-id') ?? '';
    if (!(part in THEME_SETS) || !themeId) return;

    const current = getThemeSelection();
    const next: ThemeSelection = { ...current, [part]: themeId };
    const saved = setThemeSelection(next);

    $modal.find(`.sl-theme-btn[data-part="${part}"]`).attr('data-active', '0');
    $(this).attr('data-active', '1');

    refresh({ selection: saved });
  });
}
