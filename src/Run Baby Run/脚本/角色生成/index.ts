// ═══════════════════════════════════════════════════════════════
// Run Baby Run — 角色生成脚本（QR按钮弹窗版，iframe 隔离方案）
// 监听 rbr-open-char-creator 自定义事件，打开角色创建弹窗
// 提交后写入 MVU 变量，并弹出发送方式选择
//
// ⚠️ 全屏 modal 必须用 iframe 隔离（参见 .cursor/rules/QR脚本全屏面板.mdc）
//   旧的 position:fixed;inset:0 div 直挂 parent.body 的写法在手机端会被
//   酒馆祖先的 transform 击穿，面板只露出顶部一小条。iframe 自身是独立的
//   定位上下文，免疫该问题。
// ═══════════════════════════════════════════════════════════════

import { createScriptIdIframe } from '@util/script';
import { STYLE } from '../舞台渲染/styles';
import {
  pick,
  randomName,
  randomAppearance,
  randomMaleDress,
  randomFemaleDress,
  PERSONALITIES,
  PERSONALITY_TAGS,
  WEAKNESSES,
  ABILITIES,
} from '../舞台渲染/random_pools';

// ── 父页面辅助 ────────────────────────────────────────────────
const parentDoc = window.parent.document;

// ── 角色数据类型 ──────────────────────────────────────────────
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

function randomCharData(existing?: Partial<CharData>, lockedFields: Set<string> = new Set()): CharData {
  const gender = (lockedFields.has('gender') && existing?.gender) ? existing.gender : (Math.random() < 0.5 ? '女' : '男') as '女' | '男';
  return {
    name: lockedFields.has('name') && existing?.name ? existing.name : randomName(gender),
    gender,
    source: '原创',
    appearance: lockedFields.has('appearance') && existing?.appearance ? existing.appearance : randomAppearance(gender),
    personality: lockedFields.has('personality') && existing?.personality ? existing.personality : pick(PERSONALITIES),
    personalityTag:
      lockedFields.has('personalityTag') && existing?.personalityTag ? existing.personalityTag : pick(PERSONALITY_TAGS),
    weakness: lockedFields.has('weakness') && existing?.weakness ? existing.weakness : pick(WEAKNESSES),
    ability: lockedFields.has('ability') && existing?.ability ? existing.ability : pick(ABILITIES),
    dress:
      lockedFields.has('dress') && existing?.dress
        ? existing.dress
        : gender === '男'
          ? randomMaleDress()
          : randomFemaleDress(),
  };
}

// ── iframe 内的弹窗骨架 ───────────────────────────────────────
const MODAL_ID = 'rbr-char-creator-modal';

/**
 * iframe 自身就是全屏 viewport，所以内部的容器不需要 position:fixed。
 * 用 grid 居中卡片，外层负责半透明遮罩 + 模糊。
 */
function buildModalHtml(d: CharData): string {
  const genderOpts = ['女', '男']
    .map(g => `<option value="${g}"${d.gender === g ? ' selected' : ''}>${g}</option>`)
    .join('');

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

  return `<div id="${MODAL_ID}" class="rbr-cc-overlay">
    <div class="rbr-stage-wrapper rbr-cc-wrapper">
      <div class="rbr-card rbr-cc-card">
        <div class="rbr-title" style="margin-bottom:12px;">👤 创 建 角 色</div>

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

        <div class="rbr-btn-row" style="margin-top:16px;">
          <button class="rbr-btn" id="rbr-cc-cancel">取消</button>
          <button class="rbr-btn primary" id="rbr-cc-random-all">🎲 全部随机</button>
          <button class="rbr-btn primary" id="rbr-cc-submit">✓ 确认</button>
        </div>
      </div>
    </div>
  </div>`;
}

/** iframe 内额外注入的少量布局样式：遮罩 + 居中 + 滚动 */
const IFRAME_LAYOUT_CSS = `
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    background: transparent;
  }
  body {
    box-sizing: border-box;
  }
  .rbr-cc-overlay {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    padding: 12px;
    box-sizing: border-box;
    overflow-y: auto;
  }
  .rbr-cc-wrapper {
    margin: 0;
    width: min(560px, 100%);
    max-height: calc(100dvh - 24px);
    overflow-y: auto;
  }
  .rbr-cc-card {
    max-height: none;
  }
`;

// ── iframe 单例 ──────────────────────────────────────────────
let $iframe: JQuery<HTMLIFrameElement> | null = null;
let iframeReady: Promise<Document> | null = null;
let vvCleanup: (() => void) | null = null;

function ensureIframe(): Promise<Document> {
  if (iframeReady) return iframeReady;

  iframeReady = new Promise<Document>(resolve => {
    const $f = createScriptIdIframe()
      .css({
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        border: 'none',
        'z-index': '99999',
        'pointer-events': 'none',
        display: 'none',
      })
      .appendTo(parentDoc.body)
      .on('load', () => {
        const doc = $f[0].contentDocument!;
        const win = $f[0].contentWindow!;

        // ── 手机端键盘行为：让键盘"覆盖"内容，而不是把窗口顶起 ──
        // 1) interactive-widget=overlays-content：Chromium 108+ 标准做法
        let metaViewport = doc.querySelector('meta[name="viewport"]');
        if (!metaViewport) {
          metaViewport = doc.createElement('meta');
          metaViewport.setAttribute('name', 'viewport');
          doc.head.appendChild(metaViewport);
        }
        metaViewport.setAttribute(
          'content',
          'width=device-width, initial-scale=1, interactive-widget=overlays-content',
        );

        // 2) VirtualKeyboard API：Chromium 系兜底
        const vk = (win.navigator as any).virtualKeyboard;
        if (vk) {
          try { vk.overlaysContent = true; } catch { /* 老内核不支持，忽略 */ }
        }

        // 注入舞台渲染共享的样式（rbr-* 类）
        // STYLE 已经是 <style>...</style> 字符串，直接 insertAdjacentHTML
        doc.head.insertAdjacentHTML('beforeend', STYLE);
        // 再叠加 iframe 内布局样式
        const layoutEl = doc.createElement('style');
        layoutEl.textContent = IFRAME_LAYOUT_CSS;
        doc.head.appendChild(layoutEl);
        resolve(doc);
      });

    $iframe = $f;

    // 3) 父窗口 visualViewport 兜底：iOS Safari 等不支持上面两条 API 的浏览器，
    //    键盘弹出时 visualViewport.height 会变小，把 iframe 同步缩到可见区，
    //    避免内容被键盘挤出屏幕外。
    const pvv = window.parent.visualViewport;
    if (pvv) {
      const syncSize = () => {
        $f.css({
          top: `${pvv.offsetTop}px`,
          left: `${pvv.offsetLeft}px`,
          width: `${pvv.width}px`,
          height: `${pvv.height}px`,
        });
      };
      pvv.addEventListener('resize', syncSize);
      pvv.addEventListener('scroll', syncSize);
      vvCleanup = () => {
        pvv.removeEventListener('resize', syncSize);
        pvv.removeEventListener('scroll', syncSize);
      };
    }
  });

  return iframeReady;
}

function showIframe(): void {
  $iframe?.css({ display: 'block', 'pointer-events': 'auto' });
}

function hideIframe(): void {
  $iframe?.css({ display: 'none', 'pointer-events': 'none' });
  // 清空 body，避免残留事件 / DOM
  const doc = $iframe?.[0]?.contentDocument;
  if (doc) doc.body.innerHTML = '';
}

// ── 从弹窗 DOM 读取角色数据 ───────────────────────────────────
function readModalCharData(modalRoot: ParentNode): CharData {
  const get = (field: string) =>
    (modalRoot.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`[data-field="${field}"]`)?.value || '').trim();
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

// ── 构建角色信息文本（用于发送/追加） ────────────────────────
function buildCharText(cd: CharData): string {
  return `[新角色加入]\n`
    + `姓名：${cd.name}（${cd.gender}）\n`
    + `来源：${cd.source || '原创'}\n`
    + `外貌：${cd.appearance}\n`
    + `性格：${cd.personality}，${cd.personalityTag}\n`
    + `弱点：${cd.weakness}\n`
    + `能力：${cd.ability}\n`
    + `着装：${cd.dress}\n\n`
    + `请将上述角色加入当前剧情，描述她们出现的方式。`;
}

// ── 打开弹窗 ──────────────────────────────────────────────────
async function openCharCreator(): Promise<void> {
  const doc = await ensureIframe();

  // 已有同名 modal 时直接显示，不重建
  if (doc.getElementById(MODAL_ID)) {
    showIframe();
    return;
  }

  const initialData = randomCharData();
  doc.body.innerHTML = buildModalHtml(initialData);
  const modal = doc.getElementById(MODAL_ID)!;

  showIframe();

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
        case 'source': value = '原创'; break;
        default: return;
      }
      const input = modal.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[data-field="${field}"]`);
      if (input) input.value = value;
    });
  });

  // ── 全部随机 ──
  doc.getElementById('rbr-cc-random-all')?.addEventListener('click', () => {
    const existing = readModalCharData(modal);
    const newData = randomCharData(existing, lockedFields);
    Object.entries(newData).forEach(([k, v]) => {
      const el = modal.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`[data-field="${k}"]`);
      if (el) el.value = String(v);
    });
  });

  // ── 取消 ──
  const closeModal = () => hideIframe();
  doc.getElementById('rbr-cc-cancel')?.addEventListener('click', closeModal);

  // 点击遮罩关闭
  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });

  // ── 确认提交 ──
  doc.getElementById('rbr-cc-submit')?.addEventListener('click', async () => {
    const cd = readModalCharData(modal);
    if (!cd.name) {
      toastr.warning('请填写角色姓名', '⚠️');
      return;
    }

    // 弹出发送方式选择
    // 注意：confirm 必须用父窗口的，避免 iframe 内的 confirm 在某些环境下被屏蔽
    const choice = window.parent.confirm(
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

// ── 初始化：监听酒馆助手 QR 按钮 ────────────────────────────
$(() => {
  errorCatched(async () => {
    // 预先创建好 iframe，首次点击立即可用
    void ensureIframe();

    // 监听酒馆助手脚本按钮点击
    const btnEvent = getButtonEvent('👤 创建角色');
    eventOn(btnEvent, () => {
      void openCharCreator();
    });

    // 也兼容自定义 DOM 事件触发（保留备用）
    window.addEventListener('rbr-open-char-creator', () => {
      void openCharCreator();
    });

    toastr.success('角色生成脚本已加载', '👤 Run Baby Run');
  })();
});

$(window).on('pagehide', () => {
  // 清理 iframe
  vvCleanup?.();
  vvCleanup = null;
  $iframe?.remove();
  $iframe = null;
  iframeReady = null;
  console.info('[RBR] 角色生成脚本已卸载');
});
