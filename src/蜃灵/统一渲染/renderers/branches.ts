import type { RenderContext, ReplaceTarget } from '../types';
import { escapeHtml } from '../utils/escape';
import { getThemeMeta } from '../themes';

const BRANCH_BLOCK_RE = /<branches>[\s\S]*?<\/branches>/gi;
const DETAIL_RE = /<details>[\s\S]*?<summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/i;
const OPTION_RE = /^([A-Za-z\d])[.、:：]\s*(.+)$/;

interface BranchOption {
  key: string;
  text: string;
  full: string;
}

function parseBranch(source: string): { summary: string; options: BranchOption[] } | null {
  const detail = source.match(DETAIL_RE);
  if (!detail) return null;

  const summary = detail[1].trim() || '你的选择是……';
  const body = detail[2];
  const lines = body
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  const options: BranchOption[] = [];
  for (const line of lines) {
    const match = line.match(OPTION_RE);
    if (!match) continue;
    options.push({
      key: match[1],
      text: match[2].trim(),
      full: line,
    });
  }

  if (!options.length) return null;
  return { summary, options };
}

export function findBranchTargets(raw: string, messageId: number): ReplaceTarget[] {
  const targets: ReplaceTarget[] = [];
  for (const matched of raw.matchAll(BRANCH_BLOCK_RE)) {
    const source = matched[0];
    if (!source) continue;
    targets.push({
      messageId,
      tag: 'branch',
      source,
    });
  }
  return targets;
}

export function renderBranchCard(rawSource: string, ctx: RenderContext): string {
  const parsed = parseBranch(rawSource);
  if (!parsed) return rawSource;

  const theme = getThemeMeta('branch', ctx.selection.branch);

  const optionsHtml = parsed.options
    .map(option => {
      const payload = escapeHtml(option.full);
      return `
      <button class="sl-branch-btn" type="button" data-sl-branch="${payload}">
        <span class="sl-branch-key">${escapeHtml(option.key)}</span>
        <span class="sl-branch-text">${escapeHtml(option.text)}</span>
        <span class="sl-branch-arrow">▸</span>
      </button>`;
    })
    .join('');

  return `
<div class="sl-unified-card sl-branch-card sl-theme-branch-${theme.id}" data-sl-skin="branch" data-theme-id="${theme.id}">
  <div class="sl-card-inner">
    <div class="sl-card-head">
      <span class="sl-card-title">Option</span>
      <span class="sl-card-sub">${escapeHtml(parsed.summary)}</span>
    </div>
    <div class="sl-branch-list">
      ${optionsHtml}
    </div>
    <div class="sl-card-foot">点击后追加到输入框</div>
  </div>
</div>`.trim();
}
