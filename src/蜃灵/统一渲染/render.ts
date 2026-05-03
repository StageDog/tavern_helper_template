import { findBranchTargets, renderBranchCard } from './renderers/branches';
import { findBottomTarget, renderBottomBar } from './renderers/bottom-bar';
import { findTopTarget, renderTopBar } from './renderers/top-bar';
import type { RenderContext } from './types';

const RENDER_FLAG = 'data-sl-unified-rendered';
const LEGACY_TOKEN_RE = /(?:__)?SL_UNIFIED_TOKEN_(\d+)(?:__)?/g;

function logRenderedSummary(
  messageId: number,
  displayHtmlLength: number,
  classCount: number,
  dataThemeCount: number,
  classThemeCount: number,
): void {
  console.info(
    `[蜃灵统一渲染][render] rendered messageId=${messageId} htmlLength=${displayHtmlLength} classCount=${classCount} dataThemeCount=${dataThemeCount} classThemeCount=${classThemeCount}`,
  );
}

function injectByTokens(
  raw: string,
  ctx: RenderContext,
  messageId: number,
): { nextRaw: string; htmlByToken: string[]; tokenPrefix: string } {
  let nextRaw = raw;
  const htmlByToken: string[] = [];
  const tokenPrefix = `SLTK${messageId}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

  const insertToken = (html: string): string => {
    const index = htmlByToken.push(html) - 1;
    return `@@${tokenPrefix}_${index}@@`;
  };

  const topTarget = findTopTarget(nextRaw, messageId);
  if (topTarget) {
    nextRaw = nextRaw.replace(topTarget.source, insertToken(renderTopBar(topTarget.source, ctx)));
  }

  const bottomTarget = findBottomTarget(nextRaw, messageId);
  if (bottomTarget) {
    nextRaw = nextRaw.replace(bottomTarget.source, insertToken(renderBottomBar(bottomTarget.source, ctx)));
  }

  const branchTargets = findBranchTargets(nextRaw, messageId);
  branchTargets.forEach(target => {
    nextRaw = nextRaw.replace(target.source, insertToken(renderBranchCard(target.source, ctx)));
  });

  if (topTarget || bottomTarget || branchTargets.length > 0) {
    console.info(
      `[蜃灵统一渲染][render] matched messageId=${messageId} top=${Boolean(topTarget)} bottom=${Boolean(bottomTarget)} branches=${branchTargets.length} changed=${nextRaw !== raw}`,
    );
  }

  return { nextRaw, htmlByToken, tokenPrefix };
}

function replaceByIndexToken(displayHtml: string, re: RegExp, htmlByToken: string[]): string {
  return displayHtml.replace(re, (_all, idxText: string) => {
    const idx = Number(idxText);
    if (!Number.isFinite(idx) || idx < 0 || idx >= htmlByToken.length) return _all;
    return htmlByToken[idx] ?? _all;
  });
}

function restoreTokens(displayHtml: string, htmlByToken: string[], tokenPrefix: string): string {
  const currentTokenRe = new RegExp(`@@${tokenPrefix}_(\\d+)@@`, 'g');
  let restored = replaceByIndexToken(displayHtml, currentTokenRe, htmlByToken);
  restored = replaceByIndexToken(restored, LEGACY_TOKEN_RE, htmlByToken);
  return restored;
}

function processMessage(messageId: number, ctx: RenderContext): void {
  if (!Number.isFinite(messageId) || messageId < 0) return;
  const messages = getChatMessages(messageId);
  if (!messages.length) return;

  const raw = messages[0].message ?? '';
  if (!raw) return;

  const { nextRaw, htmlByToken, tokenPrefix } = injectByTokens(raw, ctx, messageId);
  if (!htmlByToken.length || nextRaw === raw) return;

  const formatted = formatAsDisplayedMessage(nextRaw, { message_id: messageId });
  const displayHtml = restoreTokens(formatted, htmlByToken, tokenPrefix);

  const $display = retrieveDisplayedMessage(messageId);
  if (!$display.length) {
    console.warn(`[蜃灵统一渲染][render] display node not found messageId=${messageId}`);
    return;
  }

  $display.html(displayHtml);
  $display.attr(RENDER_FLAG, '1');

  const classCount = $display.find('.sl-unified-card').length;
  const dataThemeCount = $display.find('.sl-unified-card[data-theme-id]').length;
  const classThemeCount = $display.find(
    '.sl-unified-card[class*="sl-theme-top-"], .sl-unified-card[class*="sl-theme-bottom-"], .sl-unified-card[class*="sl-theme-branch-"]',
  ).length;

  logRenderedSummary(messageId, displayHtml.length, classCount, dataThemeCount, classThemeCount);
}

function processAll(ctx: RenderContext): void {
  const lastId = getLastMessageId();
  if (!Number.isFinite(lastId) || lastId < 0) {
    console.warn(`[蜃灵统一渲染][render] processAll skipped: invalid lastId=${String(lastId)}`);
    return;
  }

  console.info(
    `[蜃灵统一渲染][render] processAll start lastId=${lastId} selection(top=${ctx.selection.top},bottom=${ctx.selection.bottom},branch=${ctx.selection.branch})`,
  );

  for (let id = 0; id <= lastId; id++) {
    processMessage(id, ctx);
  }

  console.info(`[蜃灵统一渲染][render] processAll done lastId=${lastId}`);
}

export function bindBranchClickAppender(): { destroy: () => void } {
  const w = window.parent || window;
  const onClick = (ev: MouseEvent) => {
    const target = ev.target as HTMLElement | null;
    if (!target) return;

    const btn = target.closest<HTMLButtonElement>('.sl-branch-btn[data-sl-branch]');
    if (!btn) return;

    ev.preventDefault();
    ev.stopPropagation();

    const payload = btn.getAttribute('data-sl-branch') ?? '';
    if (!payload) return;

    const ta = w.document.getElementById('send_textarea') as HTMLTextAreaElement | null;
    if (!ta) {
      toastr.warning('未找到输入框 #send_textarea');
      return;
    }

    const prefix = ta.value && !/[\s\n]$/.test(ta.value) ? '\n' : '';
    ta.value = `${ta.value}${prefix}${payload}`;
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    ta.dispatchEvent(new Event('change', { bubbles: true }));

    try {
      ta.focus();
      ta.setSelectionRange(ta.value.length, ta.value.length);
    } catch {
      // noop
    }
  };

  w.document.addEventListener('click', onClick, true);
  return {
    destroy: () => w.document.removeEventListener('click', onClick, true),
  };
}

export function initRenderer(getCtx: () => RenderContext): { rerenderAll: () => void; destroy: () => void } {
  const bindings: EventOnReturn[] = [];

  const rerenderOne = (messageId: number) => {
    console.info(`[蜃灵统一渲染][render] rerenderOne event messageId=${messageId}`);
    processMessage(messageId, getCtx());
  };

  const rerenderAll = () => {
    console.info('[蜃灵统一渲染][render] rerenderAll event');
    processAll(getCtx());
  };

  bindings.push(eventOn(tavern_events.CHARACTER_MESSAGE_RENDERED, id => rerenderOne(id)));
  bindings.push(eventOn(tavern_events.USER_MESSAGE_RENDERED, id => rerenderOne(id)));
  bindings.push(eventOn(tavern_events.MESSAGE_UPDATED, id => rerenderOne(id)));
  bindings.push(eventOn(tavern_events.MESSAGE_SWIPED, id => rerenderOne(id)));
  bindings.push(eventOn(tavern_events.MESSAGE_DELETED, () => rerenderAll()));
  bindings.push(eventOn(tavern_events.CHAT_CHANGED, () => setTimeout(rerenderAll, 60)));

  setTimeout(rerenderAll, 80);

  return {
    rerenderAll,
    destroy: () => {
      console.info('[蜃灵统一渲染][render] destroy listeners');
      bindings.forEach(item => item.stop());
    },
  };
}
