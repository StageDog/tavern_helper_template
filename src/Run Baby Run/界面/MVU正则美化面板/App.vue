<template>
  <details class="shell" :open="shellOpen" @toggle="syncShellOpen">
    <summary class="shell-summary">
      <span class="header-accent"></span>
      <span class="shell-title">★ MVU REGEX PREVIEW ★</span>
      <span class="shell-badge" :class="{ 'shell-badge--live': isGenerating }">{{ statusLabel }}</span>
      <span class="header-accent header-accent--right"></span>
    </summary>

    <div class="mvu-panel">
      <section class="meta-bar">
        <span class="meta-chip">楼层 #{{ currentMessageId }}</span>
        <button class="refresh-btn" @click="refreshMessage">刷新</button>
      </section>

      <section class="main-content">
        <article class="preview-card" :class="{ 'preview-card--loading': pendingVariableUpdate !== null }">
          <details :open="pendingVariableUpdate !== null">
            <summary>
              <span class="summary-dot">◆</span>
              <span class="summary-title">变量更新 - 正在更新</span>
              <span class="summary-tip">{{ pendingVariableUpdate ? '点击查看 ▼' : '未检测到标签' }}</span>
            </summary>
            <pre class="preview-body">{{ pendingVariableUpdate ?? '当前消息中未检测到未闭合 <update>/<variable> 标签。' }}</pre>
          </details>
        </article>

        <article class="preview-card" :class="{ 'preview-card--done': finishedVariableUpdate !== null }">
          <details :open="finishedVariableUpdate !== null">
            <summary>
              <span class="summary-dot">◆</span>
              <span class="summary-title">变量更新 - 完整更新</span>
              <span class="summary-tip">{{ finishedVariableUpdate ? '点击隐藏 ▲' : '未检测到标签' }}</span>
            </summary>
            <pre class="preview-body">{{ finishedVariableUpdate ?? '当前消息中未检测到完整 <update>/<variable>...</> 区块。' }}</pre>
          </details>
        </article>
      </section>

      <!-- <footer class="hint-bar">
        <span>展示逻辑对齐 `AA提示词模板及其它变量/MVU更新正则` 的 [美化] 前缀规则。</span>
      </footer> -->
    </div>
  </details>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

type ParsedBlocks = {
  pendingVariableUpdate: string | null;
  finishedVariableUpdate: string | null;
};

const currentMessageId = ref<number>(-1);
const messageText = ref('');
const shellOpen = ref(false);

const pendingVariableRegex = /<(update(?:variable)?)>(?!.*<\/\1>)\s*((?:(?!<\1>).)*)\s*$/is;
const finishedVariableRegex = /<(update(?:variable)?)>\s*((?:(?!<\1>).)*)\s*<\/\1>/is;

function parseBlocks(text: string): ParsedBlocks {
  const pendingVariable = text.match(pendingVariableRegex);
  const finishedVariable = text.match(finishedVariableRegex);

  return {
    pendingVariableUpdate: pendingVariable?.[2]?.trim() || null,
    finishedVariableUpdate: finishedVariable?.[2]?.trim() || null,
  };
}

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

const parsed = computed(() => parseBlocks(messageText.value));
const pendingVariableUpdate = computed(() => parsed.value.pendingVariableUpdate);
const finishedVariableUpdate = computed(() => parsed.value.finishedVariableUpdate);
const isGenerating = computed(() => pendingVariableUpdate.value !== null);

const statusLabel = computed(() => {
  if (pendingVariableUpdate.value) return '生成中';
  if (finishedVariableUpdate.value) return '已完成';
  return '无更新';
});

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
.shell {
  width: 100%;
  border: var(--rbr-border);
  background: var(--rbr-paper);
  box-shadow: 0 0 0 2px rgba(49, 44, 44, 0.06) inset;
}

.shell-summary {
  list-style: none;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px 12px;
  background: var(--rbr-black);
  border-bottom: var(--rbr-border-red);
}

.shell-summary::-webkit-details-marker {
  display: none;
}

.header-accent {
  width: 18px;
  height: 18px;
  background: var(--rbr-red);
  transform: rotate(45deg) skewX(-6deg);
  flex-shrink: 0;
}

.header-accent--right {
  transform: rotate(45deg) skewX(6deg);
}

.shell-title {
  flex: 1;
  text-align: center;
  color: var(--rbr-red);
  font-size: 14px;
  letter-spacing: 4px;
  text-transform: uppercase;
}

.shell-badge {
  font-size: 10px;
  letter-spacing: 1px;
  color: var(--rbr-paper-dark);
  border: 2px solid rgba(230, 213, 184, 0.5);
  padding: 2px 8px;
  text-transform: uppercase;
}

.shell-badge--live {
  color: #fff;
  background: var(--rbr-red);
  border-color: var(--rbr-red-dark);
}

.mvu-panel {
  width: 100%;
  background:
    linear-gradient(135deg, rgba(242, 232, 213, 0.95), rgba(230, 213, 184, 0.94)),
    var(--rbr-paper);
  overflow: hidden;
  position: relative;
}

.mvu-panel::before {
  content: '';
  position: absolute;
  inset: 8px;
  border: 1px dashed rgba(49, 44, 44, 0.25);
  pointer-events: none;
}

.meta-bar {
  padding: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: var(--rbr-border);
  background: var(--rbr-paper-dark);
}

.meta-chip {
  border: 2px solid var(--rbr-black);
  background: var(--rbr-paper);
  color: var(--rbr-black);
  font-size: 10px;
  letter-spacing: 1px;
  padding: 4px 8px;
  text-transform: uppercase;
}

.refresh-btn {
  margin-left: auto;
  border: 2px solid var(--rbr-black);
  background: var(--rbr-black);
  color: var(--rbr-paper);
  font-size: 10px;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 4px 10px;
  cursor: pointer;
}

.refresh-btn:hover {
  background: var(--rbr-red);
  border-color: var(--rbr-red-dark);
}

.main-content {
  padding: 8px;
  display: grid;
  gap: 8px;
}

.preview-card {
  border: var(--rbr-border);
  background: var(--rbr-black);
  overflow: hidden;
}

.preview-card summary {
  list-style: none;
  padding: 10px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(90deg, rgba(182, 47, 47, 0.24), rgba(49, 44, 44, 0.88));
}

.preview-card summary::-webkit-details-marker {
  display: none;
}

.summary-dot {
  color: var(--rbr-red);
  font-size: 11px;
}

.summary-title {
  font-size: 11px;
  letter-spacing: 1px;
  color: var(--rbr-paper);
  text-transform: uppercase;
}

.summary-tip {
  margin-left: auto;
  font-size: 10px;
  color: var(--rbr-paper-dark);
}

.preview-body {
  max-height: 280px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
  padding: 12px;
  line-height: 1.6;
  font-size: 12px;
  color: var(--rbr-paper-dark);
  background:
    linear-gradient(180deg, rgba(35, 31, 31, 0.96), rgba(49, 44, 44, 0.96));
  border-top: 2px solid rgba(182, 47, 47, 0.38);
}

.preview-body::-webkit-scrollbar {
  width: 6px;
}

.preview-body::-webkit-scrollbar-track {
  background: var(--rbr-black);
}

.preview-body::-webkit-scrollbar-thumb {
  background: var(--rbr-red-dark);
  border-radius: 2px;
}

.preview-card--loading {
  box-shadow: inset 0 0 0 2px rgba(182, 47, 47, 0.42);
}

.preview-card--done {
  box-shadow: inset 0 0 0 2px rgba(230, 213, 184, 0.18);
}

.hint-bar {
  border-top: var(--rbr-border-red);
  background: var(--rbr-black);
  color: var(--rbr-paper-dark);
  font-size: 10px;
  letter-spacing: 1px;
  padding: 6px 10px;
}

@media (max-width: 640px) {
  .shell-summary {
    padding: 7px 8px;
    gap: 6px;
  }

  .shell-title {
    font-size: 12px;
    letter-spacing: 2px;
    text-align: left;
  }

  .shell-badge {
    display: none;
  }

  .header-accent {
    width: 14px;
    height: 14px;
  }

  .meta-bar {
    flex-wrap: wrap;
    align-items: center;
  }

  .refresh-btn {
    margin-left: 0;
    width: 100%;
  }

  .preview-card summary {
    flex-wrap: wrap;
    align-items: flex-start;
  }

  .summary-tip {
    margin-left: 0;
    width: 100%;
  }

  .preview-body {
    max-height: 220px;
    font-size: 11px;
    padding: 10px;
  }
}
</style>
