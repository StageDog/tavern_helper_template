// ═══════════════════════════════════════════════════════════════
// Run Baby Run — 舞台配置渲染脚本 (TypeScript + webpack)
// 扫描开场白中的 【【舞台设置】】 标记，渲染为交互式配置界面
// ═══════════════════════════════════════════════════════════════

import { STYLE } from './styles';
import {
  pick,
  RANDOM_AREAS,
  RANDOM_ESCAPES,
  pickScenePrompt,
  type ScenePrompt,
  randomName,
  randomAppearance,
  randomMaleDress,
  randomFemaleDress,
  PERSONALITIES,
  PERSONALITY_TAGS,
  WEAKNESSES,
  ABILITIES,
} from './random_pools';

// ── 常量 ──────────────────────────────────────────────────────
const RENDERED_CLASS = 'rbr-stage-rendered';
const PLACEHOLDER = '【【舞台设置】】';
type SceneMode = 'disguised' | 'remote' | 'hunter';

interface OpeningSceneConfig {
  mode: SceneMode;
  scene: string | null;
  disguise: string | null;
}

const SCENE_MODE_LABEL: Record<SceneMode, string> = {
  disguised: '伪装混入池',
  remote: '幕后远程池',
  hunter: '公开追击池',
};

function normalizeNullableInput(value: string): string | null {
  const normalized = value.trim();
  if (!normalized) return null;
  return normalized.toLowerCase() === 'null' ? null : normalized;
}

// ── 舞台预设 ──────────────────────────────────────────────────
interface AreaDef {
  name: string;
  desc: string;
  passable: boolean;
  danger: number;
  explored: boolean;
}
interface EscapeDef {
  name: string;
  desc: string;
}
interface Preset {
  name: string;
  weather: string;
  time: string;
  areas: AreaDef[];
  escapes: EscapeDef[];
}

const PRESETS: Record<string, Preset> = {
  abandoned_mansion: {
    name: '废弃洋馆',
    weather: '暴雨，雷电不断，外面伸手不见五指',
    time: '深夜 11:30',
    areas: [
      { name: '玄关大厅', desc: '洋馆入口，巨大的枝形吊灯摇摇欲坠，地板上覆着厚厚的灰尘', passable: true, danger: 0, explored: true },
      { name: '西侧走廊', desc: '昏暗的长廊，墙壁上挂满发黄的油画，画中人的眼睛似乎在跟随你', passable: true, danger: 1, explored: false },
      { name: '东侧厨房', desc: '弥漫着腐臭气味的厨房，水龙头不断滴水', passable: true, danger: 0, explored: false },
      { name: '二楼主卧', desc: '上锁的房间，门缝下渗出暗红色的液体', passable: false, danger: 3, explored: false },
      { name: '地下室', desc: '通往地下的楼梯被重物堵住，隐约传来低沉的呻吟', passable: false, danger: 5, explored: false },
    ],
    escapes: [
      { name: '找到大门钥匙', desc: '洋馆正门被锁死，需要找到钥匙' },
      { name: '修复通讯设备', desc: '地下室似乎有老式无线电，或许能呼叫救援' },
      { name: '打开密道', desc: '据说洋馆有一条通往外部的密道' },
    ],
  },
  remote_forest: {
    name: '偏远森林',
    weather: '浓雾弥漫，能见度不足三米，偶尔传来不明动物的嚎叫',
    time: '深夜 1:00',
    areas: [
      { name: '营地废墟', desc: '被撕裂的帐篷散落一地，篝火早已熄灭，只剩焦黑的木炭', passable: true, danger: 0, explored: true },
      { name: '林间小径', desc: '被浓雾吞没的泥泞小路，两侧树木枝杈交错如爪', passable: true, danger: 1, explored: false },
      { name: '干涸河床', desc: '满是碎石的河床，散落着不知谁留下的衣物碎片', passable: true, danger: 2, explored: false },
      { name: '猎人小屋', desc: '半掩在灌木丛中的木屋，门上挂着生锈的铁链', passable: false, danger: 3, explored: false },
      { name: '悬崖边缘', desc: '陡峭的断崖，下方是看不见底的黑暗深渊', passable: false, danger: 5, explored: false },
    ],
    escapes: [
      { name: '找到下山路', desc: '森林的某处应该有通往山下公路的路径' },
      { name: '发射求救信号', desc: '猎人小屋里或许有信号枪' },
      { name: '修好车辆', desc: '来时的车坏在了林间停车场' },
    ],
  },
  abandoned_school: {
    name: '废弃学校',
    weather: '阴天无月，校舍内完全漆黑，只有手电筒的光束能照亮前方',
    time: '深夜 10:00',
    areas: [
      { name: '校门口', desc: '锈迹斑斑的铁门半开，门柱上缠着枯死的藤蔓', passable: true, danger: 0, explored: true },
      { name: '一楼走廊', desc: '地上散落着发霉的教科书，墙壁上的涂鸦像是用血写成的', passable: true, danger: 1, explored: false },
      { name: '音乐教室', desc: '钢琴盖敞开着，琴键上落满灰尘，偶尔自己发出一个音', passable: true, danger: 2, explored: false },
      { name: '校长室', desc: '门被从里面反锁，透过门上的玻璃窗能看到翻倒的桌椅', passable: false, danger: 3, explored: false },
      { name: '游泳池', desc: '干涸的泳池底部积着黑色的淤泥，散发着令人作呕的气味', passable: true, danger: 4, explored: false },
    ],
    escapes: [
      { name: '找到后门钥匙', desc: '学校后门被锁，钥匙可能在校长室或教职工室' },
      { name: '打通围墙缺口', desc: '东侧围墙有裂缝，或许能扩大到人可以通过的程度' },
      { name: '联络外界', desc: '校长室可能还有座机电话线' },
    ],
  },
  custom: {
    name: '自定义舞台',
    weather: '',
    time: '深夜 11:00',
    areas: [],
    escapes: [],
  },
};

// ── 辅助：父页面 document ─────────────────────────────────────
const parentDoc = window.parent.document;
function $pid(id: string): HTMLElement | null {
  return parentDoc.getElementById(id);
}

// ── textarea 自动撑高（仅增不减，保留用户手动 resize 的尺寸） ──
function attachAutoGrow(textarea: HTMLTextAreaElement): void {
  if ((textarea as any).__rbrAutoGrowAttached) return;
  (textarea as any).__rbrAutoGrowAttached = true;

  const adjust = () => {
    // 仅当内容溢出当前可视高度时撑高，避免反复缩回与拖拽冲突
    if (textarea.scrollHeight > textarea.clientHeight + 1) {
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };
  textarea.addEventListener('input', adjust);
  // 程序化 setValue 后会 dispatch 'input'，这里再监听一次冗余兜底
  textarea.addEventListener('change', adjust);
  // 初次渲染时若已有内容则撑高
  setTimeout(adjust, 0);
}

/** 对容器内（含自身）所有 textarea 应用 auto-grow */
function applyAutoGrowToAll(root: ParentNode): void {
  root.querySelectorAll<HTMLTextAreaElement>('textarea').forEach(attachAutoGrow);
}

/** 设置 input/textarea 的值，并触发 input 事件以驱动 auto-grow 等监听 */
function setFieldValue(
  el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null,
  value: string,
): void {
  if (!el) return;
  el.value = value;
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

// ── HTML 构建：整个界面 ───────────────────────────────────────
function buildStageConfigHtml(): string {
  const presetOptions = Object.entries(PRESETS)
    .map(([key, preset]) => `<option value="${key}">${preset.name}</option>`)
    .join('');

  return `<div class="${RENDERED_CLASS} rbr-stage-wrapper">
  ${STYLE}
  <div class="rbr-card" id="rbr-stage-config">
    <div class="rbr-title">🔪 舞 台 配 置 🔪</div>

    <div class="rbr-tabs">
      <div class="rbr-tab active" data-tab="stage">⛧ 舞台配置</div>
      <div class="rbr-tab" data-tab="chars">👤 角色生成</div>
    </div>

    <!-- 舞台配置标签页 -->
    <div class="rbr-tab-content active" id="rbr-tab-stage">
      <div class="rbr-section">
        <div class="rbr-section-title">◈ 舞台预设</div>
        <div class="rbr-row">
          <span class="rbr-label">选择舞台</span>
          <select class="rbr-select" id="rbr-preset">${presetOptions}</select>
        </div>
      </div>

      <div class="rbr-section">
        <div class="rbr-section-title">◈ 基础设定</div>
        <div class="rbr-row">
          <span class="rbr-label">时间</span>
          <input class="rbr-input" id="rbr-time" placeholder="深夜 11:30">
        </div>
        <div class="rbr-row">
          <span class="rbr-label">天气环境</span>
          <input class="rbr-input" id="rbr-weather" placeholder="暴雨、浓雾、停电……">
        </div>
      </div>

      <div class="rbr-section">
        <div class="rbr-section-title">
          ◈ 区域列表
          <div class="rbr-field-actions">
            <button class="rbr-btn-sm" id="rbr-area-random">🎲 随机添加</button>
            <button class="rbr-btn-sm" id="rbr-area-add">+ 添加</button>
          </div>
        </div>
        <div class="rbr-areas-list" id="rbr-areas-list"></div>
      </div>

      <div class="rbr-section">
        <div class="rbr-section-title">
          ◈ 逃生条件
          <div class="rbr-field-actions">
            <button class="rbr-btn-sm" id="rbr-escape-random">🎲 随机添加</button>
            <button class="rbr-btn-sm" id="rbr-escape-add">+ 添加</button>
          </div>
        </div>
        <div class="rbr-escapes-list" id="rbr-escapes-list"></div>
      </div>

      <hr class="rbr-divider">

      <div class="rbr-section">
        <div class="rbr-section-title">◈ 开场白情景（不写入变量，仅影响AI生成）</div>
        <div class="rbr-row">
          <span class="rbr-label">随机池</span>
          <div class="rbr-inline-btns">
            <button class="rbr-mode-btn active" id="rbr-scene-mode-disguised" data-mode="disguised">伪装混入池</button>
            <button class="rbr-mode-btn" id="rbr-scene-mode-remote" data-mode="remote">幕后远程池</button>
            <button class="rbr-mode-btn" id="rbr-scene-mode-hunter" data-mode="hunter">公开追击池</button>
            <button class="rbr-btn-sm" id="rbr-scene-random" title="从当前池随机">🎲 抽取</button>
          </div>
        </div>
        <div class="rbr-row rbr-row-top">
          <span class="rbr-label">场景设定</span>
          <div class="rbr-row-grow">
            <textarea class="rbr-textarea" id="rbr-scene-custom" placeholder="可手动填写；点“抽取”会自动填入当前池随机结果"></textarea>
            <div class="rbr-field-actions">
              <button class="rbr-btn-sm rbr-btn-null" id="rbr-scene-null" title="将场景关联为 null">关联 null</button>
            </div>
          </div>
        </div>
        <div class="rbr-row rbr-row-top">
          <span class="rbr-label">伪装身份</span>
          <div class="rbr-row-grow">
            <textarea class="rbr-textarea" id="rbr-disguise-custom" placeholder="可手动填写；非伪装池通常为 null"></textarea>
            <div class="rbr-field-actions">
              <button class="rbr-btn-sm rbr-btn-null" id="rbr-disguise-null" title="将身份关联为 null">关联 null</button>
            </div>
          </div>
        </div>
        <div class="rbr-row">
          <span class="rbr-label">开场字数</span>
          <select class="rbr-select" id="rbr-word-count">
            <option value="500">简短（~500字）</option>
            <option value="1000" selected>中等（~1000字）</option>
            <option value="2000">详细（~2000字）</option>
            <option value="3000">超长（~3000字）</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 角色生成标签页 -->
    <div class="rbr-tab-content" id="rbr-tab-chars">
      <div class="rbr-section">
        <div class="rbr-section-title">
          ◈ 登场角色
          <div class="rbr-field-actions">
            <button class="rbr-btn-sm" id="rbr-chars-random-all">🎲 全部随机</button>
            <button class="rbr-btn-sm" id="rbr-char-add">+ 添加角色</button>
          </div>
        </div>
        <div id="rbr-chars-list"></div>
      </div>
    </div>

    <div class="rbr-btn-row">
      <button class="rbr-btn primary" id="rbr-start-btn">⛧ 开始 ⛧</button>
    </div>
    <div class="rbr-hint">配置完成后点击「开始」，将写入变量并生成开场白</div>
  </div>
</div>`;
}

function buildDoneHtml(): string {
  return `<div class="${RENDERED_CLASS} rbr-stage-wrapper">
  ${STYLE}
  <div class="rbr-card">
    <div class="rbr-done-msg">⛧ 舞台已就绪，演出开始 ⛧</div>
  </div>
</div>`;
}

// ── 可编辑列表渲染 ────────────────────────────────────────────
function renderAreaItem(a: AreaDef, idx: number): string {
  const dangerOpts = [0,1,2,3,4,5].map(d =>
    `<option value="${d}"${a.danger === d ? ' selected' : ''}>${d} ${'☠'.repeat(d) || '—'}</option>`
  ).join('');
  return `<div class="rbr-editable-item" data-area-idx="${idx}">
    <div class="rbr-item-header">
      <input class="rbr-item-name" type="text" value="${a.name}" placeholder="区域名">
      <button class="rbr-item-remove" title="删除">✕</button>
    </div>
    <textarea class="rbr-item-desc" rows="2" placeholder="区域描述">${a.desc}</textarea>
    <div class="rbr-area-meta-row">
      <label class="rbr-area-meta-label">
        <input class="rbr-item-passable" type="checkbox"${a.passable ? ' checked' : ''}>
        可通行
      </label>
      <label class="rbr-area-meta-label">危险等级
        <select class="rbr-item-danger">${dangerOpts}</select>
      </label>
    </div>
  </div>`;
}

function renderAreasList(areas: AreaDef[], container: HTMLElement): void {
  container.innerHTML = areas.length
    ? areas.map((a, i) => renderAreaItem(a, i)).join('')
    : '<div style="color:var(--rbr-muted);font-size:0.85em;padding:8px;">暂无区域，请选择预设或手动添加</div>';
  // 绑定删除按钮
  container.querySelectorAll<HTMLElement>('.rbr-item-remove').forEach((btn, i) => {
    btn.addEventListener('click', () => {
      areas.splice(i, 1);
      renderAreasList(areas, container);
    });
  });
  // 让区域内的 textarea 根据预设内容自动撑高
  applyAutoGrowToAll(container);
}

function renderEscapeItem(e: EscapeDef, idx: number): string {
  return `<div class="rbr-editable-item" data-escape-idx="${idx}">
    <div class="rbr-item-header">
      <input class="rbr-item-name" type="text" value="${e.name}" placeholder="逃生条件名">
      <button class="rbr-item-remove" title="删除">✕</button>
    </div>
    <textarea class="rbr-item-desc" rows="2" placeholder="逃生条件描述">${e.desc}</textarea>
  </div>`;
}

function renderEscapesList(escapes: EscapeDef[], container: HTMLElement): void {
  container.innerHTML = escapes.length
    ? escapes.map((e, i) => renderEscapeItem(e, i)).join('')
    : '<div style="color:var(--rbr-muted);font-size:0.85em;padding:8px;">暂无逃生条件</div>';
  container.querySelectorAll<HTMLElement>('.rbr-item-remove').forEach((btn, i) => {
    btn.addEventListener('click', () => {
      escapes.splice(i, 1);
      renderEscapesList(escapes, container);
    });
  });
  applyAutoGrowToAll(container);
}

function readAreasList(container: HTMLElement): AreaDef[] {
  return Array.from(container.querySelectorAll<HTMLElement>('.rbr-editable-item')).map(item => ({
    name: (item.querySelector<HTMLInputElement>('.rbr-item-name')?.value || '').trim(),
    desc: (item.querySelector<HTMLTextAreaElement>('.rbr-item-desc')?.value || '').trim(),
    passable: item.querySelector<HTMLInputElement>('.rbr-item-passable')?.checked ?? true,
    danger: Number(item.querySelector<HTMLSelectElement>('.rbr-item-danger')?.value ?? 0),
    explored: false,
  })).filter(a => a.name);
}

function readEscapesList(container: HTMLElement): EscapeDef[] {
  return Array.from(container.querySelectorAll<HTMLElement>('.rbr-editable-item')).map(item => ({
    name: (item.querySelector<HTMLInputElement>('.rbr-item-name')?.value || '').trim(),
    desc: (item.querySelector<HTMLTextAreaElement>('.rbr-item-desc')?.value || '').trim(),
  })).filter(e => e.name);
}

// ── 角色面板 ──────────────────────────────────────────────────
interface CharData {
  name: string;
  gender: '女' | '男';
  source: string;
  appearance: string;
  personality: string;
  personalityTag: string;
  weakness: string;
  ability: string;
  dress: string;
}

/** 生成随机角色数据（跳过已锁定字段） */
function randomCharData(existing?: Partial<CharData>, lockedFields: Set<string> = new Set()): CharData {
  const gender = (lockedFields.has('gender') && existing?.gender) ? existing.gender : (Math.random() < 0.5 ? '女' : '男') as '女' | '男';
  return {
    name: lockedFields.has('name') && existing?.name ? existing.name : randomName(gender),
    gender,
    // 随机生成功能下，来源始终强制为原创
    source: '原创',
    appearance: lockedFields.has('appearance') && existing?.appearance ? existing.appearance : randomAppearance(gender),
    personality: lockedFields.has('personality') && existing?.personality ? existing.personality : pick(PERSONALITIES),
    personalityTag: lockedFields.has('personalityTag') && existing?.personalityTag ? existing.personalityTag : pick(PERSONALITY_TAGS),
    weakness: lockedFields.has('weakness') && existing?.weakness ? existing.weakness : pick(WEAKNESSES),
    ability: lockedFields.has('ability') && existing?.ability ? existing.ability : pick(ABILITIES),
    dress: lockedFields.has('dress') && existing?.dress ? existing.dress : (gender === '男' ? randomMaleDress() : randomFemaleDress()),
  };
}

function createCharCard(index: number, data?: CharData): string {
  const d = data || randomCharData();
  const genderOpts = ['女', '男'].map(g => `<option value="${g}"${d.gender === g ? ' selected' : ''}>${g}</option>`).join('');

  const field = (label: string, key: string, value: string, isTextarea = false) => `
    <div class="rbr-field-row">
      <span class="rbr-label">${label}</span>
      ${isTextarea
        ? `<textarea class="rbr-textarea rbr-char-field" data-field="${key}" rows="2">${value}</textarea>`
        : `<input class="rbr-input rbr-char-field" data-field="${key}" value="${value.replace(/"/g, '&quot;')}">`}
      <div class="rbr-field-actions">
        <button class="rbr-icon-btn rbr-dice-btn" data-field="${key}" title="随机">🎲</button>
        <button class="rbr-icon-btn rbr-lock-btn" data-field="${key}" title="锁定">🔓</button>
      </div>
    </div>`;

  return `<div class="rbr-char-card" data-char-idx="${index}">
  <div class="rbr-char-header">
    <span class="rbr-char-name-display">${d.name}（${d.gender}）</span>
    <span class="rbr-char-toggle">▶</span>
  </div>
  <div class="rbr-char-body">
    ${field('姓名', 'name', d.name)}
    <div class="rbr-field-row">
      <span class="rbr-label">性别</span>
      <select class="rbr-select rbr-char-field" data-field="gender">${genderOpts}</select>
      <div class="rbr-field-actions">
        <button class="rbr-icon-btn rbr-lock-btn" data-field="gender" title="锁定">🔓</button>
      </div>
    </div>
    ${field('来源', 'source', d.source)}
    ${field('外貌', 'appearance', d.appearance, true)}
    ${field('性格核心', 'personality', d.personality)}
    ${field('性格标签', 'personalityTag', d.personalityTag)}
    ${field('弱点', 'weakness', d.weakness)}
    ${field('特殊能力', 'ability', d.ability)}
    ${field('着装', 'dress', d.dress, true)}
    <button class="rbr-char-remove-btn">✕ 删除此角色</button>
  </div>
</div>`;
}

function getCharData(cardEl: HTMLElement): CharData {
  const get = (field: string) =>
    (cardEl.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`[data-field="${field}"]`)?.value || '').trim();
  return {
    name: get('name'),
    gender: (get('gender') as '女' | '男') || '女',
    source: get('source') || '原创',
    appearance: get('appearance'),
    personality: get('personality'),
    personalityTag: get('personalityTag'),
    weakness: get('weakness'),
    ability: get('ability'),
    dress: get('dress'),
  };
}

function bindCharCardEvents(cardEl: HTMLElement, onUpdate: () => void): void {
  const header = cardEl.querySelector<HTMLElement>('.rbr-char-header')!;
  const body = cardEl.querySelector<HTMLElement>('.rbr-char-body')!;
  const toggle = cardEl.querySelector<HTMLElement>('.rbr-char-toggle')!;
  const nameDisplay = cardEl.querySelector<HTMLElement>('.rbr-char-name-display')!;

  // 折叠展开
  header.addEventListener('click', e => {
    if ((e.target as HTMLElement).closest('.rbr-field-actions')) return;
    const isOpen = body.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
  });

  // 名字/性别变化时更新显示
  const syncDisplay = () => {
    const name = cardEl.querySelector<HTMLInputElement>('[data-field="name"]')?.value || '未命名';
    const gender = cardEl.querySelector<HTMLSelectElement>('[data-field="gender"]')?.value || '';
    nameDisplay.textContent = `${name}（${gender}）`;
  };
  cardEl.querySelectorAll<HTMLElement>('[data-field="name"],[data-field="gender"]').forEach(el => {
    el.addEventListener('input', syncDisplay);
    el.addEventListener('change', syncDisplay);
  });

  // 锁定按钮
  const lockedFields = new Set<string>();
  cardEl.querySelectorAll<HTMLButtonElement>('.rbr-lock-btn').forEach(btn => {
    const field = btn.dataset.field!;
    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (lockedFields.has(field)) {
        lockedFields.delete(field);
        btn.textContent = '🔓';
        btn.classList.remove('locked');
      } else {
        lockedFields.add(field);
        btn.textContent = '🔒';
        btn.classList.add('locked');
      }
    });
  });

  // 随机按钮（单字段）
  cardEl.querySelectorAll<HTMLButtonElement>('.rbr-dice-btn').forEach(btn => {
    const field = btn.dataset.field!;
    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (lockedFields.has(field)) return;
      const currentGender = (cardEl.querySelector<HTMLSelectElement>('[data-field="gender"]')?.value as '女' | '男') || '女';
      let value = '';
      switch (field) {
        case 'name': value = randomName(currentGender); break;
        case 'appearance': value = randomAppearance(currentGender); break;
        case 'personality': value = pick(PERSONALITIES); break;
        case 'personalityTag': value = pick(PERSONALITY_TAGS); break;
        case 'weakness': value = pick(WEAKNESSES); break;
        case 'ability': value = pick(ABILITIES); break;
        case 'dress': value = currentGender === '男' ? randomMaleDress() : pick(['校服', '休闲便装', '户外装备', '睡衣', '制服']); break;
        case 'source': value = '原创'; break;
        default: return;
      }
      const input = cardEl.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[data-field="${field}"]`);
      setFieldValue(input, value);
      if (field === 'name') syncDisplay();
    });
  });

  // 删除按钮
  cardEl.querySelector<HTMLButtonElement>('.rbr-char-remove-btn')?.addEventListener('click', () => {
    if (confirm('确认删除此角色？')) {
      cardEl.remove();
      onUpdate();
    }
  });
}

// ── 开场白情景配置 ────────────────────────────────────────────
function collectOpeningSceneConfig(): OpeningSceneConfig {
  const activeModeBtn = parentDoc.querySelector<HTMLButtonElement>('.rbr-mode-btn.active');
  const mode = (activeModeBtn?.dataset.mode as SceneMode | undefined) ?? 'disguised';
  const sceneRaw = ($pid('rbr-scene-custom') as HTMLTextAreaElement | null)?.value ?? '';
  const disguiseRaw = ($pid('rbr-disguise-custom') as HTMLTextAreaElement | null)?.value ?? '';

  return {
    mode,
    scene: normalizeNullableInput(sceneRaw),
    disguise: normalizeNullableInput(disguiseRaw),
  };
}

function applyScenePromptToInputs(scenePrompt: ScenePrompt): void {
  const sceneInput = $pid('rbr-scene-custom') as HTMLTextAreaElement | null;
  const disguiseInput = $pid('rbr-disguise-custom') as HTMLTextAreaElement | null;
  setFieldValue(sceneInput, scenePrompt.scene);
  setFieldValue(disguiseInput, scenePrompt.disguise ?? 'null');
}

// ── 收集表单数据 ──────────────────────────────────────────────
function collectFormData(areasContainer: HTMLElement, escapesContainer: HTMLElement) {
  const time = ($pid('rbr-time') as HTMLInputElement)?.value || '深夜 11:30';
  const weather = ($pid('rbr-weather') as HTMLInputElement)?.value || '未设定';
  const openingScene = collectOpeningSceneConfig();

  const finalAreas = readAreasList(areasContainer);
  const finalEscapes = readEscapesList(escapesContainer);

  const firstAreaName = finalAreas.length > 0 ? finalAreas[0].name : '未设定';

  const areaState: Record<string, { 描述: string; 可通行: boolean; 危险等级: number; 已探索: boolean }> = {};
  for (const a of finalAreas) {
    areaState[a.name] = { 描述: a.desc, 可通行: a.passable, 危险等级: a.danger, 已探索: a.explored };
  }

  const escapeProgress: Record<string, { 描述: string; 是否达成: boolean }> = {};
  for (const e of finalEscapes) {
    escapeProgress[e.name] = { 描述: e.desc, 是否达成: false };
  }

  // 收集角色数据
  const charsList = $pid('rbr-chars-list');
  const characters: Record<string, any> = {};
  if (charsList) {
    charsList.querySelectorAll<HTMLElement>('.rbr-char-card').forEach(card => {
      const cd = getCharData(card);
      if (!cd.name) return;
      characters[cd.name] = {
        _性别: cd.gender,
        _外貌: cd.appearance,
        _性格核心: cd.personality,
        _性格标签: cd.personalityTag,
        _弱点: cd.weakness,
        _来源: cd.source || '原创',
        _特殊能力: cd.ability,
        状态: '存活',
        当前位置: firstAreaName,
        着装: cd.dress,
        恐惧: 20,
        理智: 80,
        体力: 100,
        对user的信任: 30,
        当前行为: '刚刚到达',
        内心状态: '忐忑不安',
        伤势: '无',
        持有物品: {},
      };
    });
  }

  const stageData = {
    场景: {
      当前区域: firstAreaName,
      时间: time,
      天气与环境: weather,
      区域状态: areaState,
      逃生进度: escapeProgress,
    },
    角色: characters,
    追击者: {
      当前位置: firstAreaName,
      伪装身份: openingScene.disguise,
      暴露程度: 0,
      威胁手段: {},
      已造成的效果: '尚未行动',
    },
    事件: {
      阶段: 1,
      阶段描述: '探索期——一切看似还算正常，只有细微的不协调感暗示着危险的存在',
      死亡记录: {},
      关键事件: {},
    },
    氛围: {
      恐怖等级: 2,
      异常现象: '偶尔传来无法解释的声响',
      线索碎片: {},
    },
  };

  return {
    stageData,
    openingScene,
    wordCount: ($pid('rbr-word-count') as HTMLSelectElement)?.value || '1000',
    areas: finalAreas,
    escapes: finalEscapes,
  };
}

// ── 构建发送给AI的摘要消息 ────────────────────────────────────
function buildSummaryText(
  stageData: ReturnType<typeof collectFormData>['stageData'],
  openingScene: OpeningSceneConfig,
  wordCount: string,
): string {
  const s = stageData.场景;
  const areaNames = Object.keys(s.区域状态).join('、') || '无';
  const escapeNames = Object.keys(s.逃生进度).join('、') || '无';
  const charNames = Object.entries(stageData.角色)
    .map(([name, c]) => `${name}（${c._性别}）`)
    .join('、') || '无登场角色';

  let text = `[舞台配置完成]\n`;
  text += `开场白池：${SCENE_MODE_LABEL[openingScene.mode]}\n`;
  if (openingScene.scene !== null) {
    text += `情景：${openingScene.scene}\n`;
  } else {
    text += `情景：null（由AI按池类型自行扩展）\n`;
  }
  if (openingScene.disguise !== null) {
    text += `user身份：${openingScene.disguise}\n`;
  } else {
    text += `user身份：null（无需伪装/不设定）\n`;
  }
  text += `舞台：时间 ${s.时间} | 天气 ${s.天气与环境}\n`;
  text += `区域：${areaNames}\n`;
  text += `逃生条件：${escapeNames}\n`;
  text += `角色：${charNames}\n`;
  text += `目标字数：约${wordCount}字\n\n`;
  text += `请根据以上设定开始恐怖剧开场白。若某项为 null，请按池类型自动补全并保持风格一致。`;
  return text;
}

// ── 渲染单条消息 ─────────────────────────────────────────────
function renderOneMessage(message_id: number): void {
  try {
    const messages = getChatMessages(message_id);
    if (!messages || messages.length === 0) return;

    const message = messages[0].message;
    if (!message.includes(PLACEHOLDER)) return;

    const $mes_text = retrieveDisplayedMessage(message_id);
    if (!$mes_text || $mes_text.length === 0) return;

    // 已配置完成时显示简洁消息
    const mvuData = Mvu?.getMvuData?.({ type: 'message', message_id });
    const statData = mvuData && _.get(mvuData, 'stat_data');
    if (statData && statData.场景 && statData.场景.当前区域 !== '未设定') {
      $mes_text.find(`.${RENDERED_CLASS}`).remove();
      $mes_text.append(buildDoneHtml());
      return;
    }

    // 防止重复渲染
    if ($mes_text.find(`.${RENDERED_CLASS}`).length > 0) return;

    $mes_text.append(buildStageConfigHtml());

    // ── 标签页切换 ──
    const card = $pid('rbr-stage-config')!;
    card.querySelectorAll<HTMLElement>('.rbr-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const targetId = `rbr-tab-${tab.dataset.tab}`;
        card.querySelectorAll<HTMLElement>('.rbr-tab').forEach(t => t.classList.remove('active'));
        card.querySelectorAll<HTMLElement>('.rbr-tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        $pid(targetId)?.classList.add('active');
      });
    });

    // ── 元素引用 ──
    const areasContainer = $pid('rbr-areas-list') as HTMLElement;
    const escapesContainer = $pid('rbr-escapes-list') as HTMLElement;
    const charsListEl = $pid('rbr-chars-list') as HTMLElement;
    const presetSelect = $pid('rbr-preset') as HTMLSelectElement;
    const timeInput = $pid('rbr-time') as HTMLInputElement;
    const weatherInput = $pid('rbr-weather') as HTMLInputElement;
    const startBtn = $pid('rbr-start-btn') as HTMLButtonElement;

    // ── 全局 textarea auto-grow（场景设定/伪装身份等） ──
    applyAutoGrowToAll(card);

    let currentAreas: AreaDef[] = [];
    let currentEscapes: EscapeDef[] = [];
    let charCount = 0;

    // ── 加载预设 ──
    function loadPreset(key: string) {
      const preset = PRESETS[key];
      if (!preset) return;
      timeInput.value = preset.time;
      weatherInput.value = preset.weather;
      currentAreas = JSON.parse(JSON.stringify(preset.areas));
      currentEscapes = JSON.parse(JSON.stringify(preset.escapes));
      renderAreasList(currentAreas, areasContainer);
      renderEscapesList(currentEscapes, escapesContainer);
    }

    presetSelect.addEventListener('change', () => loadPreset(presetSelect.value));
    loadPreset('abandoned_mansion');

    // ── 区域添加按钮 ──
    $pid('rbr-area-add')?.addEventListener('click', () => {
      currentAreas.push({ name: '', desc: '', passable: true, danger: 0, explored: false });
      renderAreasList(currentAreas, areasContainer);
    });
    $pid('rbr-area-random')?.addEventListener('click', () => {
      const allAreas = [...Object.values(RANDOM_AREAS).flat()];
      const area = pick(allAreas);
      currentAreas.push({ ...area });
      renderAreasList(currentAreas, areasContainer);
    });

    // ── 逃生条件添加按钮 ──
    $pid('rbr-escape-add')?.addEventListener('click', () => {
      currentEscapes.push({ name: '', desc: '' });
      renderEscapesList(currentEscapes, escapesContainer);
    });
    $pid('rbr-escape-random')?.addEventListener('click', () => {
      const escape = pick(RANDOM_ESCAPES);
      currentEscapes.push({ ...escape });
      renderEscapesList(currentEscapes, escapesContainer);
    });

    // ── 情景池选择与随机抽取 ──
    let selectedSceneMode: SceneMode = 'disguised';

    const setSceneMode = (mode: SceneMode) => {
      selectedSceneMode = mode;
      parentDoc.querySelectorAll<HTMLButtonElement>('.rbr-mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
      });
    };

    parentDoc.querySelectorAll<HTMLButtonElement>('.rbr-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode as SceneMode | undefined;
        if (!mode) return;
        setSceneMode(mode);
      });
    });
    setSceneMode('disguised');

    $pid('rbr-scene-random')?.addEventListener('click', () => {
      const randomScene = pickScenePrompt(selectedSceneMode);
      applyScenePromptToInputs(randomScene);
      if (randomScene.type !== selectedSceneMode) {
        setSceneMode(randomScene.type);
      }
    });

    $pid('rbr-scene-null')?.addEventListener('click', () => {
      const sceneInput = $pid('rbr-scene-custom') as HTMLTextAreaElement | null;
      setFieldValue(sceneInput, 'null');
    });

    $pid('rbr-disguise-null')?.addEventListener('click', () => {
      const disguiseInput = $pid('rbr-disguise-custom') as HTMLTextAreaElement | null;
      setFieldValue(disguiseInput, 'null');
    });

    // ── 角色面板：辅助函数 ──
    function addCharCard(data?: CharData) {
      const tempDiv = parentDoc.createElement('div');
      tempDiv.innerHTML = createCharCard(charCount++, data);
      const cardEl = tempDiv.firstElementChild as HTMLElement;
      charsListEl.appendChild(cardEl);
      bindCharCardEvents(cardEl, () => { /* no-op on update */ });
      // 默认展开新添加的卡片
      cardEl.querySelector<HTMLElement>('.rbr-char-body')?.classList.add('open');
      cardEl.querySelector<HTMLElement>('.rbr-char-toggle')?.classList.add('open');
      // 让随机生成的长内容自动撑高
      applyAutoGrowToAll(cardEl);
    }

    $pid('rbr-char-add')?.addEventListener('click', () => addCharCard());

    // ── 全部随机（跳过锁定字段） ──
    $pid('rbr-chars-random-all')?.addEventListener('click', () => {
      const cards = charsListEl.querySelectorAll<HTMLElement>('.rbr-char-card');
      if (cards.length === 0) {
        // 没有角色时直接添加3个随机角色
        for (let i = 0; i < 3; i++) addCharCard();
        return;
      }
      cards.forEach(cardEl => {
        const lockedFields = new Set<string>();
        cardEl.querySelectorAll<HTMLButtonElement>('.rbr-lock-btn.locked').forEach(btn => {
          if (btn.dataset.field) lockedFields.add(btn.dataset.field);
        });
        const existing = getCharData(cardEl);
        const newData = randomCharData(existing, lockedFields);
        // 写回（通过 setFieldValue 触发 input 事件，让 textarea 自动撑高）
        const setField = (field: string, value: string) => {
          const el = cardEl.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`[data-field="${field}"]`);
          setFieldValue(el, value);
        };
        Object.entries(newData).forEach(([k, v]) => setField(k, String(v)));
        // 更新显示名称
        const nameDisplay = cardEl.querySelector<HTMLElement>('.rbr-char-name-display');
        if (nameDisplay) nameDisplay.textContent = `${newData.name}（${newData.gender}）`;
      });
    });

    // ── 开始按钮 ──
    startBtn.addEventListener('click', async () => {
      const hasChars = charsListEl.querySelectorAll<HTMLElement>('.rbr-char-card').length > 0;
      if (!hasChars) {
        const goFill = confirm('当前没有登场角色。\n\n点击「确定」跳转到角色生成标签页，\n点击「取消」直接跳过角色继续开始。');
        if (goFill) {
          card.querySelectorAll<HTMLElement>('.rbr-tab').forEach(t => t.classList.remove('active'));
          card.querySelectorAll<HTMLElement>('.rbr-tab-content').forEach(c => c.classList.remove('active'));
          $pid('rbr-tab-chars')?.classList.add('active');
          card.querySelector<HTMLElement>('[data-tab="chars"]')?.classList.add('active');
          return;
        }
      }

      startBtn.disabled = true;
      startBtn.textContent = '⏳ 正在配置…';

      try {
        const { stageData, openingScene, wordCount } = collectFormData(areasContainer, escapesContainer);

        // 写入 MVU 变量
        const mvuData = Mvu.getMvuData({ type: 'message', message_id });
        _.set(mvuData, 'stat_data', stageData);
        await Mvu.replaceMvuData(mvuData, { type: 'message', message_id });
        console.info('[RBR] MVU 变量已写入:', stageData);

        // 发送用户消息触发AI生成开场白
        const summaryText = buildSummaryText(stageData, openingScene, wordCount);
        await createChatMessages([{ role: 'user', message: summaryText }]);

        // 替换UI为完成状态
        $mes_text.find(`.${RENDERED_CLASS}`).remove();
        $mes_text.append(buildDoneHtml());

        toastr.success('舞台配置完成，正在生成开场……', '🔪 Run Baby Run');
      } catch (err: any) {
        console.error('[RBR] 舞台配置失败:', err);
        toastr.error('舞台配置失败: ' + err.message, '❌ 错误');
        startBtn.disabled = false;
        startBtn.textContent = '⛧ 开始 ⛧';
      }
    });

    console.info(`[RBR] 楼层 ${message_id} 舞台配置界面已渲染`);
  } catch (error) {
    console.error(`[RBR] 渲染楼层 ${message_id} 失败:`, error);
  }
}

function renderAllMessages(): void {
  $('#chat', window.parent.document)
    .children(".mes[is_user='false'][is_system='false']")
    .each((_index, node) => {
      const mesId = node.getAttribute('mesid');
      if (mesId !== null) {
        renderOneMessage(Number(mesId));
      }
    });
}

// ── 初始化 ──────────────────────────────────────────────────
$(() => {
  errorCatched(async () => {
    await waitGlobalInitialized('Mvu');
    await renderAllMessages();

    eventOn(tavern_events.CHARACTER_MESSAGE_RENDERED, errorCatched(renderOneMessage));
    eventOn(tavern_events.MESSAGE_UPDATED, errorCatched(renderOneMessage));
    eventOn(tavern_events.MESSAGE_SWIPED, errorCatched(renderOneMessage));
    eventOn(tavern_events.MESSAGE_DELETED, errorCatched(renderAllMessages));

    toastr.success('舞台渲染脚本已加载', '🔪 Run Baby Run');
  })();
});

$(window).on('pagehide', () => {
  console.info('[RBR] 舞台渲染脚本已卸载');
});
