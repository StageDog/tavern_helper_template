import { findBranchTargets, renderBranchCard } from './renderers/branches';
import { findBottomTarget, renderBottomBar } from './renderers/bottom-bar';
import { findTopTarget, renderTopBar } from './renderers/top-bar';
import type { RenderContext } from './types';

function tagCard(html: string, target: string): string {
  return html.replace(/^<div class="sl-unified-card/, `<div data-sl-target="${target}" class="sl-unified-card`);
}

function applyOrInsertCard(
  $display: JQuery,
  target: string,
  newHtml: string | null,
  position: 'prepend' | 'append',
): boolean {
  const $existing = $display.find(`.sl-unified-card[data-sl-target="${target}"]`);

  if (!newHtml) {
    if ($existing.length) {
      $existing.remove();
      return true;
    }
    return false;
  }

  if ($existing.length) {
    $existing.first().replaceWith(newHtml);
    $existing.slice(1).remove();
    return true;
  }

  if (position === 'prepend') {
    $display.prepend(newHtml);
  } else {
    $display.append(newHtml);
  }
  return true;
}

function cleanupBranchesAfter($display: JQuery, keep: number): void {
  $display.find('.sl-unified-card[data-sl-target^="branch-"]').each((_, el) => {
    const t = el.getAttribute('data-sl-target') || '';
    const n = Number(t.slice('branch-'.length));
    if (Number.isFinite(n) && n >= keep) el.remove();
  });
}

function processMessage(messageId: number, ctx: RenderContext): void {
  if (!Number.isFinite(messageId) || messageId < 0) return;
  const messages = getChatMessages(messageId);
  if (!messages.length) return;

  const raw = messages[0].message ?? '';
  if (!raw) return;

  const $display = retrieveDisplayedMessage(messageId);
  if (!$display.length) return;

  const topTarget = findTopTarget(raw, messageId);
  const bottomTarget = findBottomTarget(raw, messageId);
  const branchTargets = findBranchTargets(raw, messageId);

  const topHtml = topTarget ? tagCard(renderTopBar(topTarget.source, ctx), 'top') : null;
  const bottomHtml = bottomTarget ? tagCard(renderBottomBar(bottomTarget.source, ctx), 'bottom') : null;

  const topChanged = applyOrInsertCard($display, 'top', topHtml, 'prepend');
  const bottomChanged = applyOrInsertCard($display, 'bottom', bottomHtml, 'append');

  cleanupBranchesAfter($display, branchTargets.length);
  let branchChanged = false;
  branchTargets.forEach((t, idx) => {
    const html = tagCard(renderBranchCard(t.source, ctx), `branch-${idx}`);
    if (applyOrInsertCard($display, `branch-${idx}`, html, 'append')) {
      branchChanged = true;
    }
  });

  if (topChanged || bottomChanged || branchChanged) {
    console.info(
      `[蜃灵统一渲染][render] applied messageId=${messageId} top=${Boolean(topHtml)} bottom=${Boolean(bottomHtml)} branches=${branchTargets.length}`,
    );
  }
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
