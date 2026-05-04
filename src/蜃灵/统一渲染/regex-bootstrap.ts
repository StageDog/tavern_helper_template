// 启动时把"显示用清理正则"注册/启用到当前预设；同时禁用旧版美化正则避免冲突。
// 关闭脚本时尝试禁用，让原始标签内容恢复显示。

const SL_REGEX_ID = 'shenling-unified-cleanup-display';
export const SL_REGEX_NAME = '【蜃灵】统一渲染-显示时隐藏原始标签';

// 蜃灵旧版"美化"类正则（destination.display=true 把蜃灵标签替换成 HTML）。
// 启用统一渲染时一并禁用，避免和脚本内 prepend/append 重复渲染。
const CONFLICTING_REGEX_NAMES = [
  '【蜃灵】美化-顶部状态栏',
  '【蜃灵】美化-尾部状态栏',
  '【蜃灵】美化-小总结',
  '【蜃灵】美化-小总结-杂志',
];

// 仅在显示时把蜃灵原始标签整段抹掉。AI 上下文里依然存在 → 模型仍能看到自己的状态栏输出。
const SL_FIND_REGEX =
  '/<time>[\\s\\S]*?<\\/time>[\\s\\S]*?<location>[\\s\\S]*?<\\/location>[\\s\\S]*?<weather>[\\s\\S]*?<\\/weather>[\\s\\S]*?<spatial>[\\s\\S]*?<\\/spatial>|<SLstatusblock>[\\s\\S]*?<\\/SLstatusblock>|<memory>[\\s\\S]*?<\\/memory>|<branches>[\\s\\S]*?<\\/branches>/gi';

const TARGET: TavernRegexOption = { type: 'preset', name: 'in_use' };

function buildRegex(): TavernRegex {
  return {
    id: SL_REGEX_ID,
    script_name: SL_REGEX_NAME,
    enabled: true,
    find_regex: SL_FIND_REGEX,
    replace_string: '',
    trim_strings: [],
    source: {
      user_input: false,
      ai_output: true,
      slash_command: false,
      world_info: false,
    },
    destination: {
      display: true,
      prompt: false,
    },
    run_on_edit: true,
    min_depth: null,
    max_depth: null,
  };
}

/**
 * 启动时调用：
 * - 蜃灵正则不存在 → 添加并启用
 * - 已存在但被禁用 → 启用
 * - 启用了冲突的旧美化正则 → 禁用它们
 * - 已是最终态 → 跳过 update（避免触发 CHAT_CHANGED 重载）
 */
export async function ensureCleanupRegex(): Promise<void> {
  try {
    const current = getTavernRegexes(TARGET);
    const existing = current.find(r => r.script_name === SL_REGEX_NAME);
    const enabledConflicts = current.filter(
      r => CONFLICTING_REGEX_NAMES.includes(r.script_name) && r.enabled,
    );

    if (existing?.enabled && enabledConflicts.length === 0) {
      console.info('[蜃灵统一渲染][regex] state already correct, skip update');
      return;
    }

    await updateTavernRegexesWith(regexes => {
      let found = false;
      const updated = regexes.map(r => {
        if (r.script_name === SL_REGEX_NAME) {
          found = true;
          return { ...r, enabled: true };
        }
        if (CONFLICTING_REGEX_NAMES.includes(r.script_name) && r.enabled) {
          return { ...r, enabled: false };
        }
        return r;
      });
      if (!found) {
        updated.push(buildRegex());
      }
      return updated;
    }, TARGET);

    console.info(
      `[蜃灵统一渲染][regex] cleanup regex ensured (existed=${Boolean(existing)} disabledConflicts=${enabledConflicts.length})`,
    );
  } catch (e) {
    console.error('[蜃灵统一渲染][regex] ensureCleanupRegex failed', e);
  }
}

/**
 * 关闭脚本时调用：把蜃灵清理正则禁用，让原始标签内容恢复显示。
 * 在 pagehide 里 fire-and-forget，可能因页面卸载而丢失 → 用户需手动关闭。
 */
export async function disableCleanupRegex(): Promise<void> {
  try {
    const current = getTavernRegexes(TARGET);
    const existing = current.find(r => r.script_name === SL_REGEX_NAME);
    if (!existing || !existing.enabled) {
      console.info('[蜃灵统一渲染][regex] cleanup regex already disabled, skip');
      return;
    }

    await updateTavernRegexesWith(
      regexes => regexes.map(r => (r.script_name === SL_REGEX_NAME ? { ...r, enabled: false } : r)),
      TARGET,
    );

    console.info('[蜃灵统一渲染][regex] cleanup regex disabled');
  } catch (e) {
    console.error('[蜃灵统一渲染][regex] disableCleanupRegex failed', e);
  }
}
