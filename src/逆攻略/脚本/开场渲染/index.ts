// 逆攻略 — 开场白 A：自定义模式
// 扫描开场白中的标记，渲染配置表单；提交后写入聊天世界书和 MVU 变量。

import { randomCharacterName } from './name_pool';

const PLACEHOLDER_CUSTOM = '【【逆攻略自定义模式】】';
const RENDERED_CLASS = 'rc-opening-rendered';

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

const RELATION_SUGGESTIONS = [
  '陌生人',
  '邻居',
  '同班同学',
  '同事',
  '室友',
  '常去的店的店员/老板',
  '网友（未见面）',
  '青梅竹马',
  '朋友的朋友',
  'user 的下属',
  'user 的学生',
  'user 家的佣人/管家',
  '竞争对手',
  '被 user 救过一命',
  '欠了 user 的债',
  '单方面暗恋 user（已久）',
  '被系统传送到 user 面前',
  '和 user 签了某种契约',
];

const ABILITY_SUGGESTIONS = [
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

const COMMON_TASKS = {
  今日心情管家: { 描述: '让user今天至少开心一次', 奖励: '系统积分+5', 难度: '简单', 状态: '可接取' },
  解决问题: { 描述: '为user切实解决一个麻烦', 奖励: '系统积分+15', 难度: '普通', 状态: '可接取' },
  主动接触: { 描述: '让user今天主动跟你说一句话', 奖励: '系统积分+10', 难度: '普通', 状态: '可接取' },
  难忘瞬间: { 描述: '制造一个user会记得的时刻', 奖励: '系统积分+30', 难度: '困难', 状态: '可接取' },
  专属记忆: { 描述: '做一件只有你才能为user做到的事', 奖励: '系统积分+60', 难度: '史诗', 状态: '可接取' },
} as const;

const SYSTEM_TASKS: Record<string, Record<string, { 描述: string; 奖励: string; 难度: string; 状态: string }>> = {
  '面板/加点': {
    日常社交: { 描述: '每天与user进行一次实质性互动（社交熟练度+1）', 难度: '简单', 奖励: '系统积分+5、属性点+1', 状态: '可接取' },
    魅力突破: { 描述: '做出一个让user正面印象深刻的举动（魅力属性突破阈值）', 难度: '普通', 奖励: '系统积分+15、魅力+3', 状态: '可接取' },
    属性展示: { 描述: '在user面前展示自己某项特长/能力', 难度: '普通', 奖励: '系统积分+10、对应属性+2', 状态: '可接取' },
    守护认证: { 描述: '在user面临困难时挺身而出', 难度: '困难', 奖励: '系统积分+30、全属性+1', 状态: '可接取' },
  },
  '签到/打卡': {
    日常签到: { 描述: '每天出现在user视野里', 难度: '简单', 奖励: '系统积分+5、签到天数+1', 状态: '可接取' },
    场景签到: { 描述: '在user最常出现的地方完成一次签到', 难度: '普通', 奖励: '系统积分+10、随机道具', 状态: '可接取' },
    深夜守候: { 描述: '在user最需要陪伴的时候出现', 难度: '困难', 奖励: '系统积分+30、特殊签到奖励', 状态: '可接取' },
    七日签到: { 描述: '累积七天第一个出现在user面前', 难度: '困难', 奖励: '系统积分+60、签到宝箱', 状态: '可接取' },
  },
  '神豪/败家': {
    日常消费: { 描述: '在限定时间内为user花出一笔钱（金额不限）', 难度: '简单', 奖励: '系统积分+5、返现30%', 状态: '可接取' },
    贵重礼物: { 描述: '给user送出一份有实质价值的礼物', 难度: '普通', 奖励: '系统积分+15、额度提升', 状态: '可接取' },
    梦想投资: { 描述: '为user感兴趣的事物提供资金支持', 难度: '困难', 奖励: '系统积分+30、投资分红', 状态: '可接取' },
    一掷千金: { 描述: '为user完成一个通常需要大笔资金的愿望', 难度: '史诗', 奖励: '系统积分+60、金卡升级', 状态: '可接取' },
  },
  '情绪/声望': {
    引发笑声: { 描述: '让user真心笑一次（喜悦值收集）', 难度: '简单', 奖励: '系统积分+5、喜悦值×5', 状态: '可接取' },
    制造惊喜: { 描述: '做出让user惊喜的举动（惊喜值收集）', 难度: '普通', 奖励: '系统积分+15、惊喜值×10', 状态: '可接取' },
    赢得赞赏: { 描述: '做出让user真心称赞你的事（赞赏值收集）', 难度: '困难', 奖励: '系统积分+30、赞赏值×20', 状态: '可接取' },
    情绪盛宴: { 描述: '在一段时间内让user的某种正面情绪达到极值', 难度: '史诗', 奖励: '系统积分+60、情绪值大量收集', 状态: '可接取' },
  },
  神级选择: {
    初次互动: { 描述: '与user进行（绑定系统后的）第一次互动', 难度: '简单', 奖励: '系统积分+5、下次选择题额外增加1个自定义选项', 状态: '可接取' },
    得到认可: { 描述: '让user对你做出的某个决定表示认可', 难度: '普通', 奖励: '系统积分+15、下次选择题额外增加一个必定获利的选项', 状态: '可接取' },
    选择困难: { 描述: '让user主动为某个困难的选择寻求你的建议', 难度: '困难', 奖励: '系统积分+30、下次选择题可直接锁定最优解', 状态: '可接取' },
    深层共鸣: { 描述: '与user建立一次深层的情感联结，触发系统特殊响应', 难度: '史诗', 奖励: '系统积分+60、下次选择题所有选项均可得益', 状态: '可接取' },
  },
  '反派/夺运': {
    截胡试炼: { 描述: '从竞争者手中夺取一项资源或机缘，献给user', 难度: '普通', 奖励: '系统积分+15、气运值+10', 状态: '可接取' },
    打压威胁: { 描述: '让user周围的潜在威胁遭受挫折', 难度: '困难', 奖励: '系统积分+30、气运值+20', 状态: '可接取' },
    气运转化: { 描述: '将掠夺来的气运值转化为user的切实利益', 难度: '困难', 奖励: '系统积分+30、利益点数奖励', 状态: '可接取' },
    天命逆转: { 描述: '颠覆一个原本属于他人的重大机缘，让user成为受益者', 难度: '史诗', 奖励: '系统积分+60、大量气运值', 状态: '可接取' },
  },
  人生模拟器: {
    初次接触: { 描述: '与user进行一次有实质内容的互动', 难度: '简单', 奖励: '系统积分+5、获得一次额外模拟机会', 状态: '可接取' },
    主动倾诉: { 描述: '主动开启话题，被user分享一次经历', 难度: '普通', 奖励: '系统积分+15、下次模拟可额外保留一项奖励', 状态: '可接取' },
    共同经历: { 描述: '与user共同经历一次难忘的事件', 难度: '困难', 奖励: '系统积分+30、获得一次可留存的额外奖励机会', 状态: '可接取' },
    深层共鸣: { 描述: '与user建立深度的情感联结，触发系统特殊响应', 难度: '史诗', 奖励: '系统积分+60、可留存额外奖励机会×3', 状态: '可接取' },
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
    .map(value => `<option value="${escapeHtml(value)}"${selected === value ? ' selected' : ''}>${escapeHtml(value)}</option>`)
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

function formText(label: string, id: string, attrs = ''): string {
  return `<label class="rc-field rc-field-wide"><span>${label}</span><textarea id="${id}" rows="3" ${attrs}></textarea></label>`;
}

const STYLE = `<style>
  /* ===== 逆攻略 · 纸艺层叠 ===== */
  .${RENDERED_CLASS} {
    --rc-paper: #fffaf5;
    --rc-paper-2: #fff2e7;
    --rc-paper-3: #ffe8db;
    --rc-field-bg: #fffdfb;
    --rc-ink: #4a3a33;
    --rc-muted: #9b8276;
    --rc-line: #ecd6c6;
    --rc-line-soft: #f6e7db;
    --rc-accent: #e08a96;
    --rc-accent-d: #d2707f;
    --rc-accent-soft: #f8d3d8;
    --rc-cool: #a7c3cd;
    --rc-cool-soft: #dcebef;
    --rc-shadow: 150, 100, 80;
    color: var(--rc-ink);
    font-family: "Microsoft YaHei", "Noto Sans SC", sans-serif;
    max-width: min(940px, 100%);
    margin: 14px auto;
    -webkit-font-smoothing: antialiased;
  }
  .${RENDERED_CLASS} *,
  .${RENDERED_CLASS} *::before,
  .${RENDERED_CLASS} *::after {
    box-sizing: border-box;
  }

  /* ---- 外壳：层叠纸张 ---- */
  .rc-shell {
    position: relative;
    isolation: isolate;
    border: 1px solid var(--rc-line);
    border-radius: 16px;
    background:
      radial-gradient(120% 80% at 50% -12%, #fff, transparent 58%),
      linear-gradient(180deg, var(--rc-paper), var(--rc-paper-2));
    box-shadow:
      4px 5px 0 -1px var(--rc-paper-2),
      4px 5px 0 0 var(--rc-line-soft),
      9px 11px 0 -2px var(--rc-paper-3),
      9px 11px 0 -1px var(--rc-line-soft),
      0 18px 34px rgba(var(--rc-shadow), 0.16);
    overflow: hidden;
  }
  /* 纸张噪点纹理 */
  .rc-shell::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 160px 160px;
    opacity: 0.05;
    mix-blend-mode: multiply;
    pointer-events: none;
  }

  /* ---- 顶部标题 ---- */
  .rc-head {
    padding: 18px 22px 16px;
    border-bottom: 1.5px dashed var(--rc-line);
    display: flex;
    justify-content: space-between;
    gap: 14px;
    align-items: center;
  }
  .rc-title {
    font-size: 20px;
    font-weight: 800;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .rc-title::before {
    content: '✦';
    color: var(--rc-accent);
    font-size: 17px;
  }
  .rc-subtitle {
    margin-top: 5px;
    color: var(--rc-muted);
    font-size: 13px;
    line-height: 1.55;
  }
  .rc-stamp {
    flex: none;
    width: 46px;
    height: 46px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    font-size: 22px;
    background: radial-gradient(circle at 35% 30%, #fff, var(--rc-accent-soft));
    border: 1.5px dashed var(--rc-accent);
    box-shadow: 0 4px 10px rgba(var(--rc-shadow), 0.14);
    transform: rotate(-6deg);
  }

  /* ---- 标签页：纸质书签 ---- */
  .rc-tabs {
    display: flex;
    gap: 7px;
    padding: 12px 16px 0;
    border-bottom: 1px solid var(--rc-line);
  }
  .rc-tab {
    appearance: none;
    border: 1px solid transparent;
    border-bottom: 0;
    background: transparent;
    color: var(--rc-muted);
    border-radius: 11px 11px 0 0;
    padding: 9px 14px;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transform: translateY(2px);
    transition: transform 180ms ease, background 180ms ease, color 180ms ease;
  }
  .rc-tab:hover {
    color: var(--rc-ink);
    transform: translateY(0);
  }
  .rc-tab[data-active="true"] {
    background: linear-gradient(180deg, #fff, var(--rc-paper));
    border-color: var(--rc-line);
    color: var(--rc-accent-d);
    margin-bottom: -1px;
    transform: translateY(0);
    box-shadow: 0 -3px 9px rgba(var(--rc-shadow), 0.07);
  }

  /* ---- 面板 ---- */
  .rc-sections {
    padding: 16px;
    display: grid;
    gap: 14px;
  }
  .rc-tab-panel {
    display: none;
  }
  .rc-tab-panel[data-active="true"] {
    display: grid;
    gap: 14px;
    animation: rc-fade 220ms ease;
  }
  @keyframes rc-fade {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ---- 纸片卡 ---- */
  .rc-section {
    position: relative;
    background: linear-gradient(180deg, #fffefc, var(--rc-paper));
    border: 1px solid var(--rc-line);
    border-radius: 13px;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.9),
      0 3px 6px rgba(var(--rc-shadow), 0.06),
      0 10px 22px rgba(var(--rc-shadow), 0.10);
    transition: box-shadow 180ms ease;
  }
  .rc-section:hover {
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.9),
      0 4px 8px rgba(var(--rc-shadow), 0.08),
      0 14px 28px rgba(var(--rc-shadow), 0.13);
  }
  .rc-char-card {
    position: relative;
    background: linear-gradient(180deg, #fffefc, var(--rc-paper));
    border: 1px solid var(--rc-line);
    border-radius: 13px;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.9),
      3px 4px 0 -1px var(--rc-paper-2),
      3px 4px 0 0 var(--rc-line-soft),
      0 8px 18px rgba(var(--rc-shadow), 0.12);
    transition: transform 180ms ease, box-shadow 180ms ease;
  }
  .rc-char-card:hover {
    transform: translateY(-3px);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.9),
      3px 4px 0 -1px var(--rc-paper-2),
      3px 4px 0 0 var(--rc-line-soft),
      0 16px 30px rgba(var(--rc-shadow), 0.18);
  }
  .rc-char-card:active {
    transform: translateY(-1px);
  }
  /* 压边 / 针脚 */
  .rc-char-card::after {
    content: '';
    position: absolute;
    inset: 5px;
    border: 1px dashed var(--rc-line);
    border-radius: 9px;
    opacity: 0.45;
    pointer-events: none;
  }

  .rc-section summary,
  .rc-char-summary {
    cursor: pointer;
    padding: 13px 16px;
    font-weight: 800;
    font-size: 15px;
    list-style: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    user-select: none;
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
    width: 28px;
    height: 28px;
    display: grid;
    place-items: center;
    border-radius: 9px;
    font-size: 15px;
    background: var(--rc-accent-soft);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
  }
  .rc-chev {
    color: var(--rc-muted);
    font-size: 13px;
    transition: transform 180ms ease;
  }
  details[open] > summary .rc-chev {
    transform: rotate(180deg);
  }

  /* ---- 表单字段 ---- */
  .rc-grid {
    padding: 4px 16px 16px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 13px;
  }
  .rc-field {
    display: grid;
    gap: 6px;
    min-width: 0;
  }
  .rc-field-wide {
    grid-column: 1 / -1;
  }
  .rc-field > span {
    color: var(--rc-muted);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.3px;
    padding-left: 2px;
  }
  .rc-field input,
  .rc-field select,
  .rc-field textarea {
    width: 100%;
    border: 1px solid var(--rc-line);
    border-radius: 9px;
    padding: 9px 11px;
    background: var(--rc-field-bg);
    color: var(--rc-ink);
    font: inherit;
    min-height: 39px;
    box-shadow: inset 0 1px 2px rgba(var(--rc-shadow), 0.05);
    transition: border-color 160ms ease, box-shadow 160ms ease;
  }
  .rc-field input:focus,
  .rc-field select:focus,
  .rc-field textarea:focus {
    outline: none;
    border-color: var(--rc-accent);
    box-shadow: 0 0 0 3px var(--rc-accent-soft);
  }
  .rc-field input:disabled {
    background: var(--rc-line-soft);
    color: var(--rc-muted);
    cursor: not-allowed;
  }
  .rc-field textarea {
    resize: vertical;
    line-height: 1.55;
  }
  .rc-input-action {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px;
    align-items: stretch;
  }
  .rc-random-btn {
    width: 40px;
    min-height: 39px;
    padding: 0;
    border-radius: 10px;
    font-size: 16px;
    background: radial-gradient(circle at 35% 30%, #fff, var(--rc-accent-soft));
    border: 1px solid var(--rc-accent-soft);
    display: inline-grid;
    place-items: center;
    cursor: pointer;
    transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
  }
  .rc-random-btn:hover {
    transform: translateY(-2px) rotate(8deg);
    border-color: var(--rc-accent);
    box-shadow: 0 6px 12px rgba(var(--rc-shadow), 0.16);
  }
  .rc-random-btn:active {
    transform: translateY(0) rotate(0);
  }

  /* ---- 按钮 ---- */
  .rc-btn {
    border: 1px solid var(--rc-line);
    background: linear-gradient(180deg, #fff, var(--rc-paper));
    color: var(--rc-ink);
    border-radius: 10px;
    padding: 9px 14px;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(var(--rc-shadow), 0.08);
    transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
  }
  .rc-btn:hover {
    transform: translateY(-2px);
    border-color: var(--rc-accent);
    box-shadow: 0 8px 16px rgba(var(--rc-shadow), 0.14);
  }
  .rc-btn:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(var(--rc-shadow), 0.10);
  }
  .rc-btn-primary {
    background: linear-gradient(180deg, var(--rc-accent), var(--rc-accent-d));
    border-color: var(--rc-accent-d);
    color: #fff;
    box-shadow: 0 6px 14px rgba(210, 112, 127, 0.35);
  }
  .rc-btn-primary:hover {
    border-color: var(--rc-accent-d);
    box-shadow: 0 10px 22px rgba(210, 112, 127, 0.45);
  }
  .rc-btn-primary:disabled {
    opacity: 0.7;
    cursor: progress;
    transform: none;
    box-shadow: 0 4px 10px rgba(210, 112, 127, 0.28);
  }
  .rc-btn-quiet {
    background: transparent;
    border-color: transparent;
    box-shadow: none;
    color: var(--rc-muted);
    padding: 6px 10px;
  }
  .rc-btn-quiet:hover {
    color: var(--rc-accent-d);
    border-color: var(--rc-accent-soft);
    background: rgba(255, 255, 255, 0.6);
    transform: none;
    box-shadow: none;
  }

  /* ---- 角色列表 + 添加 ---- */
  .rc-char-list {
    display: grid;
    gap: 12px;
  }
  .rc-char-summary {
    padding: 13px 14px;
  }
  .rc-char-tools {
    display: inline-flex;
    gap: 8px;
    align-items: center;
  }
  .rc-char-add {
    width: 100%;
    border: 1.5px dashed var(--rc-line);
    background: rgba(255, 255, 255, 0.5);
    color: var(--rc-muted);
    border-radius: 13px;
    padding: 13px;
    font: inherit;
    font-weight: 800;
    cursor: pointer;
    transition: transform 180ms ease, background 180ms ease, border-color 180ms ease, color 180ms ease;
  }
  .rc-char-add:hover {
    transform: translateY(-2px);
    border-color: var(--rc-accent);
    color: var(--rc-accent-d);
    background: var(--rc-accent-soft);
  }
  .rc-char-add:active {
    transform: translateY(0);
  }

  /* ---- 显隐控制（脚本依赖） ---- */
  .rc-system-row[data-hidden="true"],
  .rc-conditional[data-hidden="true"] {
    display: none;
  }

  /* ---- 底部操作栏 ---- */
  .rc-actions {
    position: sticky;
    bottom: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 13px 16px;
    background: linear-gradient(180deg, rgba(255, 249, 242, 0.86), rgba(255, 242, 231, 0.96));
    border-top: 1.5px dashed var(--rc-line);
    backdrop-filter: blur(8px);
  }
  .rc-muted {
    color: var(--rc-muted);
    font-size: 12px;
    font-weight: 600;
    line-height: 1.4;
  }

  /* ---- 完成态 ---- */
  .rc-done {
    position: relative;
    padding: 20px 22px;
    border: 1px solid var(--rc-line);
    border-radius: 14px;
    background: linear-gradient(180deg, #fffefc, var(--rc-paper-2));
    color: var(--rc-ink);
    font-weight: 600;
    line-height: 1.6;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.9),
      3px 4px 0 -1px var(--rc-paper-2),
      3px 4px 0 0 var(--rc-line-soft),
      0 10px 22px rgba(var(--rc-shadow), 0.12);
  }
  .rc-done::before {
    content: '🎉 ';
  }

  @media (max-width: 620px) {
    .${RENDERED_CLASS} { margin: 8px auto; }
    .rc-head {
      flex-direction: column;
      align-items: flex-start;
    }
    .rc-tabs { overflow-x: auto; }
    .rc-grid { grid-template-columns: 1fr; }
    .rc-actions {
      flex-direction: column;
      align-items: stretch;
    }
    .rc-actions .rc-btn { width: 100%; }
    .rc-shell {
      box-shadow:
        3px 4px 0 -1px var(--rc-paper-2),
        3px 4px 0 0 var(--rc-line-soft),
        0 12px 24px rgba(var(--rc-shadow), 0.16);
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
      <label class="rc-field"><span>性别 *</span><select data-field="gender">${optionsHtml(['女', '男', '其他'], '女')}</select></label>
      <label class="rc-field"><span>年龄</span><input data-field="age"></label>
      <label class="rc-field rc-field-wide"><span>外貌</span><textarea data-field="appearance" rows="2"></textarea></label>
      <label class="rc-field rc-field-wide"><span>性格</span><textarea data-field="personality" rows="2"></textarea></label>
      <label class="rc-field rc-field-wide"><span>过去经历</span><textarea data-field="past" rows="2"></textarea></label>
      ${inlineRandomInput('与 user 的初始关系', 'relation', 'list="rc-relation-list" placeholder="留空默认陌生人"')}
      <label class="rc-field"><span>攻略动机 *</span><select data-field="motivation">${optionsHtml(['系统绑定', '自然兴趣'], '系统绑定')}</select></label>
      <label class="rc-field rc-system-row"><span>绑定系统类别 *</span><select data-field="systemType">${optionsHtml(SYSTEM_TYPES, '面板/加点')}</select></label>
      <label class="rc-field rc-system-row rc-custom-system-row"><span>自定义系统名</span><input data-field="customSystemType" placeholder="系统类别选择自定义时填写"></label>
      ${inlineRandomInput('特长/能力', 'ability', 'list="rc-ability-list"')}
      <label class="rc-field rc-field-wide"><span>补充说明</span><textarea data-field="notes" rows="2"></textarea></label>
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

function setStatus(root: ParentNode, message: string) {
  const el = root.querySelector<HTMLElement>('#rc-status');
  if (el) el.textContent = message;
}

function setFieldValue(card: HTMLElement, field: string, value: string) {
  const input = card.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`[data-field="${field}"]`);
  if (!input) return;
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
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
  card.querySelector('[data-field="motivation"]')?.addEventListener('change', () => syncSystemRows(card));
  card.querySelector('[data-field="systemType"]')?.addEventListener('change', () => syncSystemRows(card));
  card.querySelectorAll('input,textarea,select').forEach(el => el.addEventListener('input', refresh));
  card.querySelectorAll<HTMLElement>('[data-random-field]').forEach(button => button.addEventListener('click', event => {
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
  }));
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
      gender: getInputValue(card, '[data-field="gender"]'),
      age: getInputValue(card, '[data-field="age"]'),
      appearance: getInputValue(card, '[data-field="appearance"]'),
      personality: getInputValue(card, '[data-field="personality"]'),
      past: getInputValue(card, '[data-field="past"]'),
      relation: getInputValue(card, '[data-field="relation"]') || '陌生人',
      motivation,
      systemType: motivation === '系统绑定' ? (systemTypeSelect === '自定义' ? customSystemType : systemTypeSelect) : '',
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
    user: {
      name: getInputValue(root, '#rc-user-name'),
      age: getInputValue(root, '#rc-user-age'),
      identity: getInputValue(root, '#rc-user-identity'),
      appearance: getInputValue(root, '#rc-user-appearance'),
      personality: getInputValue(root, '#rc-user-personality'),
      notes: getInputValue(root, '#rc-user-notes'),
    },
    characters,
  };
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
user设定:
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
${blockField('与user的初始关系', character.relation)}
${blockField('攻略动机', character.motivation)}
${blockField('绑定系统类别', character.systemType)}
${blockField('特长', character.ability)}
${blockField('补充说明', character.notes)}
</rc_character>
<%_ const rcCharName = ${charNameLiteral}; const rcCharData = (getvar('stat_data.角色', { defaults: {} }) ?? {})[rcCharName]; _%>
<%_ if (rcCharData) { _%>
<角色状态>
<%- JSON.stringify(rcCharData) %>
</角色状态>
<%_ } _%>`;
}

function entryBase(name: string, content: string, order: number, type: 'constant' | 'selective', keys: string[] = []) {
  return {
    name,
    enabled: true,
    strategy: {
      type,
      keys,
      keys_secondary: { logic: 'and_any' as const, keys: [] },
      scan_depth: type === 'selective' ? 4 : 'same_as_global',
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
    entryBase('[rc]世界设定', buildWorldEntry(config), 1, 'constant'),
    entryBase('[rc]user设定', buildUserEntry(config), 2, 'constant'),
    ...config.characters.map((character, index) =>
      entryBase(`[rc]角色:${character.name}`, buildCharacterEntry(character), 3 + index, 'selective', [
        character.name,
        ...(character.source ? [character.source] : []),
      ]),
    ),
  ];

  const existing = await getWorldbook(worldbookName);
  const desiredNames = new Set(desired.map(entry => entry.name));
  const toCreate = desired.filter(entry => !existing.some(item => item.name === entry.name));

  await updateWorldbookWith(worldbookName, entries => entries.map(entry => {
    const replacement = desired.find(item => item.name === entry.name);
    if (replacement) {
      return { ...entry, ...replacement };
    }
    if (entry.name.startsWith('[rc]角色:') && !desiredNames.has(entry.name)) {
      return { ...entry, enabled: false };
    }
    return entry;
  }), { render: 'debounced' });

  if (toCreate.length > 0) {
    await createWorldbookEntries(worldbookName, toCreate, { render: 'debounced' });
  }
}

function buildTasks(config: OpeningConfig) {
  const tasks: Record<string, any> = _.cloneDeep(COMMON_TASKS);
  const selectedSystems = [...new Set(config.characters
    .filter(character => character.motivation === '系统绑定')
    .map(character => character.systemType)
    .filter(systemType => SYSTEM_TASKS[systemType]))];

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
    角色: Object.fromEntries(config.characters.map(character => [
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
    ])),
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

function buildSummaryText(config: OpeningConfig): string {
  const characters = config.characters.map(character => {
    const systemLine = character.motivation === '系统绑定' ? `绑定系统：${character.systemType}` : '绑定系统：无（自然兴趣型）';
    return `- ${character.name}（${character.gender}）：${character.source || '原创'}；初始关系：${character.relation || '陌生人'}；攻略动机：${character.motivation}；${systemLine}`;
  }).join('\n');

  return `[逆攻略自定义模式配置完成]

请根据当前聊天世界书中的 <rc_world_setting>、<rc_user_setting>、<rc_character> 条目生成正式开场。

本轮概要:
- 世界类型：${config.world.worldType}
- 角色数量：${config.characters.length}
${characters}

开场要求:
- 角色必须主动攻略 user，user 始终处于上位。
- 不要让 user 为任何角色解决麻烦或承受负面影响。
- 如果角色是系统绑定型，请让系统任务自然成为 ta 接近 user 的推动力。
- 如果角色是自然兴趣型，请让 ta 的主动接近来自自身兴趣与情感。
- 第一幕需要让至少一名角色开始接近 user，并留下后续互动入口。`;
}

function buildDoneHtml(): string {
  return `<div class="${RENDERED_CLASS}"><div class="rc-done">自定义配置已写入。可以等待 AI 生成开场；如需修改，重开本条开场或刷新后重新提交。</div></div>`;
}

function renderOneMessage(messageId: number): void {
  const messages = getChatMessages(messageId);
  if (!messages.length || !messages[0].message.includes(PLACEHOLDER_CUSTOM)) return;

  const $mesText = retrieveDisplayedMessage(messageId);
  if (!$mesText?.length || $mesText.find(`.${RENDERED_CLASS}`).length > 0) return;

  const mvuData = getMvuApi()?.getMvuData({ type: 'message', message_id: messageId });
  if (_.size(_.get(mvuData, 'stat_data.角色', {})) > 0) {
    $mesText.append(buildDoneHtml());
    return;
  }

  $mesText.append(buildFormHtml());
  const root = $mesText.find(`.${RENDERED_CLASS}`).last()[0] as HTMLElement;
  const charList = root.querySelector<HTMLElement>('#rc-char-list');
  if (!charList) return;

  wireTabs(root);
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
      await createChatMessages([{ role: 'user', message: buildSummaryText(config) }]);
      $mesText.find(`.${RENDERED_CLASS}`).remove();
      $mesText.append(buildDoneHtml());
      toastr.success('自定义配置已写入，正在生成开场。', '逆攻略');
    } catch (err: any) {
      console.error('[逆攻略] 自定义模式提交失败:', err);
      toastr.error(`提交失败：${err?.message ?? err}`, '逆攻略');
      submitButton.disabled = false;
      submitButton.textContent = '开始冒险';
      setStatus(root, '提交失败，请查看控制台。');
    }
  });
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
  on(events.CHAT_CHANGED, withErrorLog(renderAllMessages));
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
