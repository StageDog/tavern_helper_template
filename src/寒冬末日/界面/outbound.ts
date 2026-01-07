import type { ShelterScopeByFloor } from '../util/shelter_scope';

export const CHAT_VAR_KEYS = {
  EDEN_SHELTER_SCOPE: 'eden.shelter_scope',
  EDEN_RULES_HEALTH: 'eden.rules.health',
  UI_SETTINGS: 'ui_settings',
} as const;

export type SendToChatResult =
  | { ok: true; method: 'triggerSlash'; sentText: string }
  | { ok: false; method: 'triggerSlash' | 'unavailable'; reason: string; sentText: string };

export type CopyTextResult =
  | { ok: true; method: 'clipboard' | 'execCommand'; text: string }
  | { ok: false; method: 'clipboard' | 'execCommand'; reason: string; text: string };

type DebugSetting =
  | boolean
  | {
      enabled?: boolean;
      toConsole?: boolean;
      toChat?: boolean;
    };

const OUTBOUND_DEBUG_FLAG_PATH = 'ui_settings.debug_outbound';
const OUTBOUND_LOG_PATH = 'eden.debug.outbound_log';
const OUTBOUND_LOG_MAX = 50;

function normalizeChatText(input: string): string {
  const raw = String(input ?? '');
  const noNewlines = raw.replace(/\r?\n+/g, ' ').trim();
  // `/send ... | /trigger` 的管道分隔符，避免被用户文本打断
  return noNewlines.replaceAll('|', '｜');
}

function resolveDebug(debug?: DebugSetting): { enabled: boolean; toConsole: boolean; toChat: boolean } {
  if (typeof debug === 'boolean') {
    return { enabled: debug, toConsole: debug, toChat: false };
  }
  if (debug && typeof debug === 'object') {
    const enabled = debug.enabled ?? true;
    return { enabled, toConsole: debug.toConsole ?? enabled, toChat: debug.toChat ?? false };
  }

  // 默认：如果 chat 变量里打开了 ui_settings.debug_outbound，就输出到 console（不写回 chat，避免污染存档）
  try {
    const vars = getVariables?.({ type: 'chat' }) ?? {};
    const flag = OUTBOUND_DEBUG_FLAG_PATH.split('.').reduce<any>((acc, k) => (acc ? acc[k] : undefined), vars);
    const enabled = flag === true;
    return { enabled, toConsole: enabled, toChat: false };
  } catch {
    return { enabled: false, toConsole: false, toChat: false };
  }
}

function truncateText(text: string, max = 200): string {
  const s = String(text ?? '');
  if (s.length <= max) return s;
  return `${s.slice(0, max)}…`;
}

function setDeep(obj: any, path: string, value: any) {
  const keys = path.split('.').filter(Boolean);
  if (keys.length === 0) return;
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (!cur[k] || typeof cur[k] !== 'object') cur[k] = {};
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
}

function getDeep(obj: any, path: string): any {
  const keys = path.split('.').filter(Boolean);
  let cur = obj;
  for (const k of keys) {
    if (!cur || typeof cur !== 'object') return undefined;
    cur = cur[k];
  }
  return cur;
}

function debugLog(
  debug: { enabled: boolean; toConsole: boolean; toChat: boolean },
  event: string,
  payload: Record<string, any>,
) {
  if (!debug.enabled) return;

  const record = {
    ts: new Date().toISOString(),
    event,
    ...payload,
  };

  if (debug.toConsole) {
    // eslint-disable-next-line no-console
    console.debug?.('[eden/outbound]', record);
  }

  if (debug.toChat && typeof updateVariablesWith === 'function') {
    try {
      updateVariablesWith(
        (vars: any) => {
          const current = getDeep(vars, OUTBOUND_LOG_PATH);
          const list = Array.isArray(current) ? current.slice() : [];
          list.push(record);
          if (list.length > OUTBOUND_LOG_MAX) {
            list.splice(0, list.length - OUTBOUND_LOG_MAX);
          }
          setDeep(vars, OUTBOUND_LOG_PATH, list);
          return vars;
        },
        { type: 'chat' },
      );
    } catch {
      // ignore
    }
  }
}

export function sendToChat(
  text: string,
  {
    toast = true,
    awaitTrigger = true,
    debug,
    successMessage = '已发送到聊天',
    failureMessage = '发送失败，请复制后手动发送',
    unavailableMessage = '无法发送：triggerSlash 不可用',
  }: {
    toast?: boolean;
    awaitTrigger?: boolean;
    debug?: DebugSetting;
    successMessage?: string;
    failureMessage?: string;
    unavailableMessage?: string;
  } = {},
): SendToChatResult {
  const debugResolved = resolveDebug(debug);
  const sentText = normalizeChatText(text);
  if (!sentText) {
    const reason = '空文本';
    if (toast) toastr?.warning?.(reason);
    debugLog(debugResolved, 'sendToChat', { ok: false, method: 'unavailable', reason, text: truncateText(text) });
    return { ok: false, method: 'unavailable', reason, sentText };
  }

  if (typeof triggerSlash !== 'function') {
    if (toast) toastr?.error?.(unavailableMessage);
    debugLog(debugResolved, 'sendToChat', {
      ok: false,
      method: 'unavailable',
      reason: unavailableMessage,
      text: truncateText(sentText),
    });
    return { ok: false, method: 'unavailable', reason: unavailableMessage, sentText };
  }

  const cmd = awaitTrigger ? `/send ${sentText} | /trigger await=true` : `/send ${sentText}`;
  try {
    triggerSlash(cmd);
    if (toast) toastr?.success?.(successMessage);
    debugLog(debugResolved, 'sendToChat', { ok: true, method: 'triggerSlash', text: truncateText(sentText) });
    return { ok: true, method: 'triggerSlash', sentText };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    if (toast) toastr?.error?.(failureMessage);
    debugLog(debugResolved, 'sendToChat', { ok: false, method: 'triggerSlash', reason, text: truncateText(sentText) });
    return { ok: false, method: 'triggerSlash', reason, sentText };
  }
}

export async function copyText(
  text: string,
  {
    toast = true,
    debug,
    successMessage = '已复制',
    failureMessage = '复制失败，请手动复制',
  }: { toast?: boolean; debug?: DebugSetting; successMessage?: string; failureMessage?: string } = {},
): Promise<CopyTextResult> {
  const debugResolved = resolveDebug(debug);
  const normalized = String(text ?? '').trim();
  if (!normalized) {
    const reason = '空文本';
    if (toast) toastr?.warning?.(reason);
    debugLog(debugResolved, 'copyText', { ok: false, method: 'clipboard', reason, text: truncateText(text) });
    return { ok: false, method: 'clipboard', reason, text: normalized };
  }

  try {
    await navigator.clipboard.writeText(normalized);
    if (toast) toastr?.success?.(successMessage);
    debugLog(debugResolved, 'copyText', { ok: true, method: 'clipboard', text: truncateText(normalized) });
    return { ok: true, method: 'clipboard', text: normalized };
  } catch {
    // fallback
  }

  try {
    const ta = document.createElement('textarea');
    ta.value = normalized;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    ta.style.top = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    if (toast) toastr?.success?.(successMessage);
    debugLog(debugResolved, 'copyText', { ok: true, method: 'execCommand', text: truncateText(normalized) });
    return { ok: true, method: 'execCommand', text: normalized };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    if (toast) toastr?.error?.(failureMessage);
    debugLog(debugResolved, 'copyText', { ok: false, method: 'execCommand', reason, text: truncateText(normalized) });
    return { ok: false, method: 'execCommand', reason, text: normalized };
  }
}

export function buildShelterScopeInstructionText(scope: ShelterScopeByFloor): string {
  const floors = (['20', '19'] as const)
    .map(floor => ({ floor, rooms: scope?.[floor] ?? [] }))
    .filter(x => x.rooms.length > 0);

  if (floors.length === 0) return '';

  const parts = floors.map(({ floor, rooms }) => `楼层${floor}的${rooms.join('、')}房间`);
  return `{{user}}指令伊甸将${parts.join('、以及')}，设为其生存庇护范围，这些房间的通风系统、供暖系统将与伊甸同步：进入该房间的角色将不再因恶劣天气扣减健康值。`;
}
