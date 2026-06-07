<template>
  <details class="rc-regex" :open="shellOpen" @toggle="syncShellOpen">
    <summary class="regex-summary">
      <span class="summary-eyebrow">Reverse Conquest</span>
      <span class="summary-title">变量更新预览</span>
      <span class="summary-badge" :data-state="statusState">{{ statusLabel }}</span>
    </summary>

    <div class="regex-body">
      <div class="meta-bar">
        <span class="meta-chip">楼层 #{{ currentMessageId }}</span>
        <span v-if="finishedOps.length" class="meta-chip soft">{{ finishedOps.length }} 项变更</span>
        <button class="refresh-button" type="button" @click="refreshMessage">刷新</button>
      </div>

      <article class="preview-card paper-card pending-card" :data-active="pendingContent !== null">
        <details :open="pendingContent !== null">
          <summary class="card-summary">
            <span class="card-dot">✎</span>
            <span class="card-title">正在更新</span>
            <span class="card-tip">{{ pendingContent ? '点击展开 ▾' : '未检测到' }}</span>
          </summary>
          <pre class="raw-body">{{ pendingContent ?? '当前楼层未检测到未闭合的 <UpdateVariable> 标签。' }}</pre>
        </details>
      </article>

      <article class="preview-card paper-card done-card" :data-active="finishedBlock !== null">
        <details :open="finishedBlock !== null">
          <summary class="card-summary">
            <span class="card-dot">◆</span>
            <span class="card-title">完整更新</span>
            <span class="card-tip">{{ finishedBlock ? '点击收起 ▴' : '未检测到' }}</span>
          </summary>

          <div v-if="finishedBlock === null" class="empty-line">
            {{ '当前楼层未检测到完整 <UpdateVariable> … </UpdateVariable> 区块。' }}
          </div>

          <div v-else class="parsed-body">
            <section v-if="finishedAnalysis" class="analysis-block">
              <h3>分析 · Analysis</h3>
              <p>{{ finishedAnalysis }}</p>
            </section>

            <section v-if="finishedPatchRaw" class="ops-block">
              <h3>
                变更 · JSONPatch<template v-if="finishedOps.length"> · {{ finishedOps.length }}</template>
              </h3>
              <div v-if="finishedOps.length" class="op-list">
                <div v-for="(op, index) in finishedOps" :key="index" class="op-row" :data-op="op.op">
                  <span class="op-pill">{{ opLabel(op.op) }}</span>
                  <div class="op-detail">
                    <code class="op-path">{{ displayPath(op) }}</code>
                    <span v-if="op.valueText" class="op-value">{{ op.valueText }}</span>
                  </div>
                </div>
              </div>
              <pre v-else class="raw-body patch-raw">{{ finishedPatchRaw }}</pre>
            </section>

            <section v-if="!hasStructure" class="raw-fallback">
              <pre class="raw-body">{{ finishedBlock }}</pre>
            </section>
          </div>
        </details>
      </article>

      <footer class="regex-foot">展示当前楼层 &lt;UpdateVariable&gt; 标签内的变量更新，仅美化显示，不改动变量。</footer>
    </div>
  </details>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

type DisplayOp = {
  op: string;
  path: string;
  from?: string;
  to?: string;
  valueText: string;
};

const OP_LABELS: Record<string, string> = {
  replace: '替换',
  delta: '增减',
  insert: '新增',
  add: '新增',
  remove: '移除',
  move: '移动',
};

const currentMessageId = ref<number>(-1);
const messageText = ref('');
const shellOpen = ref(false);

const pendingRegex = /<(update(?:variable)?)>(?!.*<\/\1>)\s*((?:(?!<\1>).)*)\s*$/is;
const finishedRegex = /<(update(?:variable)?)>\s*((?:(?!<\1>).)*)\s*<\/\1>/is;
const analysisRegex = /<Analysis>([\s\S]*?)<\/Analysis>/i;
const jsonPatchRegex = /<JSONPatch>([\s\S]*?)<\/JSONPatch>/i;

const pendingContent = computed(() => messageText.value.match(pendingRegex)?.[2]?.trim() || null);
const finishedBlock = computed(() => messageText.value.match(finishedRegex)?.[2]?.trim() || null);
const finishedAnalysis = computed(() => finishedBlock.value?.match(analysisRegex)?.[1]?.trim() ?? '');
const finishedPatchRaw = computed(() => finishedBlock.value?.match(jsonPatchRegex)?.[1]?.trim() ?? '');
const finishedOps = computed<DisplayOp[]>(() => parseOps(finishedPatchRaw.value));
const hasStructure = computed(() => finishedAnalysis.value !== '' || finishedPatchRaw.value !== '');

const statusState = computed(() => (pendingContent.value ? 'live' : finishedBlock.value ? 'done' : 'idle'));
const statusLabel = computed(() => {
  if (pendingContent.value) return '生成中';
  if (finishedBlock.value) return '已完成';
  return '无更新';
});

function readCurrentMessageText() {
  const messageId = getCurrentMessageId();
  currentMessageId.value = messageId;
  const chatMessage = getChatMessages(messageId)[0];
  messageText.value = chatMessage?.message ?? '';
}

function refreshMessage() {
  readCurrentMessageText();
}

function syncShellOpen(event: Event) {
  shellOpen.value = (event.currentTarget as HTMLDetailsElement).open;
}

function parseOps(raw: string): DisplayOp[] {
  if (!raw) {
    return [];
  }
  const parsed = tryParseArray(raw);
  if (!parsed) {
    return [];
  }
  return parsed
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map(item => {
      const op = String(item.op ?? '').toLowerCase();
      return {
        op,
        path: cleanPath(String(item.path ?? '')),
        from: item.from === undefined ? undefined : cleanPath(String(item.from)),
        to: item.to === undefined ? undefined : cleanPath(String(item.to)),
        valueText: formatValue(op, item.value),
      };
    });
}

function tryParseArray(raw: string): unknown[] | null {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function cleanPath(path: string): string {
  return path
    .replace(/^\//, '')
    .split('/')
    .filter(Boolean)
    .join(' / ');
}

function formatValue(op: string, value: unknown): string {
  if (op === 'remove' || value === undefined) {
    return '';
  }
  if (op === 'delta' && typeof value === 'number') {
    return value > 0 ? `+${value}` : String(value);
  }
  if (typeof value === 'string') {
    return value;
  }
  if (value === null) {
    return 'null';
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function opLabel(op: string): string {
  return OP_LABELS[op] || op || '操作';
}

function displayPath(op: DisplayOp): string {
  if (op.op === 'move') {
    return `${op.from ?? '(根)'} → ${op.to ?? '(根)'}`;
  }
  return op.path || '(根)';
}

function setupEvents() {
  const targetId = getCurrentMessageId();

  eventOn(tavern_events.MESSAGE_UPDATED, messageId => {
    if (messageId === targetId) {
      refreshMessage();
    }
  });

  eventOn(tavern_events.MESSAGE_EDITED, messageId => {
    if (messageId === targetId) {
      refreshMessage();
    }
  });

  eventOn(tavern_events.CHAT_CHANGED, () => {
    refreshMessage();
  });
}

onMounted(() => {
  refreshMessage();
  setupEvents();
});
</script>

<style scoped>
.rc-regex {
  position: relative;
  width: min(100%, 760px);
  margin: 0 auto;
  border: 1px solid rgba(48, 45, 43, 0.5);
  border-radius: 12px;
  background:
    linear-gradient(135deg, #fffefc, #fcf5e2),
    var(--rcs-paper-deep);
  box-shadow:
    3px 4px 0 var(--rcs-shadow-soft),
    0 14px 26px rgba(77, 65, 52, 0.14);
  overflow: hidden;
}

.rc-regex::before {
  content: '';
  position: absolute;
  inset: 6px;
  border: 1.5px dotted var(--rcs-line-strong);
  border-radius: 9px;
  pointer-events: none;
  z-index: 2;
}

.paper-card {
  position: relative;
  border: 1.5px dotted var(--rcs-line-strong);
  border-radius: 8px;
  background-color: var(--rcs-paper);
  box-shadow:
    1.5px 2px 0 rgba(var(--rcs-shadow-rgb), 0.1),
    3px 4px 0 rgba(var(--rcs-shadow-rgb), 0.04);
}

.regex-summary {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 14px;
  cursor: pointer;
  list-style: none;
  background-color: var(--rcs-paper-yellow);
  border-bottom: 1.5px dotted var(--rcs-line-strong);
}

.regex-summary::-webkit-details-marker {
  display: none;
}

.regex-summary::after {
  content: '';
  position: absolute;
  top: -7px;
  left: 28px;
  width: 70px;
  height: 15px;
  background: repeating-linear-gradient(45deg, #fef6cf, #fef6cf 6px, #fae29c 6px, #fae29c 12px);
  opacity: 0.85;
  clip-path: polygon(5% 0%, 95% 0%, 100% 44%, 97% 100%, 3% 96%, 0% 46%);
  transform: rotate(-3deg);
  box-shadow: 1px 1.5px 2px rgba(var(--rcs-shadow-rgb), 0.14);
  pointer-events: none;
}

.summary-eyebrow {
  color: var(--rcs-ink-soft);
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-title {
  flex: 1;
  font-family: var(--rcs-font-title);
  font-size: 17px;
  font-weight: 700;
  color: var(--rcs-ink);
}

.summary-badge {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 2px 10px;
  border: 1.5px dotted var(--rcs-line-strong);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.6);
  color: var(--rcs-ink-soft);
  font-size: 11px;
  font-weight: 800;
  transform: rotate(1.5deg);
}

.summary-badge[data-state='live'] {
  border-style: solid;
  border-color: var(--rcs-coral-deep);
  background: var(--rcs-coral);
  color: #fffdf7;
  animation: badge-pulse 1.4s ease-in-out infinite;
}

.summary-badge[data-state='done'] {
  background: var(--rcs-paper-green);
  color: var(--rcs-sage);
}

@keyframes badge-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
}

.regex-body {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
}

.meta-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 2px 10px;
  border: 1.5px dotted var(--rcs-line-strong);
  border-radius: 999px;
  background: var(--rcs-paper);
  color: var(--rcs-ink);
  font-size: 12px;
  font-weight: 800;
}

.meta-chip.soft {
  background: var(--rcs-paper-blue);
  color: var(--rcs-blue);
}

.refresh-button {
  margin-left: auto;
  min-height: 30px;
  padding: 0 14px;
  border: 1.5px dotted var(--rcs-line-strong);
  border-radius: 8px;
  background: var(--rcs-paper-pink);
  color: var(--rcs-coral-deep);
  font-weight: 800;
  box-shadow: 1.5px 2px 0 rgba(var(--rcs-shadow-rgb), 0.12);
  transition:
    transform 0.14s ease,
    filter 0.14s ease,
    box-shadow 0.14s ease;
}

.refresh-button:hover {
  filter: brightness(1.02);
  transform: translateY(-1px);
  box-shadow: 2px 2.5px 0 rgba(var(--rcs-shadow-rgb), 0.16);
}

.refresh-button:active {
  transform: translateY(1px);
  box-shadow: 1px 1px 0 rgba(var(--rcs-shadow-rgb), 0.12);
}

.preview-card {
  padding: 0;
  overflow: hidden;
}

.preview-card[data-active='true'] {
  border-style: solid;
}

.pending-card[data-active='true'] {
  border-color: var(--rcs-coral);
}

.done-card[data-active='true'] {
  border-color: var(--rcs-sage);
}

.card-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  cursor: pointer;
  list-style: none;
  background: rgba(255, 255, 255, 0.4);
}

.card-summary::-webkit-details-marker {
  display: none;
}

.card-dot {
  color: var(--rcs-coral);
  font-size: 13px;
}

.done-card .card-dot {
  color: var(--rcs-sage);
}

.card-title {
  font-family: var(--rcs-font-title);
  font-size: 14px;
  font-weight: 700;
  color: var(--rcs-ink);
}

.card-tip {
  margin-left: auto;
  color: var(--rcs-ink-soft);
  font-size: 11px;
  font-weight: 700;
}

.raw-body {
  margin: 0;
  max-height: 300px;
  overflow-y: auto;
  padding: 12px;
  border-top: 1.5px dotted var(--rcs-line);
  background: rgba(255, 255, 255, 0.55);
  color: var(--rcs-ink);
  font-family: var(--rcs-font-mono);
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.raw-body::-webkit-scrollbar {
  width: 6px;
}

.raw-body::-webkit-scrollbar-track {
  background: transparent;
}

.raw-body::-webkit-scrollbar-thumb {
  background: var(--rcs-line-strong);
  border-radius: 3px;
}

.empty-line {
  padding: 16px 12px;
  border-top: 1.5px dotted var(--rcs-line);
  color: var(--rcs-ink-soft);
  font-size: 12px;
  text-align: center;
}

.parsed-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border-top: 1.5px dotted var(--rcs-line);
}

.analysis-block,
.ops-block,
.raw-fallback {
  padding: 10px;
  border: 1.5px dotted var(--rcs-line);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.42);
}

.analysis-block h3,
.ops-block h3 {
  margin: 0 0 7px;
  font-family: var(--rcs-font-title);
  font-size: 13px;
  font-weight: 700;
  color: var(--rcs-ink-soft);
}

.analysis-block p {
  margin: 0;
  color: var(--rcs-ink);
  font-size: 13px;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
}

.op-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.op-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 7px 8px;
  border: 1.5px dotted var(--rcs-line);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
}

.op-pill {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 38px;
  min-height: 22px;
  padding: 1px 8px;
  border: 1.5px dotted var(--rcs-line-strong);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.6);
  font-size: 11px;
  font-weight: 800;
  color: var(--rcs-ink);
}

.op-row[data-op='replace'] .op-pill {
  background: var(--rcs-paper-blue);
  color: var(--rcs-blue);
}

.op-row[data-op='delta'] .op-pill {
  background: var(--rcs-paper-yellow);
  color: var(--rcs-gold);
}

.op-row[data-op='insert'] .op-pill,
.op-row[data-op='add'] .op-pill {
  background: var(--rcs-paper-green);
  color: var(--rcs-sage);
}

.op-row[data-op='remove'] .op-pill {
  background: var(--rcs-paper-pink);
  color: var(--rcs-coral-deep);
}

.op-row[data-op='move'] .op-pill {
  background: var(--rcs-paper-lilac);
  color: #7a6a9c;
}

.op-detail {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 8px;
  min-width: 0;
}

.op-path {
  font-family: var(--rcs-font-mono);
  font-size: 12px;
  font-weight: 700;
  color: var(--rcs-ink);
  word-break: break-word;
}

.op-value {
  padding: 0 6px;
  border-radius: 6px;
  background: rgba(48, 45, 43, 0.06);
  color: var(--rcs-ink-soft);
  font-family: var(--rcs-font-mono);
  font-size: 12px;
  word-break: break-word;
}

.op-row[data-op='delta'] .op-value {
  color: var(--rcs-coral-deep);
  font-weight: 800;
}

.raw-fallback {
  padding: 0;
}

.raw-fallback .raw-body {
  border-top: none;
  background: transparent;
}

.patch-raw {
  margin-top: 4px;
  border-top: none;
  border-radius: 6px;
  background: rgba(48, 45, 43, 0.04);
}

.regex-foot {
  padding: 2px 2px 0;
  color: var(--rcs-ink-soft);
  font-size: 10px;
  line-height: 1.5;
  text-align: center;
  opacity: 0.85;
}

@media (max-width: 640px) {
  .regex-summary {
    flex-wrap: wrap;
    gap: 6px;
    padding: 12px 10px;
  }

  .summary-title {
    flex: 1 1 100%;
    order: 2;
  }

  .summary-badge {
    order: 1;
    margin-left: auto;
  }

  .refresh-button {
    width: 100%;
    margin-left: 0;
  }

  .raw-body {
    max-height: 240px;
    font-size: 11px;
  }
}
</style>
