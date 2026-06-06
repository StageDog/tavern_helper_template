// 逆攻略 — 开场白 A/B：自定义模式 + 随机生成模式
// 扫描开场白中的标记，渲染配置表单；提交后写入聊天世界书和 MVU 变量。

import abilityPoolText from '../../../../角色卡/逆攻略/随机池/特长能力.md?raw';
import keywordPoolText from '../../../../角色卡/逆攻略/随机池/角色关键词.md?raw';
import relationPoolText from '../../../../角色卡/逆攻略/随机池/初始关系.md?raw';
import worldPoolText from '../../../../角色卡/逆攻略/随机池/世界设定.md?raw';
import { randomCharacterName } from './name_pool';

const PLACEHOLDER_CUSTOM = '【【逆攻略自定义模式】】';
const PLACEHOLDER_RANDOM = '【【逆攻略随机生成模式】】';
const RENDERED_CLASS = 'rc-opening-rendered';
const RANDOM_VALUE = '随机';
const CHAT_ENTRY_PREFIX = '[mvu_update][mvu_plot]';

const WORLD_TYPES = ['现代都市', '校园', '奇幻大陆', '仙侠', '末日', '科幻', '历史', '自定义'];
const SYSTEM_TYPES = [
  '面板/加点',
  '签到/打卡',
  '神豪/败家',
  '情绪/声望',
  '神级选择',
  '反派/夺运',
  '人生模拟器',
  '自定义',
];

const FALLBACK_RELATION_SUGGESTIONS = [
  '陌生人',
  '邻居',
  '同班同学',
  '同事',
  '室友',
  '常去的店的店员/老板',
  '网友（未见面）',
  '青梅竹马',
  '朋友的朋友',
  '<user> 的下属',
  '<user> 的学生',
  '<user> 家的佣人/管家',
  '竞争对手',
  '被 <user> 救过一命',
  '欠了 <user> 的债',
  '单方面暗恋 <user>（已久）',
  '被系统传送到 <user> 面前',
  '和 <user> 签了某种契约',
];

const FALLBACK_ABILITY_SUGGESTIONS = [
  '做菜',
  '唱歌',
  '画画',
  '运动全能',
  '察言观色',
  '口才好',
  '医术/急救',
  '编程/黑客',
  '摄影',
  '格斗术/柔道',
  '剑术',
  '元素魔法',
  '炼金术',
  '符箓',
  '炼丹',
  '阵法',
  '射击/枪械',
  '野外求生',
  '机甲操控',
  '电子入侵',
  '武艺',
  '兵法',
];

const RANDOM_WORLD_TYPES = WORLD_TYPES.filter(type => type !== '自定义');
const RELATION_SUGGESTIONS = parseMarkdownListItems(relationPoolText, FALLBACK_RELATION_SUGGESTIONS);
const ABILITY_SECTIONS = parseMarkdownListSections(abilityPoolText);
const ABILITY_SUGGESTIONS = uniqueStrings(
  Object.values(ABILITY_SECTIONS).flat().length > 0
    ? Object.values(ABILITY_SECTIONS).flat()
    : FALLBACK_ABILITY_SUGGESTIONS,
);
const KEYWORD_SECTIONS = parseMarkdownListSections(keywordPoolText);
const KEYWORD_SUGGESTIONS = uniqueStrings(Object.values(KEYWORD_SECTIONS).flat());
const WORLD_PRESETS = parseWorldPresets(worldPoolText);

const COMMON_TASKS = {
  今日心情管家: { 描述: '让<user>今天至少开心一次', 奖励: '系统积分+5', 难度: '简单', 状态: '可接取' },
  解决问题: { 描述: '为<user>切实解决一个麻烦', 奖励: '系统积分+15', 难度: '普通', 状态: '可接取' },
  主动接触: { 描述: '让<user>今天主动跟你说一句话', 奖励: '系统积分+10', 难度: '普通', 状态: '可接取' },
  难忘瞬间: { 描述: '制造一个<user>会记得的时刻', 奖励: '系统积分+30', 难度: '困难', 状态: '可接取' },
  专属记忆: { 描述: '做一件只有你才能为<user>做到的事', 奖励: '系统积分+60', 难度: '史诗', 状态: '可接取' },
} as const;

const SYSTEM_TASKS: Record<string, Record<string, { 描述: string; 奖励: string; 难度: string; 状态: string }>> = {
  '面板/加点': {
    日常社交: {
      描述: '每天与<user>进行一次实质性互动（社交熟练度+1）',
      难度: '简单',
      奖励: '系统积分+5、属性点+1',
      状态: '可接取',
    },
    魅力突破: {
      描述: '做出一个让<user>正面印象深刻的举动（魅力属性突破阈值）',
      难度: '普通',
      奖励: '系统积分+15、魅力+3',
      状态: '可接取',
    },
    属性展示: {
      描述: '在<user>面前展示自己某项特长/能力',
      难度: '普通',
      奖励: '系统积分+10、对应属性+2',
      状态: '可接取',
    },
    守护认证: { 描述: '在<user>面临困难时挺身而出', 难度: '困难', 奖励: '系统积分+30、全属性+1', 状态: '可接取' },
  },
  '签到/打卡': {
    日常签到: { 描述: '每天出现在<user>视野里', 难度: '简单', 奖励: '系统积分+5、签到天数+1', 状态: '可接取' },
    场景签到: {
      描述: '在<user>最常出现的地方完成一次签到',
      难度: '普通',
      奖励: '系统积分+10、随机道具',
      状态: '可接取',
    },
    深夜守候: { 描述: '在<user>最需要陪伴的时候出现', 难度: '困难', 奖励: '系统积分+30、特殊签到奖励', 状态: '可接取' },
    七日签到: { 描述: '累积七天第一个出现在<user>面前', 难度: '困难', 奖励: '系统积分+60、签到宝箱', 状态: '可接取' },
  },
  '神豪/败家': {
    日常消费: {
      描述: '在限定时间内为<user>花出一笔钱（金额不限）',
      难度: '简单',
      奖励: '系统积分+5、返现30%',
      状态: '可接取',
    },
    贵重礼物: { 描述: '给<user>送出一份有实质价值的礼物', 难度: '普通', 奖励: '系统积分+15、额度提升', 状态: '可接取' },
    梦想投资: { 描述: '为<user>感兴趣的事物提供资金支持', 难度: '困难', 奖励: '系统积分+30、投资分红', 状态: '可接取' },
    一掷千金: {
      描述: '为<user>完成一个通常需要大笔资金的愿望',
      难度: '史诗',
      奖励: '系统积分+60、金卡升级',
      状态: '可接取',
    },
  },
  '情绪/声望': {
    引发笑声: { 描述: '让<user>真心笑一次（喜悦值收集）', 难度: '简单', 奖励: '系统积分+5、喜悦值×5', 状态: '可接取' },
    制造惊喜: {
      描述: '做出让<user>惊喜的举动（惊喜值收集）',
      难度: '普通',
      奖励: '系统积分+15、惊喜值×10',
      状态: '可接取',
    },
    赢得赞赏: {
      描述: '做出让<user>真心称赞你的事（赞赏值收集）',
      难度: '困难',
      奖励: '系统积分+30、赞赏值×20',
      状态: '可接取',
    },
    情绪盛宴: {
      描述: '在一段时间内让<user>的某种正面情绪达到极值',
      难度: '史诗',
      奖励: '系统积分+60、情绪值大量收集',
      状态: '可接取',
    },
  },
  神级选择: {
    初次互动: {
      描述: '与<user>进行（绑定系统后的）第一次互动',
      难度: '简单',
      奖励: '系统积分+5、下次选择题额外增加1个自定义选项',
      状态: '可接取',
    },
    得到认可: {
      描述: '让<user>对你做出的某个决定表示认可',
      难度: '普通',
      奖励: '系统积分+15、下次选择题额外增加一个必定获利的选项',
      状态: '可接取',
    },
    选择困难: {
      描述: '让<user>主动为某个困难的选择寻求你的建议',
      难度: '困难',
      奖励: '系统积分+30、下次选择题可直接锁定最优解',
      状态: '可接取',
    },
    深层共鸣: {
      描述: '与<user>建立一次深层的情感联结，触发系统特殊响应',
      难度: '史诗',
      奖励: '系统积分+60、下次选择题所有选项均可得益',
      状态: '可接取',
    },
  },
  '反派/夺运': {
    截胡试炼: {
      描述: '从竞争者手中夺取一项资源或机缘，献给<user>',
      难度: '普通',
      奖励: '系统积分+15、气运值+10',
      状态: '可接取',
    },
    打压威胁: { 描述: '让<user>周围的潜在威胁遭受挫折', 难度: '困难', 奖励: '系统积分+30、气运值+20', 状态: '可接取' },
    气运转化: {
      描述: '将掠夺来的气运值转化为<user>的切实利益',
      难度: '困难',
      奖励: '系统积分+30、利益点数奖励',
      状态: '可接取',
    },
    天命逆转: {
      描述: '颠覆一个原本属于他人的重大机缘，让<user>成为受益者',
      难度: '史诗',
      奖励: '系统积分+60、大量气运值',
      状态: '可接取',
    },
  },
  人生模拟器: {
    初次接触: {
      描述: '与<user>进行一次有实质内容的互动',
      难度: '简单',
      奖励: '系统积分+5、获得一次额外模拟机会',
      状态: '可接取',
    },
    主动倾诉: {
      描述: '主动开启话题，被<user>分享一次经历',
      难度: '普通',
      奖励: '系统积分+15、下次模拟可额外保留一项奖励',
      状态: '可接取',
    },
    共同经历: {
      描述: '与<user>共同经历一次难忘的事件',
      难度: '困难',
      奖励: '系统积分+30、获得一次可留存的额外奖励机会',
      状态: '可接取',
    },
    深层共鸣: {
      描述: '与<user>建立深度的情感联结，触发系统特殊响应',
      难度: '史诗',
      奖励: '系统积分+60、可留存额外奖励机会×3',
      状态: '可接取',
    },
  },
};

const COMMON_SHOP = {
  氛围催化剂: { 描述: '本次互动的气氛更融洽（有效期1次）', 价格: 20, 库存: '无限', 系统类别: '共通' },
  奖励加倍剂: { 描述: '下一次角色完成任务的奖励加倍（最高双倍，有效期1次）', 价格: 35, 库存: '无限', 系统类别: '共通' },
  神秘礼包: { 描述: '随机获得一件道具（AI自由发挥内容）', 价格: 15, 库存: '无限', 系统类别: '共通' },
  绊脚石: { 描述: '让指定角色在下次攻略行为中出丑', 价格: 35, 库存: '无限', 系统类别: '共通' },
  扰心符: { 描述: '让指定角色在接下来一段时间心神不宁', 价格: 25, 库存: '无限', 系统类别: '共通' },
  任务加码: { 描述: '让指定角色的当前任务难度升一档', 价格: 40, 库存: '无限', 系统类别: '共通' },
  角色心理报告: { 描述: 'AI详细描述指定角色当前的心理活动（一次）', 价格: 20, 库存: '无限', 系统类别: '共通' },
  位置探查: { 描述: '获知指定角色当前所在的位置', 价格: 15, 库存: '无限', 系统类别: '共通' },
  时间延长令: { 描述: '让某个好的互动场景延续更久（AI在叙事中体现）', 价格: 20, 库存: '无限', 系统类别: '共通' },
  秘密调查: { 描述: '让系统调查指定角色最近在暗中做了什么', 价格: 30, 库存: '无限', 系统类别: '共通' },
};

type Motivation = '系统绑定' | '自然兴趣';

interface WorldFormData {
  worldType: string;
  era: string;
  stage: string;
  rules: string;
  notes: string;
}

interface UserFormData {
  name: string;
  age: string;
  identity: string;
  appearance: string;
  personality: string;
  notes: string;
}

interface CharacterFormData {
  name: string;
  source: string;
  worldbookKeywords: string[];
  gender: string;
  age: string;
  appearance: string;
  personality: string;
  past: string;
  relation: string;
  motivation: Motivation;
  systemType: string;
  ability: string;
  notes: string;
}

interface OpeningConfig {
  world: WorldFormData;
  user: UserFormData;
  characters: CharacterFormData[];
}

interface WorldPreset {
  era: string[];
  stage: string[];
  rules: string[];
  forbidden: string[];
}

interface RandomCharacterSeed {
  name: string;
  source: string;
  gender: string;
  motivation: string;
  systemType: string;
  customSystemType: string;
  relation: string;
  keywords: string[];
  worldbookKeywords: string[];
}

interface RandomOpeningSeed {
  worldType: string;
  customWorldType: string;
  worldNotes: string;
  user: UserFormData;
  count: number;
  mode: 'full' | 'partial';
  characters: RandomCharacterSeed[];
}

const parentDoc = window.parent.document;
type MvuApi = typeof Mvu;

function getMvuApi(): MvuApi | null {
  const api = (globalThis as { Mvu?: MvuApi }).Mvu;
  return api && typeof api.getMvuData === 'function' && typeof api.replaceMvuData === 'function' ? api : null;
}

async function ensureMvuApi(): Promise<MvuApi> {
  const readyApi = getMvuApi();
  if (readyApi) return readyApi;

  if (typeof waitGlobalInitialized === 'function') {
    await waitGlobalInitialized('Mvu');
  }

  const api = getMvuApi();
  if (!api) {
    throw new Error('MVU 变量框架尚未加载，请确认 mvu 脚本库已启用且加载成功。');
  }
  return api;
}

function withErrorLog<T extends (...args: any[]) => any>(fn: T): T {
  if (typeof errorCatched === 'function') {
    return errorCatched(fn) as T;
  }
  return ((...args: Parameters<T>) => {
    try {
      const result = fn(...args);
      if (result && typeof result.then === 'function') {
        result.catch((err: unknown) => console.error('[逆攻略] 开场渲染异步错误:', err));
      }
      return result;
    } catch (err) {
      console.error('[逆攻略] 开场渲染错误:', err);
      return undefined;
    }
  }) as T;
}

function onReady(callback: () => void) {
  const jq = (globalThis as { $?: JQueryStatic }).$;
  if (typeof jq === 'function') {
    jq(callback);
    return;
  }
  if (parentDoc.readyState === 'loading') {
    parentDoc.addEventListener('DOMContentLoaded', callback, { once: true });
  } else {
    callback();
  }
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function clean(value: unknown): string {
  return String(value ?? '').trim();
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map(value => clean(value)).filter(Boolean))];
}

function splitKeywords(value: unknown): string[] {
  if (Array.isArray(value)) return uniqueStrings(value.map(item => clean(item)));
  return uniqueStrings(clean(value).split(/[\r\n,，、;；]+/));
}

function keywordsToInputValue(values: string[]): string {
  return uniqueStrings(values).join('，');
}

function parseMarkdownListItems(text: string, fallback: string[] = []): string[] {
  const matches = [...text.matchAll(/^\s*-\s+(.+)$/gm)].map(match => clean(match[1]));
  return uniqueStrings(matches.length > 0 ? matches : fallback);
}

function parseMarkdownListSections(text: string): Record<string, string[]> {
  const sections: Record<string, string[]> = {};
  let current = '通用';
  for (const rawLine of text.split(/\r?\n/)) {
    const line = clean(rawLine);
    const heading = line.match(/^##\s+(.+)$/);
    if (heading) {
      current = clean(heading[1]).replace(/（.*?）/g, '');
      sections[current] ??= [];
      continue;
    }
    const item = line.match(/^-\s+(.+)$/);
    if (item) {
      sections[current] ??= [];
      sections[current].push(clean(item[1]));
    }
  }
  return Object.fromEntries(Object.entries(sections).map(([name, items]) => [name, uniqueStrings(items)]));
}

function splitPoolChoices(value: string): string[] {
  return uniqueStrings(value.split(/\s+\/\s+/).map(item => item.replace(/。$/, '')));
}

function parseWorldPresets(text: string): Record<string, WorldPreset> {
  const presets: Record<string, WorldPreset> = {};
  let current = '';

  for (const rawLine of text.split(/\r?\n/)) {
    const line = clean(rawLine);
    const heading = line.match(/^###\s+(.+)$/);
    if (heading) {
      current = clean(heading[1]);
      presets[current] = { era: [], stage: [], rules: [], forbidden: [] };
      continue;
    }
    if (!current || !presets[current]) continue;

    const value = line.replace(/^[^:：]+[:：]\s*/, '');
    if (line.startsWith('时代:')) presets[current].era = splitPoolChoices(value);
    if (line.startsWith('典型舞台:')) presets[current].stage = splitPoolChoices(value);
    if (line.startsWith('可用特殊规则:')) presets[current].rules = splitPoolChoices(value);
    if (line.startsWith('不可出现:')) presets[current].forbidden = splitPoolChoices(value);
  }

  return presets;
}

function blockField(label: string, value: string, indent = '  '): string {
  const normalized = clean(value);
  if (!normalized) return '';
  const lines = normalized.split(/\r?\n/).map(line => `${indent}  ${line}`);
  return `${indent}${label}: |-\n${lines.join('\n')}`;
}

function datalistHtml(id: string, values: string[]): string {
  return `<datalist id="${id}">${values.map(value => `<option value="${escapeHtml(value)}"></option>`).join('')}</datalist>`;
}

function optionsHtml(values: string[], selected?: string): string {
  return values
    .map(
      value =>
        `<option value="${escapeHtml(value)}"${selected === value ? ' selected' : ''}>${escapeHtml(value)}</option>`,
    )
    .join('');
}

function formField(label: string, id: string, attrs = ''): string {
  return `<label class="rc-field"><span>${label}</span><input id="${id}" ${attrs}></label>`;
}

function inlineRandomInput(label: string, dataField: string, attrs = ''): string {
  return `<label class="rc-field">
    <span>${label}</span>
    <div class="rc-input-action">
      <input data-field="${dataField}" ${attrs}>
      <button class="rc-random-btn" type="button" data-random-field="${dataField}" title="随机" aria-label="随机">🎲</button>
    </div>
  </label>`;
}

function inlineRandomText(label: string, dataField: string, attrs = ''): string {
  return `<label class="rc-field rc-field-wide">
    <span>${label}</span>
    <div class="rc-input-action">
      <textarea data-field="${dataField}" rows="1" data-auto-grow ${attrs}></textarea>
      <button class="rc-random-btn" type="button" data-random-field="${dataField}" title="随机" aria-label="随机">🎲</button>
    </div>
  </label>`;
}

function formText(label: string, id: string, attrs = ''): string {
  return `<label class="rc-field rc-field-wide"><span>${label}</span><textarea id="${id}" rows="3" data-auto-grow ${attrs}></textarea></label>`;
}

const STYLE = `<style>
  /* ===== 逆攻略 · 剪纸手账 + 铅笔线 ===== */
  .${RENDERED_CLASS} {
    --rc-board: #e5cfae;
    --rc-board-deep: #c99e68;
    --rc-paper: #fff8df;
    --rc-paper-2: #fff0b8;
    --rc-paper-3: #ffe2e9;
    --rc-field-bg: #fffdf2;
    --rc-ink: #24313b;
    --rc-pencil: #2d3032;
    --rc-muted: #756c60;
    --rc-line: rgba(45, 48, 50, 0.38);
    --rc-line-strong: #303438;
    --rc-accent: #d65b78;
    --rc-accent-d: #a83f58;
    --rc-accent-soft: #ffd9e3;
    --rc-cool: #78bdd0;
    --rc-cool-soft: #d9f0f5;
    --rc-green: #a9cb72;
    --rc-green-soft: #eef8d6;
    --rc-yellow: #ffed88;
    --rc-yellow-soft: #fff6c8;
    --rc-orange: #f2ad60;
    --rc-lavender: #dbc4ef;
    --rc-shadow: 53, 43, 34;
    color: var(--rc-ink);
    font-family: "Microsoft YaHei", "Noto Sans SC", system-ui, sans-serif;
    letter-spacing: 0;
    max-width: min(960px, 100%);
    margin: 16px auto;
    -webkit-font-smoothing: antialiased;
  }
  .${RENDERED_CLASS} *,
  .${RENDERED_CLASS} *::before,
  .${RENDERED_CLASS} *::after {
    box-sizing: border-box;
  }

  .rc-shell {
    position: relative;
    isolation: isolate;
    border: 2px solid var(--rc-line-strong);
    border-radius: 8px;
    background-color: var(--rc-board);
    background-image:
      radial-gradient(circle, rgba(101, 66, 38, 0.20) 1px, transparent 1.2px),
      repeating-linear-gradient(0deg, rgba(116, 76, 43, 0.08) 0 2px, transparent 2px 7px),
      repeating-linear-gradient(90deg, rgba(116, 76, 43, 0.06) 0 1px, transparent 1px 9px);
    background-size: 16px 16px, 100% 8px, 10px 100%;
    box-shadow:
      5px 6px 0 rgba(var(--rc-shadow), 0.22),
      11px 13px 0 rgba(var(--rc-shadow), 0.08);
    overflow: hidden;
  }
  .rc-shell::before {
    content: '';
    position: absolute;
    inset: 10px;
    z-index: -1;
    border: 1px dashed rgba(48, 52, 56, 0.28);
    border-radius: 7px;
    pointer-events: none;
  }
  .rc-shell::after {
    content: '';
    position: absolute;
    top: -10px;
    left: 50%;
    z-index: 2;
    width: 136px;
    height: 28px;
    background:
      repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.26) 0 8px, transparent 8px 16px),
      rgba(255, 221, 136, 0.78);
    border: 1px dashed rgba(48, 52, 56, 0.28);
    transform: translateX(-50%) rotate(-1.2deg);
    box-shadow: 1px 2px 0 rgba(var(--rc-shadow), 0.12);
    pointer-events: none;
  }

  .rc-head {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 14px;
    margin: 18px 18px 12px;
    padding: 18px 20px 16px;
    border: 2px dashed var(--rc-line-strong);
    border-radius: 6px;
    background:
      linear-gradient(transparent, transparent),
      var(--rc-yellow);
    box-shadow:
      4px 5px 0 rgba(var(--rc-shadow), 0.18),
      inset 0 -14px 0 rgba(255, 255, 255, 0.18);
    transform: rotate(-0.45deg);
  }
  .rc-head::before {
    content: '';
    position: absolute;
    top: -10px;
    right: 34px;
    width: 18px;
    height: 18px;
    border: 2px solid rgba(124, 36, 47, 0.55);
    border-radius: 50%;
    background: var(--rc-accent);
    box-shadow:
      1px 2px 0 rgba(var(--rc-shadow), 0.28),
      inset 2px 2px 0 rgba(255, 255, 255, 0.32);
  }
  .rc-head::after {
    content: '';
    position: absolute;
    left: 28px;
    bottom: -8px;
    width: 82px;
    height: 14px;
    background:
      repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.32) 0 6px, transparent 6px 12px),
      rgba(137, 198, 216, 0.58);
    border: 1px dashed rgba(48, 52, 56, 0.24);
    transform: rotate(1.8deg);
  }
  .rc-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 21px;
    font-weight: 900;
    letter-spacing: 0;
    line-height: 1.25;
  }
  .rc-title::before {
    content: '✦';
    color: var(--rc-accent-d);
    font-size: 17px;
  }
  .rc-subtitle {
    margin-top: 6px;
    color: var(--rc-muted);
    font-size: 13px;
    font-weight: 650;
    line-height: 1.55;
    text-decoration: underline;
    text-decoration-style: wavy;
    text-decoration-color: rgba(48, 52, 56, 0.25);
    text-underline-offset: 4px;
  }
  .rc-stamp {
    flex: none;
    width: 48px;
    height: 48px;
    display: grid;
    place-items: center;
    border: 2px solid var(--rc-line-strong);
    border-radius: 50%;
    background: var(--rc-paper-3);
    font-size: 23px;
    box-shadow:
      2px 3px 0 rgba(var(--rc-shadow), 0.20),
      inset 0 -8px 0 rgba(255, 255, 255, 0.24);
    transform: rotate(7deg);
  }

  .rc-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 4px 18px 0;
  }
  .rc-tab {
    appearance: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 38px;
    border: 2px dashed rgba(48, 52, 56, 0.42);
    border-radius: 6px 6px 0 0;
    background: rgba(255, 248, 223, 0.74);
    color: var(--rc-muted);
    padding: 8px 13px;
    font: inherit;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 2px 2px 0 rgba(var(--rc-shadow), 0.08);
    transform: translateY(2px) rotate(-0.3deg);
    transition: transform 120ms ease, background 120ms ease, color 120ms ease, box-shadow 120ms ease;
  }
  .rc-tab:nth-child(even) {
    transform: translateY(2px) rotate(0.45deg);
  }
  .rc-tab:hover {
    color: var(--rc-ink);
    background: var(--rc-yellow-soft);
    transform: translateY(0) rotate(0deg);
  }
  .rc-tab[data-active="true"] {
    color: var(--rc-ink);
    background: var(--rc-paper);
    border-bottom-color: var(--rc-paper);
    box-shadow: 3px -2px 0 rgba(var(--rc-shadow), 0.11);
    transform: translateY(0) rotate(0deg);
  }

  .rc-sections {
    display: grid;
    gap: 16px;
    padding: 18px;
  }
  .rc-tab-panel {
    display: none;
  }
  .rc-tab-panel[data-active="true"] {
    display: grid;
    gap: 16px;
    animation: rc-fade 180ms steps(3, end);
  }
  @keyframes rc-fade {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .rc-section,
  .rc-char-card,
  .rc-preview-card,
  .rc-done {
    --rc-note: var(--rc-paper);
    position: relative;
    border: 2px dashed var(--rc-line-strong);
    border-radius: 7px;
    background-color: var(--rc-note);
    background-image: url("data:image/svg+xml,%3Csvg width='8' height='8' viewBox='0 0 8 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%232d3032' fill-opacity='0.035'%3E%3Cpath d='M0 7h1v1H0zM7 0h1v1H7zM3 3h1v1H3z'/%3E%3C/g%3E%3C/svg%3E");
    box-shadow:
      3px 4px 0 rgba(var(--rc-shadow), 0.16),
      7px 8px 0 rgba(var(--rc-shadow), 0.06);
    transform: rotate(var(--rc-tilt, 0deg));
    transition: transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease;
  }
  .rc-section {
    --rc-note: var(--rc-paper);
  }
  .rc-char-card:nth-child(4n+1),
  .rc-preview-card:nth-child(4n+2) {
    --rc-note: var(--rc-yellow-soft);
    --rc-tilt: -0.35deg;
  }
  .rc-char-card:nth-child(4n+2),
  .rc-preview-card:nth-child(4n+3) {
    --rc-note: var(--rc-accent-soft);
    --rc-tilt: 0.35deg;
  }
  .rc-char-card:nth-child(4n+3),
  .rc-preview-card:nth-child(4n+4) {
    --rc-note: var(--rc-cool-soft);
    --rc-tilt: -0.25deg;
  }
  .rc-char-card:nth-child(4n),
  .rc-preview-card:nth-child(4n+1) {
    --rc-note: var(--rc-green-soft);
    --rc-tilt: 0.3deg;
  }
  .rc-preview-card:first-child {
    --rc-note: #e3f3f7;
    --rc-tilt: -0.2deg;
  }
  .rc-section:hover,
  .rc-char-card:hover,
  .rc-preview-card:hover {
    border-color: var(--rc-pencil);
    box-shadow:
      4px 5px 0 rgba(var(--rc-shadow), 0.20),
      9px 10px 0 rgba(var(--rc-shadow), 0.07);
    transform: rotate(var(--rc-tilt, 0deg)) translateY(-2px);
  }
  .rc-section::before,
  .rc-char-card::before,
  .rc-preview-card::before,
  .rc-done::before {
    content: '';
    position: absolute;
    top: -9px;
    left: 24px;
    width: 74px;
    height: 17px;
    background:
      repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.35) 0 6px, transparent 6px 12px),
      rgba(255, 219, 124, 0.70);
    border: 1px dashed rgba(48, 52, 56, 0.26);
    transform: rotate(-2deg);
    box-shadow: 1px 2px 0 rgba(var(--rc-shadow), 0.10);
    pointer-events: none;
  }
  .rc-char-card:nth-child(even)::before,
  .rc-preview-card:nth-child(even)::before {
    left: auto;
    right: 26px;
    background:
      repeating-linear-gradient(-45deg, rgba(255, 255, 255, 0.34) 0 6px, transparent 6px 12px),
      rgba(137, 198, 216, 0.64);
    transform: rotate(2deg);
  }
  .rc-section::after,
  .rc-char-card::after,
  .rc-preview-card::after {
    content: '';
    position: absolute;
    inset: 6px;
    border: 1px dashed rgba(48, 52, 56, 0.20);
    border-radius: 5px;
    pointer-events: none;
  }

  .rc-section summary,
  .rc-char-summary {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 15px 16px 12px;
    list-style: none;
    cursor: pointer;
    user-select: none;
    font-size: 15px;
    font-weight: 900;
  }
  .rc-section summary::-webkit-details-marker,
  .rc-char-summary::-webkit-details-marker {
    display: none;
  }
  .rc-sec-title {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    min-width: 0;
  }
  .rc-sec-ico {
    flex: none;
    width: 30px;
    height: 30px;
    display: grid;
    place-items: center;
    border: 2px solid rgba(48, 52, 56, 0.42);
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.42);
    font-size: 15px;
    box-shadow: 1px 2px 0 rgba(var(--rc-shadow), 0.11);
  }
  .rc-chev {
    color: var(--rc-muted);
    font-size: 13px;
    transition: transform 120ms ease;
  }
  details[open] > summary .rc-chev {
    transform: rotate(180deg);
  }

  .rc-grid {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 13px;
    padding: 4px 16px 17px;
  }
  .rc-field {
    display: grid;
    gap: 6px;
    min-width: 0;
  }
  .rc-field-wide {
    grid-column: 1 / -1;
  }
  .rc-field > span,
  .rc-muted {
    color: var(--rc-muted);
    font-size: 12px;
    font-weight: 750;
    letter-spacing: 0;
    line-height: 1.45;
  }
  .rc-field input,
  .rc-field select,
  .rc-field textarea {
    width: 100%;
    min-height: 40px;
    border: 2px dashed rgba(48, 52, 56, 0.42);
    border-radius: 5px;
    background: var(--rc-field-bg);
    color: var(--rc-ink);
    padding: 9px 11px;
    font: inherit;
    box-shadow:
      inset 0 -8px 0 rgba(48, 52, 56, 0.025),
      1px 1px 0 rgba(var(--rc-shadow), 0.08);
    transition: border-color 120ms ease, box-shadow 120ms ease, background 120ms ease;
  }
  .rc-field input:focus,
  .rc-field select:focus,
  .rc-field textarea:focus {
    outline: none;
    border-color: var(--rc-accent-d);
    background: #fffef7;
    box-shadow:
      0 0 0 3px rgba(255, 217, 227, 0.75),
      inset 0 -8px 0 rgba(214, 91, 120, 0.05);
  }
  .rc-field input:disabled {
    background: rgba(255, 255, 255, 0.36);
    color: var(--rc-muted);
    cursor: not-allowed;
  }
  .rc-field textarea {
    resize: vertical;
    line-height: 1.55;
  }
  .rc-field textarea[data-auto-grow] {
    overflow: hidden;
  }
  .rc-input-action {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px;
    align-items: stretch;
  }
  .rc-random-btn {
    width: 42px;
    min-height: 40px;
    display: inline-grid;
    place-items: center;
    border: 2px solid var(--rc-line-strong);
    border-radius: 6px;
    background: var(--rc-yellow);
    padding: 0;
    font-size: 17px;
    cursor: pointer;
    box-shadow: 2px 2px 0 rgba(var(--rc-shadow), 0.18);
    transition: transform 110ms ease, box-shadow 110ms ease, background 110ms ease;
  }
  .rc-random-btn:hover {
    background: var(--rc-accent-soft);
    transform: translateY(-1px) rotate(5deg);
    box-shadow: 3px 3px 0 rgba(var(--rc-shadow), 0.20);
  }
  .rc-random-btn:active {
    transform: translateY(1px) rotate(0deg);
    box-shadow: 1px 1px 0 rgba(var(--rc-shadow), 0.20);
  }

  .rc-btn {
    min-height: 38px;
    border: 2px dashed var(--rc-line-strong);
    border-radius: 6px;
    background: var(--rc-paper);
    color: var(--rc-ink);
    padding: 8px 13px;
    font: inherit;
    font-weight: 850;
    cursor: pointer;
    box-shadow: 2px 2px 0 rgba(var(--rc-shadow), 0.16);
    transition: transform 110ms ease, box-shadow 110ms ease, background 110ms ease, color 110ms ease;
  }
  .rc-btn:hover {
    background: var(--rc-yellow-soft);
    transform: translateY(-1px) rotate(-0.35deg);
    box-shadow: 3px 3px 0 rgba(var(--rc-shadow), 0.18);
  }
  .rc-btn:active {
    transform: translateY(1px);
    box-shadow: 1px 1px 0 rgba(var(--rc-shadow), 0.18);
  }
  .rc-btn:disabled {
    opacity: 0.68;
    cursor: progress;
  }
  .rc-btn-primary {
    border-style: solid;
    border-color: var(--rc-line-strong);
    background: var(--rc-pencil);
    color: var(--rc-paper);
    box-shadow:
      3px 3px 0 rgba(214, 91, 120, 0.46),
      5px 5px 0 rgba(var(--rc-shadow), 0.12);
  }
  .rc-btn-primary:hover {
    background: var(--rc-accent-d);
    color: #fffdf7;
    box-shadow:
      4px 4px 0 rgba(45, 48, 50, 0.26),
      6px 6px 0 rgba(214, 91, 120, 0.30);
  }
  .rc-btn-primary:disabled {
    transform: none;
    box-shadow: 2px 2px 0 rgba(var(--rc-shadow), 0.14);
  }
  .rc-btn-quiet {
    min-height: 32px;
    border-color: rgba(48, 52, 56, 0.25);
    background: rgba(255, 255, 255, 0.35);
    color: var(--rc-muted);
    padding: 5px 10px;
    box-shadow: none;
  }
  .rc-btn-quiet:hover {
    color: var(--rc-accent-d);
    background: rgba(255, 255, 255, 0.58);
    transform: translateY(-1px);
    box-shadow: 1px 1px 0 rgba(var(--rc-shadow), 0.12);
  }

  .rc-char-list {
    display: grid;
    gap: 15px;
  }
  .rc-char-summary {
    padding: 15px 15px 12px;
  }
  .rc-char-tools {
    display: inline-flex;
    gap: 8px;
    align-items: center;
  }
  .rc-char-add {
    width: 100%;
    border: 2px dashed var(--rc-line-strong);
    border-radius: 7px;
    background: rgba(255, 248, 223, 0.70);
    color: var(--rc-muted);
    padding: 13px;
    font: inherit;
    font-weight: 900;
    cursor: pointer;
    box-shadow: 2px 2px 0 rgba(var(--rc-shadow), 0.10);
    transition: transform 110ms ease, background 110ms ease, color 110ms ease, box-shadow 110ms ease;
  }
  .rc-char-add:hover {
    background: var(--rc-cool-soft);
    color: var(--rc-ink);
    transform: translateY(-1px) rotate(0.25deg);
    box-shadow: 3px 3px 0 rgba(var(--rc-shadow), 0.14);
  }

  .rc-inline-controls,
  .rc-radio-row,
  .rc-preview-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }
  .rc-preview-actions {
    justify-content: flex-end;
  }
  .rc-radio-pill {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-height: 38px;
    border: 2px dashed rgba(48, 52, 56, 0.40);
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.42);
    padding: 7px 10px;
    color: var(--rc-ink);
    font-weight: 800;
    box-shadow: 1px 1px 0 rgba(var(--rc-shadow), 0.08);
  }
  .rc-radio-pill input {
    accent-color: var(--rc-accent-d);
  }
  .rc-tag-wall {
    grid-column: 1 / -1;
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
  }
  .rc-tag {
    border: 2px dashed rgba(48, 52, 56, 0.36);
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.46);
    color: var(--rc-muted);
    padding: 6px 9px;
    font: inherit;
    font-size: 12px;
    font-weight: 850;
    cursor: pointer;
    box-shadow: 1px 1px 0 rgba(var(--rc-shadow), 0.06);
    transition: background 110ms ease, border-color 110ms ease, color 110ms ease, transform 110ms ease;
  }
  .rc-tag:hover,
  .rc-tag[data-active="true"] {
    border-color: var(--rc-pencil);
    background: var(--rc-accent-soft);
    color: var(--rc-accent-d);
    transform: translateY(-1px) rotate(-0.35deg);
  }
  .rc-preview-list {
    display: grid;
    gap: 16px;
  }
  .rc-preview-head {
    position: relative;
    z-index: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    padding: 15px 16px 12px;
    border-bottom: 2px dashed rgba(48, 52, 56, 0.24);
    font-weight: 900;
  }
  .rc-preview-head > span {
    text-decoration: underline;
    text-decoration-style: wavy;
    text-underline-offset: 4px;
    text-decoration-color: rgba(48, 52, 56, 0.30);
  }
  .rc-preview-head [data-regenerate-world],
  .rc-preview-head [data-regenerate-char] {
    border-color: var(--rc-line-strong);
    background: var(--rc-yellow);
    color: var(--rc-ink);
    box-shadow: 2px 2px 0 rgba(var(--rc-shadow), 0.16);
  }
  .rc-preview-head [data-regenerate-world]:hover,
  .rc-preview-head [data-regenerate-char]:hover {
    background: var(--rc-accent-soft);
    color: var(--rc-accent-d);
  }
  .rc-preview-head [data-regenerate-world]:disabled,
  .rc-preview-head [data-regenerate-char]:disabled {
    background: var(--rc-yellow-soft);
    color: var(--rc-muted);
  }
  .rc-preview-empty {
    border: 2px dashed var(--rc-line-strong);
    border-radius: 7px;
    background: var(--rc-yellow-soft);
    color: var(--rc-muted);
    padding: 18px 16px;
    text-align: center;
    font-weight: 850;
    box-shadow: 3px 4px 0 rgba(var(--rc-shadow), 0.12);
  }

  .rc-random-partial[data-hidden="true"],
  .rc-random-system-row[data-hidden="true"],
  .rc-preview-empty[data-hidden="true"],
  .rc-system-row[data-hidden="true"],
  .rc-conditional[data-hidden="true"] {
    display: none;
  }

  .rc-actions {
    position: sticky;
    bottom: 0;
    z-index: 3;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 14px 18px;
    border-top: 2px dashed rgba(48, 52, 56, 0.32);
    background:
      repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.20) 0 8px, transparent 8px 16px),
      rgba(255, 248, 223, 0.94);
  }
  #rc-status {
    display: inline-flex;
    align-items: center;
    min-height: 36px;
    padding: 7px 10px;
    border: 2px dashed transparent;
    border-radius: 6px;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease, box-shadow 120ms ease;
  }
  #rc-status[data-tone="busy"] {
    border-color: var(--rc-line-strong);
    background: var(--rc-yellow);
    color: #5d4514;
    box-shadow:
      2px 2px 0 rgba(var(--rc-shadow), 0.16),
      inset 0 -10px 0 rgba(255, 255, 255, 0.22);
    animation: rc-busy-pulse 720ms steps(2, end) infinite;
  }
  #rc-status[data-tone="success"] {
    border-color: var(--rc-line-strong);
    background: var(--rc-cool-soft);
    color: #2f6371;
    box-shadow: 2px 2px 0 rgba(var(--rc-shadow), 0.10);
  }
  #rc-status[data-tone="warn"] {
    border-color: var(--rc-line-strong);
    background: var(--rc-accent-soft);
    color: var(--rc-accent-d);
    box-shadow: 2px 2px 0 rgba(var(--rc-shadow), 0.10);
  }
  @keyframes rc-busy-pulse {
    0%, 100% { transform: rotate(-0.2deg); }
    50% { transform: rotate(0.2deg) translateY(-1px); }
  }

  .rc-done {
    margin: 14px auto;
    padding: 22px 24px;
    color: var(--rc-ink);
    font-weight: 750;
    line-height: 1.65;
  }
  .rc-done::before {
    background:
      repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.34) 0 6px, transparent 6px 12px),
      rgba(255, 219, 124, 0.72);
  }

  @media (prefers-reduced-motion: reduce) {
    .${RENDERED_CLASS} *,
    .${RENDERED_CLASS} *::before,
    .${RENDERED_CLASS} *::after {
      animation: none !important;
      transition: none !important;
    }
  }

  @media (max-width: 620px) {
    .${RENDERED_CLASS} {
      margin: 10px auto;
    }
    .rc-shell {
      box-shadow:
        3px 4px 0 rgba(var(--rc-shadow), 0.20),
        7px 8px 0 rgba(var(--rc-shadow), 0.07);
    }
    .rc-head {
      flex-direction: column;
      align-items: flex-start;
      margin: 16px 14px 10px;
      transform: rotate(0deg);
    }
    .rc-tabs {
      flex-wrap: nowrap;
      overflow-x: auto;
      padding-inline: 14px;
    }
    .rc-tab {
      flex: 0 0 auto;
    }
    .rc-sections {
      padding: 14px;
    }
    .rc-grid {
      grid-template-columns: 1fr;
      padding-inline: 14px;
    }
    .rc-actions {
      flex-direction: column;
      align-items: stretch;
      padding: 13px 14px;
    }
    .rc-actions .rc-btn,
    .rc-preview-actions,
    .rc-preview-actions .rc-btn {
      width: 100%;
    }
  }
</style>`;

function buildFormHtml(): string {
  return `<div class="${RENDERED_CLASS}">
    ${STYLE}
    ${datalistHtml('rc-relation-list', RELATION_SUGGESTIONS)}
    ${datalistHtml('rc-ability-list', ABILITY_SUGGESTIONS)}
    <div class="rc-shell">
      <div class="rc-head">
        <div>
          <div class="rc-title">逆攻略自定义模式</div>
          <div class="rc-subtitle">填写世界、user 和攻略者设定；提交后会写入当前聊天世界书与 MVU 变量。</div>
        </div>
        <div class="rc-stamp" aria-hidden="true">💌</div>
      </div>
      <div class="rc-tabs" role="tablist">
        <button class="rc-tab" type="button" data-tab-target="world" data-active="true">🌏 世界设定</button>
        <button class="rc-tab" type="button" data-tab-target="user">👤 user 设定</button>
        <button class="rc-tab" type="button" data-tab-target="characters">💞 角色设定</button>
      </div>
      <div class="rc-sections">
        <div class="rc-tab-panel" data-tab-panel="world" data-active="true">
          <details class="rc-section" open>
            <summary>
              <span class="rc-sec-title"><span class="rc-sec-ico">🌏</span>世界设定</span>
              <span class="rc-chev">⌄</span>
            </summary>
            <div class="rc-grid">
              <label class="rc-field"><span>世界类型 *</span><select id="rc-world-type">${optionsHtml(WORLD_TYPES, '现代都市')}</select></label>
              <label class="rc-field rc-conditional" id="rc-world-custom-row" data-hidden="true"><span>自定义世界类型</span><input id="rc-world-custom" placeholder="世界类型选择自定义时填写"></label>
              ${formField('时代背景', 'rc-world-era', 'placeholder="留空由 AI 推断"')}
              ${formText('主要舞台', 'rc-world-stage', 'placeholder="故事主要发生地点，留空由 AI 发挥"')}
              ${formText('世界特殊规则', 'rc-world-rules', 'placeholder="魔法体系、科技水平、末日规则等"')}
              ${formText('补充说明', 'rc-world-notes', 'placeholder="其他世界观信息"')}
            </div>
          </details>
        </div>

        <div class="rc-tab-panel" data-tab-panel="user">
          <details class="rc-section" open>
            <summary>
              <span class="rc-sec-title"><span class="rc-sec-ico">👤</span>user 设定</span>
              <span class="rc-chev">⌄</span>
            </summary>
            <div class="rc-grid">
              ${formField('名字', 'rc-user-name', 'placeholder="留空使用酒馆 user 名"')}
              ${formField('性别', 'rc-user-gender', 'value="女" disabled')}
              ${formField('年龄', 'rc-user-age', 'placeholder="如 17 / 二十多岁"')}
              ${formField('身份/职业', 'rc-user-identity', 'placeholder="高中生、冒险者、公司职员..."')}
              ${formText('外貌', 'rc-user-appearance')}
              ${formText('性格', 'rc-user-personality')}
              ${formText('补充说明', 'rc-user-notes', 'placeholder="酒馆已有 user 设定不必重复"')}
            </div>
          </details>
        </div>

        <div class="rc-tab-panel" data-tab-panel="characters">
          <div class="rc-char-list" id="rc-char-list"></div>
          <button class="rc-char-add" id="rc-add-char" type="button">＋ 添加角色</button>
        </div>
      </div>
      <div class="rc-actions">
        <span class="rc-muted" id="rc-status">至少添加 1 名角色。角色名会作为变量 key。</span>
        <button class="rc-btn rc-btn-primary" id="rc-submit" type="button">开始冒险</button>
      </div>
    </div>
  </div>`;
}

function buildCharCardHtml(index: number): string {
  return `<details class="rc-char-card" open data-char-card>
    <summary class="rc-char-summary">
      <span class="rc-sec-title"><span class="rc-sec-ico">🎭</span><span data-char-title>角色 ${index + 1}</span></span>
      <span class="rc-char-tools">
        <span class="rc-chev">⌄</span>
        <button class="rc-btn rc-btn-quiet" type="button" data-remove-char>删除</button>
      </span>
    </summary>
    <div class="rc-grid">
      ${inlineRandomInput('名字 *', 'name', 'placeholder="角色名"')}
      <label class="rc-field"><span>角色来源</span><input data-field="source" placeholder="同人可填出处，留空视为原创"></label>
      <label class="rc-field rc-field-wide"><span>世界书关键词</span><textarea data-field="worldbookKeywords" rows="1" data-auto-grow placeholder="写入聊天世界书角色条目的绿灯关键字，可用逗号或换行分隔"></textarea></label>
      <label class="rc-field"><span>性别 *</span><select data-field="gender">${optionsHtml(['女', '男', '其他'], '女')}</select></label>
      <label class="rc-field"><span>年龄</span><input data-field="age"></label>
      <label class="rc-field rc-field-wide"><span>外貌</span><textarea data-field="appearance" rows="2" data-auto-grow></textarea></label>
      <label class="rc-field rc-field-wide"><span>性格</span><textarea data-field="personality" rows="2" data-auto-grow></textarea></label>
      <label class="rc-field rc-field-wide"><span>过去经历</span><textarea data-field="past" rows="2" data-auto-grow></textarea></label>
      ${inlineRandomText('与 user 的初始关系', 'relation', 'placeholder="留空默认陌生人"')}
      <label class="rc-field"><span>攻略动机 *</span><select data-field="motivation">${optionsHtml(['系统绑定', '自然兴趣'], '系统绑定')}</select></label>
      <label class="rc-field rc-system-row"><span>绑定系统类别 *</span><select data-field="systemType">${optionsHtml(SYSTEM_TYPES, '面板/加点')}</select></label>
      <label class="rc-field rc-system-row rc-custom-system-row"><span>自定义系统名</span><input data-field="customSystemType" placeholder="系统类别选择自定义时填写"></label>
      ${inlineRandomInput('特长/能力', 'ability', 'list="rc-ability-list"')}
      <label class="rc-field rc-field-wide"><span>补充说明</span><textarea data-field="notes" rows="2" data-auto-grow></textarea></label>
    </div>
  </details>`;
}

function buildRandomFormHtml(): string {
  return `<div class="${RENDERED_CLASS}" data-random-opening>
    ${STYLE}
    ${datalistHtml('rc-relation-list', RELATION_SUGGESTIONS)}
    <div class="rc-shell">
      <div class="rc-head">
        <div>
          <div class="rc-title">逆攻略随机生成模式</div>
          <div class="rc-subtitle">先给出少量偏好，让 AI 生成世界和攻略者设定；预览可微调，确认后写入当前聊天。</div>
        </div>
        <div class="rc-stamp" aria-hidden="true">🎲</div>
      </div>
      <div class="rc-tabs" role="tablist">
        <button class="rc-tab" type="button" data-tab-target="quick" data-active="true">🎲 快速配置</button>
        <button class="rc-tab" type="button" data-tab-target="user">👤 user 设定</button>
        <button class="rc-tab" type="button" data-tab-target="characters">🎭 角色偏好</button>
        <button class="rc-tab" type="button" data-tab-target="preview">📋 预览微调</button>
      </div>
      <div class="rc-sections">
        <div class="rc-tab-panel" data-tab-panel="quick" data-active="true">
          <details class="rc-section" open>
            <summary>
              <span class="rc-sec-title"><span class="rc-sec-ico">🎲</span>快速配置</span>
              <span class="rc-chev">⌄</span>
            </summary>
            <div class="rc-grid">
              <label class="rc-field">
                <span>世界类型 *</span>
                <div class="rc-input-action">
                  <select id="rc-random-world-type">${optionsHtml([RANDOM_VALUE, ...WORLD_TYPES], RANDOM_VALUE)}</select>
                  <button class="rc-random-btn" type="button" id="rc-random-world-roll" title="随机世界类型" aria-label="随机世界类型">🎲</button>
                </div>
              </label>
              <label class="rc-field rc-conditional" id="rc-random-world-custom-row" data-hidden="true"><span>自定义世界类型</span><input id="rc-random-world-custom" placeholder="世界类型选择自定义时填写"></label>
              ${formText('世界补充说明', 'rc-random-world-notes', 'placeholder="例如：有修真体系、包含黑科技、想要轻松日常..."')}
              <label class="rc-field"><span>角色数量 *</span><input id="rc-random-char-count" type="number" min="1" max="5" step="1" value="2"></label>
              <label class="rc-field rc-field-wide">
                <span>生成方式 *</span>
                <div class="rc-radio-row" id="rc-random-mode">
                  <label class="rc-radio-pill"><input type="radio" name="rc-random-mode" data-random-mode value="full" checked> 全随机</label>
                  <label class="rc-radio-pill"><input type="radio" name="rc-random-mode" data-random-mode value="partial"> 半随机</label>
                </div>
              </label>
            </div>
          </details>
        </div>

        <div class="rc-tab-panel" data-tab-panel="user">
          <details class="rc-section" open>
            <summary>
              <span class="rc-sec-title"><span class="rc-sec-ico">👤</span>user 设定</span>
              <span class="rc-chev">⌄</span>
            </summary>
            <div class="rc-grid">
              ${formField('名字', 'rc-user-name', 'placeholder="留空使用酒馆 user 名"')}
              ${formField('性别', 'rc-user-gender', 'value="女" disabled')}
              ${formField('年龄', 'rc-user-age', 'placeholder="如 17 / 二十多岁"')}
              ${formField('身份/职业', 'rc-user-identity', 'placeholder="高中生、冒险者、公司职员..."')}
              ${formText('外貌', 'rc-user-appearance')}
              ${formText('性格', 'rc-user-personality')}
              ${formText('补充说明', 'rc-user-notes', 'placeholder="酒馆已有 user 设定不必重复"')}
            </div>
          </details>
        </div>

        <div class="rc-tab-panel" data-tab-panel="characters">
          <div class="rc-random-partial" id="rc-random-partial" data-hidden="true">
            <div class="rc-char-list" id="rc-random-char-list"></div>
          </div>
          <div class="rc-preview-empty" id="rc-random-full-hint">全随机模式会按角色数量一次性生成所有角色；切换半随机可指定名字、来源、标签和初始关系。</div>
        </div>

        <div class="rc-tab-panel" data-tab-panel="preview">
          <div id="rc-random-preview" class="rc-preview-list">
            <div class="rc-preview-empty">还没有生成预览。完成快速配置后点击底部按钮。</div>
          </div>
        </div>
      </div>
      <div class="rc-actions">
        <span class="rc-muted" id="rc-status">先生成预览，再确认写入。半随机标签来自随机池。</span>
        <div class="rc-preview-actions">
          <button class="rc-btn" id="rc-random-regenerate-all" type="button" disabled>全部重新生成</button>
          <button class="rc-btn rc-btn-primary" id="rc-random-generate" type="button">生成预览</button>
        </div>
      </div>
    </div>
  </div>`;
}

function buildRandomSeedCardHtml(index: number): string {
  const keywordButtons = Object.entries(KEYWORD_SECTIONS)
    .map(([section, keywords]) => {
      if (keywords.length === 0) return '';
      return `<div class="rc-field-wide">
      <div class="rc-muted">${escapeHtml(section)}</div>
      <div class="rc-tag-wall">
        ${keywords.map(keyword => `<button class="rc-tag" type="button" data-keyword="${escapeHtml(keyword)}">${escapeHtml(keyword)}</button>`).join('')}
      </div>
    </div>`;
    })
    .join('');

  return `<details class="rc-char-card" open data-random-char-card>
    <summary class="rc-char-summary">
      <span class="rc-sec-title"><span class="rc-sec-ico">🎭</span><span data-random-char-title>角色偏好 ${index + 1}</span></span>
      <span class="rc-chev">⌄</span>
    </summary>
    <div class="rc-grid">
      ${inlineRandomInput('名字', 'name', 'placeholder="留空由 AI 取名"')}
      <label class="rc-field"><span>角色来源</span><input data-field="source" placeholder="同人可填出处，留空视为原创"></label>
      <label class="rc-field"><span>性别</span><select data-field="gender">${optionsHtml([RANDOM_VALUE, '女', '男', '其他'], RANDOM_VALUE)}</select></label>
      <label class="rc-field"><span>攻略动机</span><select data-field="motivation">${optionsHtml([RANDOM_VALUE, '系统绑定', '自然兴趣'], RANDOM_VALUE)}</select></label>
      <label class="rc-field rc-random-system-row"><span>绑定系统类别</span><select data-field="systemType">${optionsHtml([RANDOM_VALUE, ...SYSTEM_TYPES], RANDOM_VALUE)}</select></label>
      <label class="rc-field rc-random-system-row rc-custom-system-row"><span>自定义系统名</span><input data-field="customSystemType" placeholder="系统类别选择自定义时填写"></label>
      ${inlineRandomText('初始关系', 'relation', 'placeholder="留空由 AI 决定"')}
      <label class="rc-field rc-field-wide"><span>世界书关键词</span><textarea data-field="worldbookKeywords" rows="1" data-auto-grow placeholder="写入聊天世界书角色条目的绿灯关键字，可用逗号或换行分隔"></textarea></label>
      <label class="rc-field rc-field-wide"><span>生成参考关键词</span><input data-field="keywordsCustom" placeholder="只用于辅助生成角色，可用逗号分隔，例如：冷酷,隐藏身份"></label>
      ${keywordButtons}
    </div>
  </details>`;
}

function pickOne<T>(values: T[]): T {
  return values[Math.floor(Math.random() * values.length)];
}

function getInputValue(root: ParentNode, selector: string): string {
  const el = root.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(selector);
  return clean(el?.value);
}

function getNumberValue(root: ParentNode, selector: string, fallback: number): number {
  const value = Number(getInputValue(root, selector));
  return Number.isFinite(value) ? value : fallback;
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function collectUserData(root: ParentNode): UserFormData {
  return {
    name: getInputValue(root, '#rc-user-name'),
    age: getInputValue(root, '#rc-user-age'),
    identity: getInputValue(root, '#rc-user-identity'),
    appearance: getInputValue(root, '#rc-user-appearance'),
    personality: getInputValue(root, '#rc-user-personality'),
    notes: getInputValue(root, '#rc-user-notes'),
  };
}

function setStatus(root: ParentNode, message: string, tone: 'idle' | 'busy' | 'success' | 'warn' = 'idle') {
  const el = root.querySelector<HTMLElement>('#rc-status');
  if (!el) return;
  el.textContent = message;
  if (tone === 'idle') {
    delete el.dataset.tone;
  } else {
    el.dataset.tone = tone;
  }
}

function setFieldValue(card: HTMLElement, field: string, value: string) {
  const input = card.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
    `[data-field="${field}"]`,
  );
  if (!input) return;
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

function resizeAutoGrowTextArea(textarea: HTMLTextAreaElement) {
  textarea.style.height = 'auto';
  textarea.style.height = `${Math.max(40, textarea.scrollHeight)}px`;
}

function wireAutoGrowTextareas(root: ParentNode) {
  root.querySelectorAll<HTMLTextAreaElement>('textarea[data-auto-grow]').forEach(textarea => {
    resizeAutoGrowTextArea(textarea);
    textarea.addEventListener('input', () => resizeAutoGrowTextArea(textarea));
  });
}

function syncWorldCustom(root: HTMLElement) {
  const worldType = getInputValue(root, '#rc-world-type');
  const customRow = root.querySelector<HTMLElement>('#rc-world-custom-row');
  if (customRow) customRow.dataset.hidden = worldType === '自定义' ? 'false' : 'true';
}

function wireTabs(root: HTMLElement) {
  const tabs = [...root.querySelectorAll<HTMLElement>('[data-tab-target]')];
  const panels = [...root.querySelectorAll<HTMLElement>('[data-tab-panel]')];
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tabTarget;
      tabs.forEach(item => {
        item.dataset.active = item === tab ? 'true' : 'false';
      });
      panels.forEach(panel => {
        panel.dataset.active = panel.dataset.tabPanel === target ? 'true' : 'false';
      });
    });
  });
}

function syncSystemRows(card: HTMLElement) {
  const motivation = getInputValue(card, '[data-field="motivation"]');
  const systemType = getInputValue(card, '[data-field="systemType"]');
  const systemHidden = motivation !== '系统绑定';
  card.querySelectorAll<HTMLElement>('.rc-system-row').forEach(row => {
    row.dataset.hidden = systemHidden ? 'true' : 'false';
  });
  const customSystemRow = card.querySelector<HTMLElement>('.rc-custom-system-row');
  if (customSystemRow) {
    customSystemRow.dataset.hidden = !systemHidden && systemType === '自定义' ? 'false' : 'true';
  }
}

function syncCharTitle(card: HTMLElement, index: number) {
  const name = getInputValue(card, '[data-field="name"]');
  const gender = getInputValue(card, '[data-field="gender"]') || '未设定';
  const title = card.querySelector<HTMLElement>('[data-char-title]');
  if (title) title.textContent = name ? `${name}（${gender}）` : `角色 ${index + 1}`;
}

function wireCharCard(container: HTMLElement, card: HTMLElement) {
  const refresh = () => {
    [...container.querySelectorAll<HTMLElement>('[data-char-card]')].forEach((item, idx) => syncCharTitle(item, idx));
  };
  wireAutoGrowTextareas(card);
  card.querySelector('[data-field="motivation"]')?.addEventListener('change', () => syncSystemRows(card));
  card.querySelector('[data-field="systemType"]')?.addEventListener('change', () => syncSystemRows(card));
  card.querySelectorAll('input,textarea,select').forEach(el => el.addEventListener('input', refresh));
  card.querySelectorAll<HTMLElement>('[data-random-field]').forEach(button =>
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      const field = button.dataset.randomField;
      if (!field) return;
      if (field === 'name') {
        const gender = getInputValue(card, '[data-field="gender"]') as '女' | '男' | '其他';
        setFieldValue(card, 'name', randomCharacterName(gender || '其他'));
        refresh();
        return;
      }
      if (field === 'relation') {
        setFieldValue(card, 'relation', pickOne(RELATION_SUGGESTIONS));
        return;
      }
      if (field === 'ability') {
        setFieldValue(card, 'ability', pickOne(ABILITY_SUGGESTIONS));
      }
    }),
  );
  card.querySelector('[data-remove-char]')?.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    if (container.querySelectorAll('[data-char-card]').length <= 1) {
      toastr.warning('至少保留 1 名角色', '逆攻略');
      return;
    }
    card.remove();
    refresh();
  });
  syncSystemRows(card);
  refresh();
}

function addCharCard(container: HTMLElement) {
  const index = container.querySelectorAll('[data-char-card]').length;
  const wrapper = parentDoc.createElement('div');
  wrapper.innerHTML = buildCharCardHtml(index);
  const card = wrapper.firstElementChild as HTMLElement;
  container.appendChild(card);
  wireCharCard(container, card);
}

function collectConfig(root: HTMLElement): OpeningConfig {
  const worldTypeSelect = getInputValue(root, '#rc-world-type');
  const worldCustom = getInputValue(root, '#rc-world-custom');
  const worldType = worldTypeSelect === '自定义' ? worldCustom : worldTypeSelect;

  const characters = [...root.querySelectorAll<HTMLElement>('[data-char-card]')].map(card => {
    const systemTypeSelect = getInputValue(card, '[data-field="systemType"]');
    const customSystemType = getInputValue(card, '[data-field="customSystemType"]');
    const motivation = getInputValue(card, '[data-field="motivation"]') as Motivation;
    return {
      name: getInputValue(card, '[data-field="name"]'),
      source: getInputValue(card, '[data-field="source"]'),
      worldbookKeywords: splitKeywords(getInputValue(card, '[data-field="worldbookKeywords"]')),
      gender: getInputValue(card, '[data-field="gender"]'),
      age: getInputValue(card, '[data-field="age"]'),
      appearance: getInputValue(card, '[data-field="appearance"]'),
      personality: getInputValue(card, '[data-field="personality"]'),
      past: getInputValue(card, '[data-field="past"]'),
      relation: getInputValue(card, '[data-field="relation"]') || '陌生人',
      motivation,
      systemType:
        motivation === '系统绑定' ? (systemTypeSelect === '自定义' ? customSystemType : systemTypeSelect) : '',
      ability: getInputValue(card, '[data-field="ability"]'),
      notes: getInputValue(card, '[data-field="notes"]'),
    };
  });

  return {
    world: {
      worldType,
      era: getInputValue(root, '#rc-world-era'),
      stage: getInputValue(root, '#rc-world-stage'),
      rules: getInputValue(root, '#rc-world-rules'),
      notes: getInputValue(root, '#rc-world-notes'),
    },
    user: collectUserData(root),
    characters,
  };
}

function selectedKeywords(card: HTMLElement): string[] {
  const fromButtons = [...card.querySelectorAll<HTMLElement>('[data-keyword][data-active="true"]')].map(button =>
    clean(button.dataset.keyword),
  );
  const custom = splitKeywords(getInputValue(card, '[data-field="keywordsCustom"]'));
  return uniqueStrings([...fromButtons, ...custom]);
}

function collectRandomSeed(root: HTMLElement): RandomOpeningSeed {
  const selectedWorldType = getInputValue(root, '#rc-random-world-type');
  const customWorldType = getInputValue(root, '#rc-random-world-custom');
  const mode = (getInputValue(root, 'input[data-random-mode]:checked') || 'full') as 'full' | 'partial';
  const count = clampNumber(Math.round(getNumberValue(root, '#rc-random-char-count', 2)), 1, 5);
  const characters =
    mode === 'partial'
      ? [...root.querySelectorAll<HTMLElement>('[data-random-char-card]')].slice(0, count).map(card => {
          const systemType = getInputValue(card, '[data-field="systemType"]');
          return {
            name: getInputValue(card, '[data-field="name"]'),
            source: getInputValue(card, '[data-field="source"]'),
            gender: getInputValue(card, '[data-field="gender"]'),
            motivation: getInputValue(card, '[data-field="motivation"]'),
            systemType,
            customSystemType: systemType === '自定义' ? getInputValue(card, '[data-field="customSystemType"]') : '',
            relation: getInputValue(card, '[data-field="relation"]'),
            keywords: selectedKeywords(card),
            worldbookKeywords: splitKeywords(getInputValue(card, '[data-field="worldbookKeywords"]')),
          };
        })
      : [];

  return {
    worldType: selectedWorldType,
    customWorldType,
    worldNotes: getInputValue(root, '#rc-random-world-notes'),
    user: collectUserData(root),
    count,
    mode,
    characters,
  };
}

function getAbilitySuggestionsForWorld(worldType: string): string[] {
  const common = ABILITY_SECTIONS['通用'] ?? [];
  const matched = Object.entries(ABILITY_SECTIONS)
    .filter(
      ([section]) =>
        section !== '通用' &&
        section.split(/\s*\/\s*/).some(part => worldType.includes(part) || part.includes(worldType)),
    )
    .flatMap(([, values]) => values);
  return uniqueStrings([...common, ...matched, ...ABILITY_SUGGESTIONS]);
}

function resolveWorldType(seed: RandomOpeningSeed): string {
  if (seed.worldType === '自定义') return seed.customWorldType || '自定义世界';
  if (seed.worldType && seed.worldType !== RANDOM_VALUE) return seed.worldType;
  return pickOne(RANDOM_WORLD_TYPES);
}

function normalizeGender(value: string, seedValue = ''): string {
  const candidate = [value, seedValue].map(clean).find(item => ['女', '男', '其他'].includes(item));
  return candidate ?? pickOne(['女', '男', '其他']);
}

function normalizeMotivation(value: string, seedValue = ''): Motivation {
  const candidate = [value, seedValue].map(clean).find(item => item === '系统绑定' || item === '自然兴趣');
  return (candidate ?? pickOne<Motivation>(['系统绑定', '自然兴趣'])) as Motivation;
}

function normalizeSystemType(value: string, seed: RandomCharacterSeed | undefined, motivation: Motivation): string {
  if (motivation !== '系统绑定') return '';
  const candidates = [
    clean(value),
    seed?.systemType === '自定义' ? clean(seed.customSystemType) : clean(seed?.systemType),
  ].filter(item => item && item !== RANDOM_VALUE);
  if (candidates[0] && candidates[0] !== '自定义') return candidates[0];
  if (candidates[0] === '自定义' && seed?.customSystemType) return seed.customSystemType;
  return pickOne(SYSTEM_TYPES.filter(type => type !== '自定义'));
}

function pickSome<T>(values: T[], count: number): T[] {
  const pool = [...values];
  const result: T[] = [];
  while (pool.length > 0 && result.length < count) {
    const index = Math.floor(Math.random() * pool.length);
    result.push(pool.splice(index, 1)[0]);
  }
  return result;
}

function buildLocalRandomConfig(seed: RandomOpeningSeed): OpeningConfig {
  const worldType = resolveWorldType(seed);
  const preset = WORLD_PRESETS[worldType];
  const abilityPool = getAbilitySuggestionsForWorld(worldType);

  const characters = Array.from({ length: seed.count }, (_unused, index) => {
    const seedChar = seed.mode === 'partial' ? seed.characters[index] : undefined;
    const gender = normalizeGender('', seedChar?.gender);
    const motivation = normalizeMotivation('', seedChar?.motivation);
    const systemType = normalizeSystemType('', seedChar, motivation);
    const keywords = seedChar?.keywords.length ? seedChar.keywords : pickSome(KEYWORD_SUGGESTIONS, 2);
    const relation = seedChar?.relation || pickOne(RELATION_SUGGESTIONS);
    const ability = pickOne(abilityPool.length > 0 ? abilityPool : ABILITY_SUGGESTIONS);
    const name = seedChar?.name || randomCharacterName(gender as '女' | '男' | '其他');

    return {
      name,
      source: seedChar?.source ?? '',
      worldbookKeywords: seedChar?.worldbookKeywords ?? [],
      gender,
      age: '',
      appearance: `${gender}，外貌气质贴合「${keywords.slice(0, 2).join('、') || worldType}」的印象。`,
      personality: keywords.length > 0 ? keywords.join('、') : '主动、在意 <user> 的反应',
      past: seedChar?.source
        ? `来自${seedChar.source}，来到当前世界后被卷入对 <user> 的攻略。`
        : `在${worldType}中有一段尚未完全揭开的过去。`,
      relation,
      motivation,
      systemType,
      ability,
      notes: `随机生成参考关键词：${keywords.join('、') || '无'}。`,
    };
  });

  return {
    world: {
      worldType,
      era: pickOne(preset?.era.length ? preset.era : ['由 AI 根据世界类型补全']),
      stage: pickOne(preset?.stage.length ? preset.stage : ['由 AI 根据世界类型补全']),
      rules: pickSome(preset?.rules.length ? preset.rules : ['系统仅宿主可见'], 2).join('；'),
      notes: seed.worldNotes,
    },
    user: seed.user,
    characters,
  };
}

function buildRandomPrompt(seed: RandomOpeningSeed): string {
  const worldType = resolveWorldType(seed);
  const partialCharacters =
    seed.mode === 'partial'
      ? seed.characters.map((character, index) => {
          const { worldbookKeywords: _worldbookKeywords, ...storySeed } = character;
          return {
            index: index + 1,
            ...storySeed,
          };
        })
      : [];

  return `你正在为 SillyTavern 角色卡《逆攻略》生成开场设定。

玩法核心:
- 多名角色主动攻略 <user>，<user> 性别固定为女，且始终处于叙事上位。
- 角色的攻略动机只能是“系统绑定”或“自然兴趣”。
- 系统绑定型角色需要一个系统类别；自然兴趣型角色不绑定系统。
- 角色之间可以争宠，但冲突不能让 <user> 承受负面影响。

用户快速配置:
${JSON.stringify(
  {
    worldType,
    worldNotes: seed.worldNotes,
    user: seed.user,
    characterCount: seed.count,
    mode: seed.mode,
    partialCharacters,
  },
  null,
  2,
)}

可参考随机池:
<world_pool>
${worldPoolText}
</world_pool>
<keyword_pool>
${keywordPoolText}
</keyword_pool>
<relation_pool>
${relationPoolText}
</relation_pool>
<ability_pool>
${abilityPoolText}
</ability_pool>

请只输出 JSON，不要输出解释、Markdown 或代码块。
字段要求:
- world.worldType/era/stage/rules/notes 都要给出可直接写入世界书的中文文本。
- user 字段代表 <user> 的补充设定；保留用户已填写内容，可适度补空，但不要改变 <user> 性别女。
- characters 数量必须等于 ${seed.count}。
- 每个角色必须包含 name、source、gender、age、appearance、personality、past、relation、motivation、systemType、ability、notes。
- motivation 只能是“系统绑定”或“自然兴趣”；自然兴趣型 systemType 必须为空字符串。
- 角色名字不得重复。`;
}

function stringifyContentParts(value: unknown): string {
  if (typeof value === 'string') return value;
  if (!Array.isArray(value)) return '';
  return value
    .map(part => {
      if (typeof part === 'string') return part;
      if (part && typeof part === 'object') return clean((part as any).text ?? (part as any).content);
      return '';
    })
    .filter(Boolean)
    .join('\n');
}

function extractGeneratedText(result: string | GenerateToolCallResult | Record<string, any>): string {
  if (typeof result === 'string') return result;
  if (result && typeof result === 'object') {
    const candidates = [
      (result as any).content,
      (result as any).message?.content,
      (result as any).choices?.[0]?.message?.content,
      (result as any).choices?.[0]?.text,
      (result as any).output_text,
    ];
    const content = candidates.map(stringifyContentParts).find(Boolean);
    if (content) return content;
  }
  throw new Error('AI 未返回可解析的文本内容。');
}

function stripThinkingText(text: string): string {
  return text
    .replace(/<think>[\s\S]*?(?:<\/think>|$)/gi, '')
    .replace(/<thinking>[\s\S]*?(?:<\/thinking>|$)/gi, '')
    .trim();
}

function collectJsonObjectTexts(text: string): string[] {
  const cleaned = stripThinkingText(text);
  const fenced = [...cleaned.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)].map(match => match[1]);
  const sources = uniqueStrings([...fenced, cleaned]);
  const candidates: string[] = [];

  for (const source of sources) {
    for (let start = source.indexOf('{'); start >= 0; start = source.indexOf('{', start + 1)) {
      let depth = 0;
      let inString = false;
      let escaped = false;

      for (let index = start; index < source.length; index++) {
        const char = source[index];
        if (inString) {
          if (escaped) {
            escaped = false;
          } else if (char === '\\') {
            escaped = true;
          } else if (char === '"') {
            inString = false;
          }
          continue;
        }
        if (char === '"') {
          inString = true;
          continue;
        }
        if (char === '{') depth++;
        if (char === '}') {
          depth--;
          if (depth === 0) {
            candidates.push(source.slice(start, index + 1));
            break;
          }
        }
      }
    }
  }

  return uniqueStrings(candidates);
}

function parseGeneratedJson(text: string): any {
  const parsed = collectJsonObjectTexts(text)
    .map(candidate => {
      try {
        return JSON.parse(candidate);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
  const config = parsed.find(value => value?.world && Array.isArray(value?.characters)) ?? parsed[0];
  if (!config) throw new Error('AI 未返回 JSON 对象。');
  return config;
}

function normalizeGeneratedConfig(raw: any, seed: RandomOpeningSeed): OpeningConfig {
  const fallback = buildLocalRandomConfig(seed);
  const worldType = clean(raw?.world?.worldType) || fallback.world.worldType;
  const names = new Set<string>();

  const characters = Array.from({ length: seed.count }, (_unused, index) => {
    const rawChar = raw?.characters?.[index] ?? {};
    const seedChar = seed.mode === 'partial' ? seed.characters[index] : undefined;
    const gender = normalizeGender(rawChar.gender, seedChar?.gender);
    const motivation = normalizeMotivation(rawChar.motivation, seedChar?.motivation);
    const systemType = normalizeSystemType(rawChar.systemType, seedChar, motivation);
    let name =
      clean(rawChar.name) ||
      seedChar?.name ||
      fallback.characters[index]?.name ||
      randomCharacterName(gender as '女' | '男' | '其他');
    if (names.has(name)) name = `${name}${index + 1}`;
    names.add(name);
    const rawWorldbookKeywords = splitKeywords(rawChar.worldbookKeywords);

    return {
      name,
      source: clean(rawChar.source) || seedChar?.source || '',
      worldbookKeywords:
        rawWorldbookKeywords.length > 0
          ? rawWorldbookKeywords
          : (seedChar?.worldbookKeywords ?? fallback.characters[index]?.worldbookKeywords ?? []),
      gender,
      age: clean(rawChar.age),
      appearance: clean(rawChar.appearance) || fallback.characters[index]?.appearance || '',
      personality: clean(rawChar.personality) || fallback.characters[index]?.personality || '',
      past: clean(rawChar.past) || fallback.characters[index]?.past || '',
      relation: clean(rawChar.relation) || seedChar?.relation || fallback.characters[index]?.relation || '陌生人',
      motivation,
      systemType,
      ability: clean(rawChar.ability) || fallback.characters[index]?.ability || '',
      notes: clean(rawChar.notes) || fallback.characters[index]?.notes || '',
    };
  });

  return {
    world: {
      worldType,
      era: clean(raw?.world?.era) || fallback.world.era,
      stage: clean(raw?.world?.stage) || fallback.world.stage,
      rules: clean(raw?.world?.rules) || fallback.world.rules,
      notes: clean(raw?.world?.notes) || seed.worldNotes || fallback.world.notes,
    },
    user: {
      name: clean(raw?.user?.name) || seed.user.name,
      age: clean(raw?.user?.age) || seed.user.age,
      identity: clean(raw?.user?.identity) || seed.user.identity,
      appearance: clean(raw?.user?.appearance) || seed.user.appearance,
      personality: clean(raw?.user?.personality) || seed.user.personality,
      notes: clean(raw?.user?.notes) || seed.user.notes,
    },
    characters,
  };
}

async function generateRandomOpeningConfig(
  seed: RandomOpeningSeed,
): Promise<{ config: OpeningConfig; usedFallback: boolean }> {
  try {
    const prompt = buildRandomPrompt(seed);
    const result = await generateRaw({
      should_silence: true,
      max_chat_history: 0,
      ordered_prompts: [{ role: 'user', content: prompt }],
    });
    return {
      config: normalizeGeneratedConfig(parseGeneratedJson(extractGeneratedText(result)), seed),
      usedFallback: false,
    };
  } catch (err) {
    console.warn('[逆攻略] 随机开场 AI 生成失败，使用本地随机兜底:', err);
    return { config: buildLocalRandomConfig(seed), usedFallback: true };
  }
}

function validateConfig(config: OpeningConfig): string | null {
  if (!config.world.worldType) return '请填写世界类型。';
  if (config.characters.length === 0) return '至少需要 1 名角色。';
  const names = new Set<string>();
  for (const character of config.characters) {
    if (!character.name) return '每名角色都需要名字。';
    if (names.has(character.name)) return `角色名重复：${character.name}`;
    names.add(character.name);
    if (!character.gender) return `角色 ${character.name} 需要选择性别。`;
    if (!character.motivation) return `角色 ${character.name} 需要选择攻略动机。`;
    if (character.motivation === '系统绑定' && !character.systemType) {
      return `角色 ${character.name} 选择了系统绑定，需要填写系统类别。`;
    }
  }
  return null;
}

function previewInput(label: string, field: string, value: string, wide = false): string {
  return `<label class="rc-field${wide ? ' rc-field-wide' : ''}">
    <span>${label}</span>
    <input data-field="${field}" value="${escapeHtml(value)}">
  </label>`;
}

function previewText(label: string, field: string, value: string): string {
  return `<label class="rc-field rc-field-wide">
    <span>${label}</span>
    <textarea data-field="${field}" rows="2" data-auto-grow>${escapeHtml(value)}</textarea>
  </label>`;
}

function buildPreviewHtml(config: OpeningConfig): string {
  const world = config.world;
  const characters = config.characters
    .map(
      (character, index) => `<div class="rc-preview-card" data-preview-char-card>
    <div class="rc-preview-head">
      <span>${escapeHtml(character.name || `角色 ${index + 1}`)}</span>
      <button class="rc-btn rc-btn-quiet" type="button" data-regenerate-char="${index}">重新生成</button>
    </div>
    <div class="rc-grid">
      ${previewInput('名字 *', 'name', character.name)}
      ${previewInput('角色来源', 'source', character.source)}
      ${previewText('世界书关键词', 'worldbookKeywords', keywordsToInputValue(character.worldbookKeywords ?? []))}
      <label class="rc-field"><span>性别 *</span><select data-field="gender">${optionsHtml(['女', '男', '其他'], character.gender)}</select></label>
      ${previewInput('年龄', 'age', character.age)}
      ${previewText('外貌', 'appearance', character.appearance)}
      ${previewText('性格', 'personality', character.personality)}
      ${previewText('过去经历', 'past', character.past)}
      ${previewText('与 user 的初始关系', 'relation', character.relation)}
      <label class="rc-field"><span>攻略动机 *</span><select data-field="motivation">${optionsHtml(['系统绑定', '自然兴趣'], character.motivation)}</select></label>
      <label class="rc-field rc-system-row"><span>绑定系统类别 *</span><input data-field="systemType" value="${escapeHtml(character.systemType)}"></label>
      ${previewInput('特长/能力', 'ability', character.ability)}
      ${previewText('补充说明', 'notes', character.notes)}
    </div>
  </div>`,
    )
    .join('');

  return `<div class="rc-preview-card">
    <div class="rc-preview-head">
      <span>世界设定预览</span>
      <button class="rc-btn rc-btn-quiet" type="button" data-regenerate-world>重新生成</button>
    </div>
    <div class="rc-grid" data-preview-world>
      ${previewInput('世界类型 *', 'worldType', world.worldType)}
      ${previewInput('时代背景', 'era', world.era)}
      ${previewText('主要舞台', 'stage', world.stage)}
      ${previewText('世界特殊规则', 'rules', world.rules)}
      ${previewText('补充说明', 'notes', world.notes)}
    </div>
  </div>
  ${characters}`;
}

function collectPreviewConfig(root: HTMLElement): OpeningConfig {
  const worldRoot = root.querySelector<HTMLElement>('[data-preview-world]');
  const characters = [...root.querySelectorAll<HTMLElement>('[data-preview-char-card]')].map(card => {
    const motivation = getInputValue(card, '[data-field="motivation"]') as Motivation;
    return {
      name: getInputValue(card, '[data-field="name"]'),
      source: getInputValue(card, '[data-field="source"]'),
      worldbookKeywords: splitKeywords(getInputValue(card, '[data-field="worldbookKeywords"]')),
      gender: getInputValue(card, '[data-field="gender"]'),
      age: getInputValue(card, '[data-field="age"]'),
      appearance: getInputValue(card, '[data-field="appearance"]'),
      personality: getInputValue(card, '[data-field="personality"]'),
      past: getInputValue(card, '[data-field="past"]'),
      relation: getInputValue(card, '[data-field="relation"]') || '陌生人',
      motivation,
      systemType: motivation === '系统绑定' ? getInputValue(card, '[data-field="systemType"]') : '',
      ability: getInputValue(card, '[data-field="ability"]'),
      notes: getInputValue(card, '[data-field="notes"]'),
    };
  });

  return {
    world: {
      worldType: worldRoot ? getInputValue(worldRoot, '[data-field="worldType"]') : '',
      era: worldRoot ? getInputValue(worldRoot, '[data-field="era"]') : '',
      stage: worldRoot ? getInputValue(worldRoot, '[data-field="stage"]') : '',
      rules: worldRoot ? getInputValue(worldRoot, '[data-field="rules"]') : '',
      notes: worldRoot ? getInputValue(worldRoot, '[data-field="notes"]') : '',
    },
    user: collectUserData(root),
    characters,
  };
}

function buildWorldEntry(config: OpeningConfig): string {
  return `<rc_world_setting>
世界设定:
${blockField('世界类型', config.world.worldType)}
${blockField('时代背景', config.world.era)}
${blockField('主要舞台', config.world.stage)}
${blockField('世界特殊规则', config.world.rules)}
${blockField('补充说明', config.world.notes)}
</rc_world_setting>`;
}

function buildUserEntry(config: OpeningConfig): string {
  return `<rc_user_setting>
<user>设定:
  性别: |-
    女
${blockField('名字', config.user.name)}
${blockField('年龄', config.user.age)}
${blockField('身份', config.user.identity)}
${blockField('外貌', config.user.appearance)}
${blockField('性格', config.user.personality)}
${blockField('补充说明', config.user.notes)}
</rc_user_setting>`;
}

function buildCharacterStateEjs(charNameLiteral: string): string {
  return `<%_ { const rcCharName = ${charNameLiteral}; const rcCharData = (getvar('stat_data.角色', { defaults: {} }) ?? {})[rcCharName]; if (rcCharData) { _%>
<角色状态>
<%- JSON.stringify(rcCharData) %>
</角色状态>
<%_ } } _%>`;
}

function buildCharacterEntry(character: CharacterFormData): string {
  const charNameLiteral = JSON.stringify(character.name);
  return `<rc_character name="${escapeHtml(character.name)}">
角色:
${blockField('名字', character.name)}
${blockField('角色来源', character.source)}
${blockField('性别', character.gender)}
${blockField('年龄', character.age)}
${blockField('外貌', character.appearance)}
${blockField('性格', character.personality)}
${blockField('过去经历', character.past)}
${blockField('与<user>的初始关系', character.relation)}
${blockField('攻略动机', character.motivation)}
${blockField('绑定系统类别', character.systemType)}
${blockField('特长', character.ability)}
${blockField('补充说明', character.notes)}
${buildCharacterStateEjs(charNameLiteral)}
</rc_character>`;
}

function entryBase(name: string, content: string, order: number, type: 'constant' | 'selective', keys: string[] = []) {
  const scanDepth: 4 | 'same_as_global' = type === 'selective' ? 4 : 'same_as_global';
  return {
    name,
    enabled: true,
    strategy: {
      type,
      keys,
      keys_secondary: { logic: 'and_any' as const, keys: [] },
      scan_depth: scanDepth,
    },
    position: {
      type: 'before_character_definition' as const,
      role: 'system' as const,
      depth: 0,
      order,
    },
    content,
    probability: 100,
    recursion: {
      prevent_incoming: true,
      prevent_outgoing: true,
      delay_until: null,
    },
  };
}

async function writeChatWorldbook(config: OpeningConfig) {
  const worldbookName = await getOrCreateChatWorldbook('current');
  const desired = [
    entryBase(`${CHAT_ENTRY_PREFIX}世界设定`, buildWorldEntry(config), 1, 'constant'),
    entryBase(`${CHAT_ENTRY_PREFIX}user设定`, buildUserEntry(config), 2, 'constant'),
    ...config.characters.map((character, index) =>
      entryBase(
        `${CHAT_ENTRY_PREFIX}角色:${character.name}`,
        buildCharacterEntry(character),
        3 + index,
        'selective',
        uniqueStrings([character.name, character.source, ...character.worldbookKeywords]),
      ),
    ),
  ];

  const existing = await getWorldbook(worldbookName);
  const desiredNames = new Set(desired.map(entry => entry.name));
  const toCreate = desired.filter(entry => !existing.some(item => item.name === entry.name));

  await updateWorldbookWith(
    worldbookName,
    entries =>
      entries.map(entry => {
        const replacement = desired.find(item => item.name === entry.name);
        if (replacement) {
          return { ...entry, ...replacement };
        }
        if (entry.name.startsWith(`${CHAT_ENTRY_PREFIX}角色:`) && !desiredNames.has(entry.name)) {
          return { ...entry, enabled: false };
        }
        return entry;
      }),
    { render: 'debounced' },
  );

  if (toCreate.length > 0) {
    await createWorldbookEntries(worldbookName, toCreate, { render: 'debounced' });
  }
}

function buildTasks(config: OpeningConfig) {
  const tasks: Record<string, any> = _.cloneDeep(COMMON_TASKS);
  const selectedSystems = [
    ...new Set(
      config.characters
        .filter(character => character.motivation === '系统绑定')
        .map(character => character.systemType)
        .filter(systemType => SYSTEM_TASKS[systemType]),
    ),
  ];

  for (const systemType of selectedSystems) {
    for (const [taskName, task] of Object.entries(SYSTEM_TASKS[systemType])) {
      tasks[`[${systemType}]${taskName}`] = _.cloneDeep(task);
    }
  }
  return tasks;
}

function buildStatData(config: OpeningConfig) {
  return {
    user: { $利益点数: 0 },
    角色: Object.fromEntries(
      config.characters.map(character => [
        character.name,
        {
          _性别: character.gender,
          _与user的初始关系: character.relation || '陌生人',
          _攻略动机: character.motivation,
          _user好感度: 0,
          _攻略阶段: '无感',
          当前攻略行为: '尚未行动',
          绑定系统: character.motivation === '系统绑定' ? character.systemType : null,
          系统任务: null,
          系统积分: 0,
          $利益贡献: 0,
          持有物品: {},
          心情: '平静',
        },
      ]),
    ),
    任务列表: buildTasks(config),
    商城: _.cloneDeep(COMMON_SHOP),
    系统日志: [],
  };
}

async function writeMvuData(messageId: number, config: OpeningConfig) {
  const mvu = await ensureMvuApi();
  const mvuData = mvu.getMvuData({ type: 'message', message_id: messageId });
  _.set(mvuData, 'stat_data', buildStatData(config));
  await mvu.replaceMvuData(mvuData, { type: 'message', message_id: messageId });
}

function buildSummaryText(config: OpeningConfig, modeLabel = '自定义模式'): string {
  const characters = config.characters
    .map(character => {
      const systemLine =
        character.motivation === '系统绑定' ? `绑定系统：${character.systemType}` : '绑定系统：无（自然兴趣型）';
      return `- ${character.name}（${character.gender}）：${character.source || '原创'}；初始关系：${character.relation || '陌生人'}；攻略动机：${character.motivation}；${systemLine}`;
    })
    .join('\n');

  return `[逆攻略${modeLabel}配置完成]

请根据当前聊天世界书中的 <rc_world_setting>、<rc_user_setting>、<rc_character> 条目生成正式开场。

本轮概要:
- 世界类型：${config.world.worldType}
- <user>显示名：${config.user.name || '未填写，使用酒馆当前 user 名'}
- 角色数量：${config.characters.length}
${characters}

开场要求:
- 角色必须主动攻略 <user>，<user> 始终处于上位。
- 不要让 <user> 为任何角色解决麻烦或承受负面影响。
- 如果角色是系统绑定型，请让系统任务自然成为 ta 接近 <user> 的推动力。
- 如果角色是自然兴趣型，请让 ta 的主动接近来自自身兴趣与情感。
- 第一幕需要让至少一名角色开始接近 <user>，并留下后续互动入口。`;
}

function buildDoneHtml(modeLabel = '自定义配置'): string {
  return `<div class="${RENDERED_CLASS}"><div class="rc-done">${escapeHtml(modeLabel)}已写入，正式剧情已经开始。后续可在状态栏查看角色、任务与商城；如需重设，请重开本条开场。</div></div>`;
}

async function submitOpeningConfig(
  messageId: number,
  config: OpeningConfig,
  $mesText: JQuery<HTMLElement>,
  root: HTMLElement,
  submitButton: HTMLButtonElement,
  labels: { summary: string; done: string; idle: string },
) {
  const error = validateConfig(config);
  if (error) {
    toastr.warning(error, '逆攻略');
    setStatus(root, error);
    return;
  }

  try {
    submitButton.disabled = true;
    submitButton.textContent = '写入中...';
    setStatus(root, '正在写入聊天世界书与变量...');
    await writeChatWorldbook(config);
    await writeMvuData(messageId, config);
    await createChatMessages([{ role: 'user', message: buildSummaryText(config, labels.summary) }]);
    $mesText.find(`.${RENDERED_CLASS}`).remove();
    $mesText.append(buildDoneHtml(labels.done));
    toastr.success(`${labels.done}已写入，正在生成开场。`, '逆攻略');
  } catch (err: any) {
    console.error('[逆攻略] 开场配置提交失败:', err);
    toastr.error(`提交失败：${err?.message ?? err}`, '逆攻略');
    submitButton.disabled = false;
    submitButton.textContent = labels.idle;
    setStatus(root, '提交失败，请查看控制台。');
  }
}

function wireCustomOpening(root: HTMLElement, messageId: number, $mesText: JQuery<HTMLElement>) {
  const charList = root.querySelector<HTMLElement>('#rc-char-list');
  if (!charList) return;

  wireTabs(root);
  wireAutoGrowTextareas(root);
  syncWorldCustom(root);
  root.querySelector('#rc-world-type')?.addEventListener('change', () => syncWorldCustom(root));
  addCharCard(charList);

  root.querySelector('#rc-add-char')?.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    addCharCard(charList);
  });

  root.querySelector('#rc-submit')?.addEventListener('click', async event => {
    event.preventDefault();
    const submitButton = event.currentTarget as HTMLButtonElement;
    const config = collectConfig(root);
    await submitOpeningConfig(messageId, config, $mesText, root, submitButton, {
      summary: '自定义模式',
      done: '自定义配置',
      idle: '开始冒险',
    });
  });
}

function syncRandomWorldCustom(root: HTMLElement) {
  const worldType = getInputValue(root, '#rc-random-world-type');
  const customRow = root.querySelector<HTMLElement>('#rc-random-world-custom-row');
  if (customRow) customRow.dataset.hidden = worldType === '自定义' ? 'false' : 'true';
}

function syncRandomMode(root: HTMLElement) {
  const mode = getInputValue(root, 'input[data-random-mode]:checked') || 'full';
  const partial = root.querySelector<HTMLElement>('#rc-random-partial');
  const fullHint = root.querySelector<HTMLElement>('#rc-random-full-hint');
  if (partial) partial.dataset.hidden = mode === 'partial' ? 'false' : 'true';
  if (fullHint) fullHint.dataset.hidden = mode === 'partial' ? 'true' : 'false';
}

function syncRandomSystemRows(card: HTMLElement) {
  const motivation = getInputValue(card, '[data-field="motivation"]');
  const systemType = getInputValue(card, '[data-field="systemType"]');
  const systemHidden = motivation === '自然兴趣';
  card.querySelectorAll<HTMLElement>('.rc-random-system-row').forEach(row => {
    row.dataset.hidden = systemHidden ? 'true' : 'false';
  });
  const customRow = card.querySelector<HTMLElement>('.rc-custom-system-row');
  if (customRow) customRow.dataset.hidden = !systemHidden && systemType === '自定义' ? 'false' : 'true';
}

function wireRandomSeedCard(card: HTMLElement) {
  const refreshTitle = () => {
    const title = card.querySelector<HTMLElement>('[data-random-char-title]');
    const name = getInputValue(card, '[data-field="name"]');
    const gender = getInputValue(card, '[data-field="gender"]');
    if (title)
      title.textContent = name
        ? `${name}（${gender || RANDOM_VALUE}）`
        : title.textContent?.replace(/（.*）$/, '') || '角色偏好';
  };

  wireAutoGrowTextareas(card);
  card.querySelectorAll<HTMLElement>('[data-keyword]').forEach(button =>
    button.addEventListener('click', event => {
      event.preventDefault();
      button.dataset.active = button.dataset.active === 'true' ? 'false' : 'true';
    }),
  );
  card.querySelectorAll<HTMLElement>('[data-random-field]').forEach(button =>
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      const field = button.dataset.randomField;
      if (field === 'name') {
        const gender = normalizeGender('', getInputValue(card, '[data-field="gender"]'));
        setFieldValue(card, 'name', randomCharacterName(gender as '女' | '男' | '其他'));
        refreshTitle();
      }
      if (field === 'relation') {
        setFieldValue(card, 'relation', pickOne(RELATION_SUGGESTIONS));
      }
    }),
  );
  card.querySelector('[data-field="motivation"]')?.addEventListener('change', () => syncRandomSystemRows(card));
  card.querySelector('[data-field="systemType"]')?.addEventListener('change', () => syncRandomSystemRows(card));
  card.querySelectorAll('input,select,textarea').forEach(el => el.addEventListener('input', refreshTitle));
  syncRandomSystemRows(card);
}

function rebuildRandomSeedCards(root: HTMLElement) {
  const list = root.querySelector<HTMLElement>('#rc-random-char-list');
  if (!list) return;
  const count = clampNumber(Math.round(getNumberValue(root, '#rc-random-char-count', 2)), 1, 5);
  const existing = [...list.querySelectorAll<HTMLElement>('[data-random-char-card]')];
  while (existing.length > count) {
    const card = existing.pop();
    card?.remove();
  }
  while (list.querySelectorAll('[data-random-char-card]').length < count) {
    const index = list.querySelectorAll('[data-random-char-card]').length;
    const wrapper = parentDoc.createElement('div');
    wrapper.innerHTML = buildRandomSeedCardHtml(index);
    const card = wrapper.firstElementChild as HTMLElement;
    list.appendChild(card);
    wireRandomSeedCard(card);
  }
}

function syncPreviewSystemRows(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('[data-preview-char-card]').forEach(card => syncSystemRows(card));
}

function wireRandomOpening(root: HTMLElement, messageId: number, $mesText: JQuery<HTMLElement>) {
  let previewConfig: OpeningConfig | null = null;
  const preview = root.querySelector<HTMLElement>('#rc-random-preview');
  const generateButton = root.querySelector<HTMLButtonElement>('#rc-random-generate');
  const regenerateAllButton = root.querySelector<HTMLButtonElement>('#rc-random-regenerate-all');

  const activatePreviewTab = () => {
    root.querySelector<HTMLElement>('[data-tab-target="preview"]')?.click();
  };

  const renderPreview = (config: OpeningConfig) => {
    previewConfig = config;
    if (!preview || !generateButton || !regenerateAllButton) return;
    preview.innerHTML = buildPreviewHtml(config);
    wireAutoGrowTextareas(preview);
    generateButton.textContent = '确认写入';
    regenerateAllButton.disabled = false;
    syncPreviewSystemRows(root);
    preview
      .querySelectorAll<HTMLElement>(
        '[data-preview-char-card] input,[data-preview-char-card] textarea,[data-preview-char-card] select',
      )
      .forEach(el => el.addEventListener('change', () => syncPreviewSystemRows(root)));

    preview.querySelector<HTMLElement>('[data-regenerate-world]')?.addEventListener('click', async event => {
      event.preventDefault();
      const button = event.currentTarget as HTMLButtonElement;
      const seed = collectRandomSeed(root);
      try {
        button.disabled = true;
        button.textContent = '世界生成中...';
        setStatus(root, '正在重新生成世界设定，请稍等，按钮已锁定。', 'busy');
        const { config: regenerated, usedFallback } = await generateRandomOpeningConfig({
          ...seed,
          count: Math.max(1, seed.count),
        });
        const current = collectPreviewConfig(root);
        current.world = regenerated.world;
        renderPreview(current);
        setStatus(
          root,
          usedFallback ? 'AI 生成失败，已用本地随机重新生成世界。' : '世界设定已重新生成。',
          usedFallback ? 'warn' : 'success',
        );
      } finally {
        button.disabled = false;
        button.textContent = '重新生成';
      }
    });

    preview.querySelectorAll<HTMLElement>('[data-regenerate-char]').forEach(regenerateButton =>
      regenerateButton.addEventListener('click', async event => {
        event.preventDefault();
        const button = event.currentTarget as HTMLButtonElement;
        const index = Number(button.dataset.regenerateChar ?? 0);
        const seed = collectRandomSeed(root);
        try {
          button.disabled = true;
          button.textContent = `角色 ${index + 1} 生成中...`;
          setStatus(root, `正在重新生成角色 ${index + 1}，请稍等，按钮已锁定。`, 'busy');
          const { config: regenerated, usedFallback } = await generateRandomOpeningConfig({
            ...seed,
            count: 1,
            characters: seed.characters.slice(index, index + 1),
          });
          const current = collectPreviewConfig(root);
          const currentWorldbookKeywords = current.characters[index]?.worldbookKeywords ?? [];
          current.characters[index] = {
            ...regenerated.characters[0],
            worldbookKeywords:
              currentWorldbookKeywords.length > 0
                ? currentWorldbookKeywords
                : (regenerated.characters[0]?.worldbookKeywords ?? []),
          };
          renderPreview(current);
          setStatus(
            root,
            usedFallback ? `AI 生成失败，已用本地随机重新生成角色 ${index + 1}。` : `角色 ${index + 1} 已重新生成。`,
            usedFallback ? 'warn' : 'success',
          );
        } finally {
          button.disabled = false;
          button.textContent = '重新生成';
        }
      }),
    );

    activatePreviewTab();
  };

  wireTabs(root);
  wireAutoGrowTextareas(root);
  root.querySelectorAll<HTMLInputElement>('input[data-random-mode]').forEach(input => {
    input.name = `rc-random-mode-${messageId}`;
  });
  syncRandomWorldCustom(root);
  syncRandomMode(root);
  rebuildRandomSeedCards(root);

  root.querySelector('#rc-random-world-type')?.addEventListener('change', () => syncRandomWorldCustom(root));
  root.querySelector('#rc-random-world-roll')?.addEventListener('click', event => {
    event.preventDefault();
    const select = root.querySelector<HTMLSelectElement>('#rc-random-world-type');
    if (!select) return;
    select.value = pickOne(RANDOM_WORLD_TYPES);
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });
  root.querySelector('#rc-random-char-count')?.addEventListener('input', () => rebuildRandomSeedCards(root));
  root.querySelectorAll('input[data-random-mode]').forEach(el =>
    el.addEventListener('change', () => {
      syncRandomMode(root);
      rebuildRandomSeedCards(root);
    }),
  );

  regenerateAllButton?.addEventListener('click', async event => {
    event.preventDefault();
    if (!generateButton) return;
    previewConfig = null;
    generateButton.textContent = '生成预览';
    generateButton.click();
  });

  generateButton?.addEventListener('click', async event => {
    event.preventDefault();
    const button = event.currentTarget as HTMLButtonElement;
    if (previewConfig) {
      await submitOpeningConfig(messageId, collectPreviewConfig(root), $mesText, root, button, {
        summary: '随机生成模式',
        done: '随机配置',
        idle: '确认写入',
      });
      return;
    }

    const seed = collectRandomSeed(root);
    if (seed.worldType === '自定义' && !seed.customWorldType) {
      toastr.warning('世界类型选择自定义时，需要填写自定义世界类型。', '逆攻略');
      setStatus(root, '请填写自定义世界类型。');
      return;
    }

    try {
      button.disabled = true;
      button.textContent = '生成中...';
      if (regenerateAllButton) regenerateAllButton.disabled = true;
      setStatus(root, '正在请求 AI 生成开场设定，请稍等，按钮已锁定。', 'busy');
      const { config, usedFallback } = await generateRandomOpeningConfig(seed);
      renderPreview(config);
      setStatus(
        root,
        usedFallback ? 'AI 生成失败，已用本地随机生成预览，可继续微调。' : '预览已生成，可以微调后确认写入。',
        usedFallback ? 'warn' : 'success',
      );
      toastr.success('随机预览已生成。', '逆攻略');
    } finally {
      button.disabled = false;
      if (regenerateAllButton) regenerateAllButton.disabled = false;
      button.textContent = '确认写入';
    }
  });
}

function renderOneMessage(messageId: number): void {
  const messages = getChatMessages(messageId);
  const message = messages[0]?.message ?? '';
  const isCustom = message.includes(PLACEHOLDER_CUSTOM);
  const isRandom = message.includes(PLACEHOLDER_RANDOM);
  if (!messages.length || (!isCustom && !isRandom)) return;

  const $mesText = retrieveDisplayedMessage(messageId);
  if (!$mesText?.length || $mesText.find(`.${RENDERED_CLASS}`).length > 0) return;

  const mvuData = getMvuApi()?.getMvuData({ type: 'message', message_id: messageId });
  if (_.size(_.get(mvuData, 'stat_data.角色', {})) > 0) {
    $mesText.append(buildDoneHtml(isRandom ? '随机配置' : '自定义配置'));
    return;
  }

  $mesText.append(isRandom ? buildRandomFormHtml() : buildFormHtml());
  const root = $mesText.find(`.${RENDERED_CLASS}`).last()[0] as HTMLElement;
  if (isRandom) {
    wireRandomOpening(root, messageId, $mesText as JQuery<HTMLElement>);
  } else {
    wireCustomOpening(root, messageId, $mesText as JQuery<HTMLElement>);
  }
}

function renderAllMessages() {
  const jq = (globalThis as { $?: JQueryStatic }).$;
  if (typeof jq === 'function') {
    jq('#chat .mes', parentDoc).each((_index, node) => {
      const mesId = node.getAttribute('mesid');
      if (mesId !== null) renderOneMessage(Number(mesId));
    });
    return;
  }

  parentDoc.querySelectorAll<HTMLElement>('#chat .mes').forEach(node => {
    const mesId = node.getAttribute('mesid');
    if (mesId !== null) renderOneMessage(Number(mesId));
  });
}

function bindRenderEvents() {
  const events = (globalThis as { tavern_events?: typeof tavern_events }).tavern_events;
  const on = (globalThis as { eventOn?: typeof eventOn }).eventOn;
  if (!events || typeof on !== 'function') {
    console.warn('[逆攻略] 酒馆事件接口尚未就绪，仅执行当前楼层扫描。');
    return;
  }

  on(events.CHARACTER_MESSAGE_RENDERED, withErrorLog(renderOneMessage));
  on(events.MESSAGE_UPDATED, withErrorLog(renderOneMessage));
  on(events.MESSAGE_SWIPED, withErrorLog(renderOneMessage));
  on(events.MESSAGE_DELETED, withErrorLog(renderAllMessages));
  on(events.MORE_MESSAGES_LOADED, withErrorLog(renderAllMessages));
  on(
    events.CHAT_CHANGED,
    withErrorLog(() => {
      renderAllMessages();
    }),
  );
}

console.info('[逆攻略] 开场渲染脚本开始执行');

onReady(() => {
  withErrorLog(() => {
    renderAllMessages();
    bindRenderEvents();
    console.info('[逆攻略] 开场渲染脚本已加载，已扫描当前聊天楼层');

    if (typeof waitGlobalInitialized === 'function') {
      waitGlobalInitialized('Mvu')
        .then(() => {
          console.info('[逆攻略] MVU 已就绪，重新扫描开场楼层');
          renderAllMessages();
        })
        .catch((err: unknown) => console.warn('[逆攻略] 等待 MVU 初始化失败:', err));
    }
  })();
});
