// ============================================================================
// 蜃灵 · 选项美化 · <branches> 模块
// ----------------------------------------------------------------------------
// 处理形如：
//   <branches>
//     <details>
//       <summary>🧩你的选择是……</summary>
//       A.剧情推进50字内
//       B.关系推进50字内
//       ...
//     </details>
//   </branches>
//
// 渲染成可点击的选项卡，点击后把对应行追加到酒馆发送框（不替换已有内容）。
// ============================================================================

import { escapeHtml } from '../html';
import { appendToInput } from '../input';
import type { SkinModule } from '../registry';

interface ParsedOption {
  /** A / B / C / 1 / 2 ... */
  key: string;
  /** "剧情推进50字内" */
  text: string;
  /** "A.剧情推进50字内" —— 点击时被追加到输入框的原始整行 */
  full: string;
}

/** 匹配 "A. xxx" / "A、xxx" / "A: xxx" / "A：xxx" */
const OPTION_LINE = /^([A-Za-z\d])[.、:：]\s*(\S.*)$/;
const SUMMARY_HINT = /你的选择|选项|请选择|抉择|choice|option/i;

function parseOptions(detailsEl: HTMLDetailsElement): { summary: string; options: ParsedOption[] } {
  const summary = detailsEl.querySelector('summary')?.textContent?.trim() || '你的选择是……';
  // 复制一份，去掉 summary，剩下的 textContent 就是选项区原文
  const clone = detailsEl.cloneNode(true) as HTMLElement;
  clone.querySelector('summary')?.remove();
  const raw = clone.textContent || '';
  const lines = raw
    .split(/[\r\n]+/)
    .map(s => s.trim())
    .filter(Boolean);
  const options: ParsedOption[] = [];
  for (const line of lines) {
    const m = line.match(OPTION_LINE);
    if (!m) continue;
    options.push({ key: m[1], text: m[2].trim(), full: line });
  }
  return { summary, options };
}

function isLikelyBranchesBlock(summary: string, options: ParsedOption[]): boolean {
  if (options.length < 2) return false;
  if (SUMMARY_HINT.test(summary)) return true;
  // 兜底：如果选项足够多，也认为是分支块，避免漏掉未使用“你的选择”字样的卡
  return options.length >= 3;
}

function buildCard(summary: string, options: ParsedOption[], theme: 'dark' | 'light'): HTMLElement {
  const card = document.createElement('div');
  card.className = 'gjsz-branches';
  card.setAttribute('data-gjsz-skin', '');
  card.setAttribute('data-theme', theme);

  const optionsHTML = options
    .map(
      o => `
      <button class="gjsz-branch-opt" type="button" data-payload="${escapeHtml(o.full)}">
        <span class="gjsz-branch-key">${escapeHtml(o.key)}</span>
        <span class="gjsz-branch-text">${escapeHtml(o.text)}</span>
        <span class="gjsz-branch-arrow">▸</span>
      </button>`,
    )
    .join('');

  const emptyHTML = `<div class="gjsz-branch-empty">未捕获到选项</div>`;

  card.innerHTML = `
    <span class="gjsz-corner tl"></span>
    <span class="gjsz-corner tr"></span>
    <span class="gjsz-corner bl"></span>
    <span class="gjsz-corner br"></span>
    <div class="gjsz-branches-inner">
      <div class="gjsz-branches-head">
        <div>
          <span class="gjsz-branches-title">Optio</span>
          <span class="gjsz-branches-zh">${escapeHtml(summary)}</span>
        </div>
        <div class="gjsz-branches-mark">— 蜃灵 §IV —</div>
      </div>
      <div class="gjsz-branches-list">
        ${options.length ? optionsHTML : emptyHTML}
      </div>
      <div class="gjsz-branches-foot">点 击 任 一 项 · 追 加 到 输 入 框</div>
    </div>
  `;

  // 绑定点击 → 追加输入框
  card.querySelectorAll<HTMLButtonElement>('.gjsz-branch-opt').forEach(btn => {
    btn.addEventListener('click', ev => {
      ev.preventDefault();
      ev.stopPropagation();
      const payload = btn.getAttribute('data-payload') || '';
      appendToInput(payload);
      // 视觉反馈
      btn.setAttribute('data-flash', '1');
      setTimeout(() => btn.removeAttribute('data-flash'), 320);
    });
  });

  return card;
}

export const branchesModule: SkinModule = {
  name: 'branches',
  process(messageEl, ctx) {
    const branchEls = messageEl.querySelectorAll('branches');
    let replaced = 0;

    // 常规路径：<branches><details>...</details></branches>
    branchEls.forEach(branchEl => {
      const detailsEl = branchEl.querySelector('details') as HTMLDetailsElement | null;
      if (!detailsEl) return;
      const { summary, options } = parseOptions(detailsEl);
      if (!isLikelyBranchesBlock(summary, options)) return;
      const card = buildCard(summary, options, ctx.theme);
      branchEl.replaceWith(card);
      card.setAttribute('data-gjsz-rendered', '1');
      replaced += 1;
    });

    // 兜底路径：某些渲染链会剥离 <branches> 包裹，仅留下 <details>。
    if (replaced > 0) return;
    const detailsEls = messageEl.querySelectorAll('details');
    detailsEls.forEach(detailsEl => {
      const parentTag = detailsEl.parentElement?.tagName.toLowerCase();
      if (parentTag === 'branches') return;
      const { summary, options } = parseOptions(detailsEl);
      if (!isLikelyBranchesBlock(summary, options)) return;
      const card = buildCard(summary, options, ctx.theme);
      detailsEl.replaceWith(card);
      card.setAttribute('data-gjsz-rendered', '1');
      replaced += 1;
    });
  },
};
