// ═══════════════════════════════════════════════════════════════
// Run Baby Run — 角色生成脚本（QR按钮弹窗版）
// 监听 rbr-open-char-creator 自定义事件，打开角色创建弹窗
// 提交后写入 MVU 变量，并弹出发送方式选择
// ═══════════════════════════════════════════════════════════════

import { STYLE } from '../舞台渲染/styles';
import {
  pick,
  randomName,
  randomAppearance,
  randomMaleDress,
  PERSONALITIES,
  PERSONALITY_TAGS,
  WEAKNESSES,
  ABILITIES,
} from '../舞台渲染/random_pools';

// ── 父页面辅助 ────────────────────────────────────────────────
const parentDoc = window.parent.document;
function $pid(id: string): HTMLElement | null {
  return parentDoc.getElementById(id);
}

// ── 角色数据类型 ──────────────────────────────────────────────
interface CharData {
  name: string;
  gender: '女' | '男';
  appearance: string;
  personality: string;
  personalityTag: string;
  weakness: string;
  ability: string;
  dress: string;
}

function randomCharData(existing?: Partial<CharData>, lockedFields: Set<string> = new Set()): CharData {
  const gender = (lockedFields.has('gender') && existing?.gender) ? existing.gender : (Math.random() < 0.5 ? '女' : '男') as '女' | '男';
  return {
    name: lockedFields.has('name') && existing?.name ? existing.name : randomName(gender),
    gender,
    appearance: lockedFields.has('appearance') && existing?.appearance ? existing.appearance : randomAppearance(gender),
    personality: lockedFields.has('personality') && existing?.personality ? existing.personality : pick(PERSONALITIES),
    personalityTag: lockedFields.has('personalityTag') && existing?.personalityTag ? existing.personalityTag : pick(PERSONALITY_TAGS),
    weakness: lockedFields.has('weakness') && existing?.weakness ? existing.weakness : pick(WEAKNESSES),
    ability: lockedFields.has('ability') && existing?.ability ? existing.ability : pick(ABILITIES),
    dress: lockedFields.has('dress') && existing?.dress ? existing.dress : (gender === '男' ? randomMaleDress() : pick(['校服', '休闲便装', '户外装备', '睡衣', '制服'])),
  };
}

// ── 弹窗 HTML ─────────────────────────────────────────────────
const MODAL_ID = 'rbr-char-creator-modal';

function buildModalHtml(d: CharData): string {
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

  return `<div id="${MODAL_ID}" style="
      position:fixed;inset:0;z-index:99999;
      display:flex;align-items:center;justify-content:center;
      background:rgba(0,0,0,0.75);backdrop-filter:blur(4px);">
    ${STYLE}
    <div class="rbr-stage-wrapper" style="margin:0;max-height:90vh;overflow-y:auto;width:min(560px,95vw);">
      <div class="rbr-card" style="max-height:none;">
        <div class="rbr-title" style="margin-bottom:12px;">👤 创 建 角 色</div>

        ${field('姓名', 'name', d.name)}
        <div class="rbr-field-row">
          <span class="rbr-label">性别</span>
          <select class="rbr-select rbr-char-field" data-field="gender">${genderOpts}</select>
          <div class="rbr-field-actions">
            <button class="rbr-icon-btn rbr-lock-btn" data-field="gender" title="锁定">🔓</button>
          </div>
        </div>
        ${field('外貌', 'appearance', d.appearance, true)}
        ${field('性格核心', 'personality', d.personality)}
        ${field('性格标签', 'personalityTag', d.personalityTag)}
        ${field('弱点', 'weakness', d.weakness)}
        ${field('特殊能力', 'ability', d.ability)}
        ${field('着装', 'dress', d.dress, true)}

        <div class="rbr-btn-row" style="margin-top:16px;">
          <button class="rbr-btn" id="rbr-cc-cancel">取消</button>
          <button class="rbr-btn primary" id="rbr-cc-random-all">🎲 全部随机</button>
          <button class="rbr-btn primary" id="rbr-cc-submit">✓ 确认</button>
        </div>
      </div>
    </div>
  </div>`;
}

// ── 从弹窗 DOM 读取角色数据 ───────────────────────────────────
function readModalCharData(): CharData {
  const modal = $pid(MODAL_ID)!;
  const get = (field: string) =>
    (modal.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[data-field="${field}"]`)?.value || '').trim();
  return {
    name: get('name'),
    gender: (get('gender') as '女' | '男') || '女',
    appearance: get('appearance'),
    personality: get('personality'),
    personalityTag: get('personalityTag'),
    weakness: get('weakness'),
    ability: get('ability'),
    dress: get('dress'),
  };
}

// ── 构建角色信息文本（用于发送/追加） ────────────────────────
function buildCharText(cd: CharData): string {
  return `[新角色加入]\n`
    + `姓名：${cd.name}（${cd.gender}）\n`
    + `外貌：${cd.appearance}\n`
    + `性格：${cd.personality}，${cd.personalityTag}\n`
    + `弱点：${cd.weakness}\n`
    + `能力：${cd.ability}\n`
    + `着装：${cd.dress}\n\n`
    + `请将上述角色加入当前剧情，描述她们出现的方式。`;
}

// ── 打开弹窗 ──────────────────────────────────────────────────
function openCharCreator(): void {
  // 防止重复弹窗
  if ($pid(MODAL_ID)) return;

  const initialData = randomCharData();

  const overlay = parentDoc.createElement('div');
  overlay.innerHTML = buildModalHtml(initialData);
  const modal = overlay.firstElementChild as HTMLElement;
  parentDoc.body.appendChild(modal);

  // 锁定状态
  const lockedFields = new Set<string>();

  // ── 锁定按钮 ──
  modal.querySelectorAll<HTMLButtonElement>('.rbr-lock-btn').forEach(btn => {
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

  // ── 单字段随机 ──
  modal.querySelectorAll<HTMLButtonElement>('.rbr-dice-btn').forEach(btn => {
    const field = btn.dataset.field!;
    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (lockedFields.has(field)) return;
      const currentGender = (modal.querySelector<HTMLSelectElement>('[data-field="gender"]')?.value as '女' | '男') || '女';
      let value = '';
      switch (field) {
        case 'name': value = randomName(currentGender); break;
        case 'appearance': value = randomAppearance(currentGender); break;
        case 'personality': value = pick(PERSONALITIES); break;
        case 'personalityTag': value = pick(PERSONALITY_TAGS); break;
        case 'weakness': value = pick(WEAKNESSES); break;
        case 'ability': value = pick(ABILITIES); break;
        case 'dress': value = currentGender === '男' ? randomMaleDress() : pick(['校服', '休闲便装', '户外装备', '睡衣', '制服']); break;
        default: return;
      }
      const input = modal.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[data-field="${field}"]`);
      if (input) input.value = value;
    });
  });

  // ── 全部随机 ──
  $pid('rbr-cc-random-all')?.addEventListener('click', () => {
    const existing = readModalCharData();
    const newData = randomCharData(existing, lockedFields);
    Object.entries(newData).forEach(([k, v]) => {
      const el = modal.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`[data-field="${k}"]`);
      if (el) el.value = String(v);
    });
  });

  // ── 取消 ──
  const closeModal = () => modal.remove();
  $pid('rbr-cc-cancel')?.addEventListener('click', closeModal);

  // 点击遮罩关闭
  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });

  // ── 确认提交 ──
  $pid('rbr-cc-submit')?.addEventListener('click', async () => {
    const cd = readModalCharData();
    if (!cd.name) {
      toastr.warning('请填写角色姓名', '⚠️');
      return;
    }

    // 弹出发送方式选择
    const choice = confirm(
      `角色【${cd.name}（${cd.gender}）】已创建。\n\n`
      + `点击「确定」→ 直接发送消息触发 AI\n`
      + `点击「取消」→ 追加到当前输入框末尾`
    );

    closeModal();

    const charText = buildCharText(cd);

    if (choice) {
      // 直接发送，触发AI
      try {
        await createChatMessages([{ role: 'user', message: charText }]);
        toastr.success(`角色 ${cd.name} 已发送`, '👤 Run Baby Run');
      } catch (err: any) {
        console.error('[RBR] 角色发送失败:', err);
        toastr.error('发送失败: ' + err.message, '❌ 错误');
      }
    } else {
      // 追加到输入框
      const inputBox = parentDoc.querySelector<HTMLTextAreaElement>('#send_textarea');
      if (inputBox) {
        const current = inputBox.value.trimEnd();
        inputBox.value = current ? current + '\n\n' + charText : charText;
        inputBox.focus();
        toastr.success(`角色 ${cd.name} 信息已追加到输入框`, '👤 Run Baby Run');
      } else {
        toastr.warning('未找到输入框，已复制到剪贴板', '⚠️');
        navigator.clipboard.writeText(charText).catch(() => {});
      }
    }
  });
}

// ── 初始化：监听自定义事件 ────────────────────────────────────
$(() => {
  errorCatched(async () => {
    // 监听来自 QR 按钮的事件
    window.addEventListener('rbr-open-char-creator', () => {
      openCharCreator();
    });

    // 也监听父页面的事件（兼容不同触发方式）
    window.parent.addEventListener('rbr-open-char-creator', () => {
      openCharCreator();
    });

    toastr.success('角色生成脚本已加载', '👤 Run Baby Run');
  })();
});

$(window).on('pagehide', () => {
  // 清理弹窗
  $pid(MODAL_ID)?.remove();
  console.info('[RBR] 角色生成脚本已卸载');
});
