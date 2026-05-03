import { findBranchTargets, renderBranchCard } from './renderers/branches';
import { findBottomTarget, renderBottomBar } from './renderers/bottom-bar';
import { findTopTarget, renderTopBar } from './renderers/top-bar';
import type { RenderContext } from './types';

const RENDER_FLAG = 'data-sl-unified-rendered';

function processMessage(messageId: number, ctx: RenderContext): void {
  if (!Number.isFinite(messageId) || messageId < 0) return;
  const messages = getChatMessages(messageId);
  if (!messages.length) return;

  const raw = messages[0].message ?? '';
  if (!raw) return;

  let next = raw;

  const topTarget = findTopTarget(next, messageId);
  if (topTarget) {
    next = next.replace(topTarget.source, renderTopBar(topTarget.source, ctx));
  }

  const bottomTarget = findBottomTarget(next, messageId);
  if (bottomTarget) {
    next = next.replace(bottomTarget.source, renderBottomBar(bottomTarget.source, ctx));
  }

  const branchTargets = findBranchTargets(next, messageId);
  branchTargets.forEach(target => {
    next = next.replace(target.source, renderBranchCard(target.source, ctx));
  });

  if (next === raw) return;

  const displayHtml = formatAsDisplayedMessage(next, { message_id: messageId });
  const $display = retrieveDisplayedMessage(messageId);
  if (!$display.length) return;
  $display.html(displayHtml);
  $display.attr(RENDER_FLAG, '1');
}

function processAll(ctx: RenderContext): void {
  const lastId = getLastMessageId();
  if (!Number.isFinite(lastId) || lastId < 0) return;
  for (let id = 0; id <= lastId; id++) {
    processMessage(id, ctx);
  }
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
    processMessage(messageId, getCtx());
  };

  const rerenderAll = () => {
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
      bindings.forEach(item => item.stop());
    },
  };
}
