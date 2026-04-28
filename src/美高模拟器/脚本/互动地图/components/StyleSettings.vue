<script setup lang="ts">
import { useMapStore, SAMPLE_CSS } from '../store';

const store = useMapStore();

// 编辑区内容（独立于 store.customCSS，避免每次按键都写入脚本变量）
const draftCSS = ref(store.customCSS);
const saveName = ref('');
const renamingIndex = ref<number>(-1);
const renameBuffer = ref('');
const statusMsg = ref('');

/** 保存当前编辑内容到 customCSS */
function applyDraft() {
  store.setCustomCSS(draftCSS.value);
  statusMsg.value = '✓ 已应用样式';
  setTimeout(() => (statusMsg.value = ''), 1500);
}

/** 重置编辑内容为 store 中的版本 */
function revertDraft() {
  draftCSS.value = store.customCSS;
}

/** 清空所有自定义样式 */
function clearCSS() {
  draftCSS.value = '';
  store.setCustomCSS('');
  statusMsg.value = '✓ 已清空样式';
  setTimeout(() => (statusMsg.value = ''), 1500);
}

/** 插入示例 CSS */
function insertSample() {
  draftCSS.value = SAMPLE_CSS;
}

function savePreset() {
  if (!saveName.value.trim()) return;
  // 先应用再保存，避免遗留未保存编辑
  store.setCustomCSS(draftCSS.value);
  store.savePreset(saveName.value);
  saveName.value = '';
  statusMsg.value = '✓ 已保存为新预设';
  setTimeout(() => (statusMsg.value = ''), 1500);
}

function applyPreset(i: number) {
  store.applyPreset(i);
  draftCSS.value = store.customCSS;
  statusMsg.value = '✓ 已切换到预设';
  setTimeout(() => (statusMsg.value = ''), 1500);
}

function overwritePreset(i: number) {
  store.setCustomCSS(draftCSS.value);
  store.overwritePreset(i);
  statusMsg.value = '✓ 已覆盖预设';
  setTimeout(() => (statusMsg.value = ''), 1500);
}

function startRename(i: number) {
  renamingIndex.value = i;
  renameBuffer.value = store.cssPresets[i].name;
}

function confirmRename() {
  if (renamingIndex.value < 0) return;
  store.renamePreset(renamingIndex.value, renameBuffer.value);
  renamingIndex.value = -1;
  renameBuffer.value = '';
}

function cancelRename() {
  renamingIndex.value = -1;
  renameBuffer.value = '';
}

function removePreset(i: number) {
  if (!confirm(`确定删除预设「${store.cssPresets[i].name}」？`)) return;
  store.removePreset(i);
}

/** 切换"是否直接发送"出行指令 */
function toggleSendMode() {
  store.setShouldSendDirectly(!store.shouldSendDirectly);
}

// 切换视图时若 store.customCSS 变化（例如其它组件改动），同步到 draft
watch(
  () => store.customCSS,
  val => {
    if (val !== draftCSS.value) draftCSS.value = val;
  },
);

const isDirty = computed(() => draftCSS.value !== store.customCSS);
</script>

<template>
  <div class="imap-style-settings">
    <h3 class="imap-ss-title">⚙️ 脚本设置</h3>
    <p class="imap-ss-hint">
      出行指令发送方式、自定义 CSS 均在此调整。CSS 只作用于地图面板，不影响酒馆主界面。
    </p>

    <!-- 出行指令 -->
    <div class="imap-ss-section imap-ss-section-first">
      <div class="imap-ss-section-title">
        <span>🚀 出行指令</span>
      </div>
      <div class="imap-ss-toggle-card" @click="toggleSendMode">
        <div class="imap-ss-toggle-info">
          <div class="imap-ss-toggle-name">直接发送模式</div>
          <div class="imap-ss-toggle-hint">
            {{ store.shouldSendDirectly
              ? '✅ 开启中 —— 选定目的地后立即 /send 并触发生成'
              : '📝 已关闭 —— 出行指令会填入输入框，由你手动检查后发送' }}
          </div>
        </div>
        <div class="imap-ss-switch" :class="{ on: store.shouldSendDirectly }">
          <div class="imap-ss-switch-dot"></div>
        </div>
      </div>
    </div>

    <!-- 预设列表 -->
    <div class="imap-ss-section">
      <div class="imap-ss-section-title">
        <span>📁 预设</span>
        <span class="imap-ss-section-meta">{{ store.cssPresets.length }} 个</span>
      </div>

      <div v-if="store.cssPresets.length === 0" class="imap-ss-empty">
        暂无预设。修改下方 CSS 后可保存为新预设。
      </div>

      <div v-else class="imap-ss-preset-list">
        <div
v-for="(p, i) in store.cssPresets" :key="i" class="imap-ss-preset"
          :class="{ active: i === store.activePresetIndex }">
          <div class="imap-ss-preset-main">
            <template v-if="renamingIndex === i">
              <input
v-model="renameBuffer" class="imap-ss-input imap-ss-input-inline"
                @keyup.enter="confirmRename" @keyup.esc="cancelRename" />
              <button class="imap-ss-btn imap-ss-btn-sm" @click="confirmRename">✓</button>
              <button class="imap-ss-btn imap-ss-btn-sm imap-ss-btn-ghost" @click="cancelRename">✕</button>
            </template>
            <template v-else>
              <span class="imap-ss-preset-name">{{ p.name }}</span>
              <span v-if="i === store.activePresetIndex" class="imap-ss-badge">当前</span>
            </template>
          </div>
          <div v-if="renamingIndex !== i" class="imap-ss-preset-actions">
            <button
v-if="i !== store.activePresetIndex" class="imap-ss-btn imap-ss-btn-sm"
              title="应用这个预设" @click="applyPreset(i)">
              使用
            </button>
            <button
class="imap-ss-btn imap-ss-btn-sm imap-ss-btn-ghost" title="用当前编辑内容覆盖此预设"
              @click="overwritePreset(i)">
              覆盖
            </button>
            <button class="imap-ss-btn imap-ss-btn-sm imap-ss-btn-ghost" title="重命名" @click="startRename(i)">
              改名
            </button>
            <button class="imap-ss-btn imap-ss-btn-sm imap-ss-btn-danger" title="删除" @click="removePreset(i)">
              删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- CSS 编辑器 -->
    <div class="imap-ss-section">
      <div class="imap-ss-section-title">
        <span>✏️ CSS 编辑</span>
        <span v-if="isDirty" class="imap-ss-section-meta imap-ss-dirty">未应用</span>
      </div>

      <textarea
v-model="draftCSS" class="imap-ss-textarea" spellcheck="false"
        placeholder="在此输入 CSS（留空表示不使用自定义样式）"></textarea>

      <div class="imap-ss-actions-row">
        <button class="imap-ss-btn imap-ss-btn-primary" :disabled="!isDirty" @click="applyDraft">
          应用
        </button>
        <button class="imap-ss-btn" :disabled="!isDirty" @click="revertDraft">
          撤销
        </button>
        <button class="imap-ss-btn imap-ss-btn-ghost" @click="insertSample">
          插入示例
        </button>
        <button class="imap-ss-btn imap-ss-btn-ghost imap-ss-btn-danger" @click="clearCSS">
          清空
        </button>
      </div>

      <!-- 保存为预设 -->
      <div class="imap-ss-save-row">
        <input
v-model="saveName" class="imap-ss-input" placeholder="预设名称"
          @keyup.enter="savePreset" />
        <button class="imap-ss-btn imap-ss-btn-primary" :disabled="!saveName.trim()" @click="savePreset">
          💾 保存为新预设
        </button>
      </div>

      <div v-if="statusMsg" class="imap-ss-status">{{ statusMsg }}</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.imap-style-settings {
  padding: 16px;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-sizing: border-box;
}

.imap-ss-title {
  margin: 0;
  font-size: 16px;
  color: #fff;
  font-weight: 600;
}

.imap-ss-hint {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  line-height: 1.5;
}

.imap-ss-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 12px;
}

.imap-ss-section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.65);
  font-weight: 500;
}

.imap-ss-section-meta {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
}

.imap-ss-dirty {
  color: #f39c12;
}

.imap-ss-empty {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 6px;
}

.imap-ss-preset-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.imap-ss-preset {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;

  &.active {
    border-color: rgba(179, 139, 89, 0.35);
    background: rgba(179, 139, 89, 0.08);
  }
}

.imap-ss-preset-main {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.imap-ss-preset-name {
  font-size: 13px;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.imap-ss-badge {
  font-size: 10px;
  color: #b38b59;
  padding: 1px 6px;
  background: rgba(179, 139, 89, 0.15);
  border-radius: 8px;
  flex-shrink: 0;
}

.imap-ss-preset-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.imap-ss-textarea {
  width: 100%;
  min-height: 180px;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  color: #dce5ed;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 12px;
  line-height: 1.55;
  resize: vertical;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: rgba(179, 139, 89, 0.5);
  }
}

.imap-ss-actions-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.imap-ss-save-row {
  display: flex;
  gap: 6px;
  align-items: center;
  padding-top: 8px;
  border-top: 1px dashed rgba(255, 255, 255, 0.06);
}

.imap-ss-input {
  flex: 1;
  padding: 7px 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #fff;
  font-size: 13px;
  outline: none;
  box-sizing: border-box;
  min-width: 0;

  &:focus {
    border-color: rgba(179, 139, 89, 0.5);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.25);
  }
}

.imap-ss-input-inline {
  flex: 1;
  padding: 4px 8px;
  font-size: 12px;
}

.imap-ss-status {
  font-size: 12px;
  color: #5cb85c;
  padding: 4px 2px;
}

.imap-ss-btn {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.75);
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
}

.imap-ss-btn-sm {
  padding: 3px 8px;
  font-size: 11px;
}

.imap-ss-btn-primary {
  background: linear-gradient(135deg, #b38b59, #9a7548);
  color: #fff;
  border: none;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #c99e68, #b38b59);
  }
}

.imap-ss-btn-ghost {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.4);

  &:hover:not(:disabled) {
    color: rgba(255, 255, 255, 0.8);
    background: rgba(255, 255, 255, 0.06);
  }
}

.imap-ss-btn-danger {
  color: #e57373;

  &:hover:not(:disabled) {
    background: rgba(229, 115, 115, 0.1) !important;
    color: #ff8a8a;
  }
}

// ── 出行指令 toggle 卡片 ─────────────────────────────
.imap-ss-toggle-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(179, 139, 89, 0.25);
  }
}

.imap-ss-toggle-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.imap-ss-toggle-name {
  font-size: 13px;
  color: #fff;
  font-weight: 500;
}

.imap-ss-toggle-hint {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.45;
}

.imap-ss-switch {
  flex-shrink: 0;
  width: 38px;
  height: 22px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 11px;
  position: relative;
  transition: background 0.2s;

  &.on {
    background: linear-gradient(135deg, #b38b59, #9a7548);
  }
}

.imap-ss-switch-dot {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);

  .imap-ss-switch.on & {
    transform: translateX(16px);
  }
}
</style>
