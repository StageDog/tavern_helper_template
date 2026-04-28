// ═══════════════════════════════════════════════════════════════
// Run Baby Run — 舞台配置 CSS
// ═══════════════════════════════════════════════════════════════

export const STYLE = `<style>
@import url("https://fontsapi.zeoseven.com/324/main/result.css");

:root {
  --rbr-blood: #8B0000;
  --rbr-crimson: #DC143C;
  --rbr-dark: #0a0a0a;
  --rbr-panel: #1a1215;
  --rbr-text: #d4c5c0;
  --rbr-muted: #7a6b66;
  --rbr-border: rgba(139,0,0,0.4);
  --rbr-glow: rgba(220,20,60,0.15);
  --rbr-accent: #c0392b;
}

.rbr-stage-wrapper {
  font-family: "NanoWoodHei Mono", sans-serif;
  max-width: min(620px, 100%);
  margin: 20px auto;
  color: var(--rbr-text);
}

.rbr-card {
  background: var(--rbr-panel);
  border: 1.5px solid var(--rbr-border);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.6);
  padding: 24px;
  animation: rbr-pulse 4s infinite alternate;
}

@keyframes rbr-pulse {
  from { box-shadow: 0 8px 32px rgba(0,0,0,0.6); }
  to { box-shadow: 0 8px 32px rgba(139,0,0,0.3); }
}

.rbr-title {
  text-align: center;
  font-size: 1.6em;
  color: var(--rbr-crimson);
  letter-spacing: 6px;
  margin-bottom: 20px;
  text-shadow: 0 0 20px rgba(220,20,60,0.3);
}

/* ── 标签页 ── */
.rbr-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 16px;
  border-bottom: 2px solid var(--rbr-border);
}

.rbr-tab {
  flex: 1;
  text-align: center;
  padding: 10px 0;
  cursor: pointer;
  color: var(--rbr-muted);
  font-size: 0.95em;
  letter-spacing: 2px;
  transition: all 0.3s;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  user-select: none;
}

.rbr-tab:hover { color: var(--rbr-text); }

.rbr-tab.active {
  color: var(--rbr-crimson);
  border-bottom-color: var(--rbr-crimson);
  text-shadow: 0 0 10px rgba(220,20,60,0.3);
}

.rbr-tab-content { display: none; }
.rbr-tab-content.active { display: block; }

/* ── 通用表单 ── */
.rbr-section { margin-bottom: 16px; }

.rbr-section-title {
  color: var(--rbr-crimson);
  font-weight: bold;
  font-size: 0.95em;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--rbr-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.rbr-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.rbr-label {
  min-width: 80px;
  color: var(--rbr-muted);
  font-size: 0.85em;
  flex-shrink: 0;
}

.rbr-select, .rbr-input, .rbr-textarea {
  flex: 1;
  background: var(--rbr-dark);
  color: var(--rbr-text);
  border: 1px solid var(--rbr-border);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 0.9em;
  font-family: inherit;
  outline: none;
  transition: border-color 0.3s;
}

.rbr-select:focus, .rbr-input:focus, .rbr-textarea:focus {
  border-color: var(--rbr-crimson);
}

.rbr-textarea {
  resize: vertical;
  min-height: 60px;
}

/* ── 区域列表可编辑条目 ── */
.rbr-editable-item {
  background: rgba(139,0,0,0.08);
  border: 1px solid rgba(139,0,0,0.2);
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 8px;
  position: relative;
}

.rbr-editable-item .rbr-item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.rbr-editable-item .rbr-item-name {
  flex: 1;
  background: transparent;
  color: var(--rbr-crimson);
  border: 1px solid transparent;
  border-radius: 4px;
  padding: 4px 8px;
  font-weight: bold;
  font-size: 0.9em;
  font-family: inherit;
  outline: none;
  transition: border-color 0.3s;
}
.rbr-editable-item .rbr-item-name:focus { border-color: var(--rbr-crimson); }

.rbr-editable-item .rbr-item-desc {
  width: 100%;
  background: transparent;
  color: var(--rbr-muted);
  border: 1px solid transparent;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 0.85em;
  font-family: inherit;
  outline: none;
  resize: none;
  min-height: 36px;
  transition: border-color 0.3s;
}
.rbr-editable-item .rbr-item-desc:focus { border-color: var(--rbr-border); }

.rbr-item-remove {
  background: none;
  border: none;
  color: var(--rbr-muted);
  cursor: pointer;
  font-size: 1.1em;
  padding: 2px 6px;
  border-radius: 4px;
  transition: color 0.2s;
}
.rbr-item-remove:hover { color: var(--rbr-crimson); }

.rbr-area-tags {
  display: flex;
  gap: 6px;
  margin-top: 4px;
  flex-wrap: wrap;
}

.rbr-tag {
  font-size: 0.75em;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(139,0,0,0.15);
  color: var(--rbr-muted);
}

.rbr-tag.danger { background: rgba(220,20,60,0.2); color: var(--rbr-crimson); }

/* ── 添加/随机按钮行 ── */
.rbr-action-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.rbr-btn-sm {
  padding: 5px 12px;
  border: 1px solid var(--rbr-border);
  border-radius: 6px;
  background: transparent;
  color: var(--rbr-muted);
  font-family: inherit;
  font-size: 0.8em;
  cursor: pointer;
  transition: all 0.2s;
}
.rbr-btn-sm:hover {
  border-color: var(--rbr-crimson);
  color: var(--rbr-crimson);
}

/* ── 主按钮行 ── */
.rbr-btn-row {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  justify-content: center;
}

.rbr-btn {
  padding: 10px 28px;
  border: 1.5px solid var(--rbr-crimson);
  border-radius: 8px;
  background: transparent;
  color: var(--rbr-crimson);
  font-family: inherit;
  font-size: 1em;
  cursor: pointer;
  transition: all 0.3s;
  letter-spacing: 2px;
}

.rbr-btn:hover {
  background: var(--rbr-crimson);
  color: #fff;
  box-shadow: 0 0 20px rgba(220,20,60,0.4);
}

.rbr-btn.primary {
  background: var(--rbr-crimson);
  color: #fff;
}
.rbr-btn.primary:hover {
  background: var(--rbr-blood);
  box-shadow: 0 0 30px rgba(220,20,60,0.6);
}

.rbr-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.rbr-hint {
  text-align: center;
  color: var(--rbr-muted);
  font-size: 0.8em;
  margin-top: 12px;
  font-style: italic;
}

.rbr-divider {
  border: none;
  border-top: 1px solid var(--rbr-border);
  margin: 16px 0;
}

.rbr-done-msg {
  text-align: center;
  color: var(--rbr-crimson);
  font-size: 1.1em;
  padding: 20px;
  letter-spacing: 3px;
}

/* ── 角色面板 ── */
.rbr-char-card {
  background: rgba(139,0,0,0.05);
  border: 1px solid var(--rbr-border);
  border-radius: 10px;
  margin-bottom: 12px;
  overflow: hidden;
}

.rbr-char-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  cursor: pointer;
  background: rgba(139,0,0,0.1);
  transition: background 0.2s;
  user-select: none;
}
.rbr-char-header:hover { background: rgba(139,0,0,0.18); }

.rbr-char-header .rbr-char-name-display {
  color: var(--rbr-crimson);
  font-weight: bold;
  font-size: 0.95em;
}

.rbr-char-header .rbr-char-toggle {
  color: var(--rbr-muted);
  font-size: 0.8em;
  transition: transform 0.3s;
}
.rbr-char-header .rbr-char-toggle.open { transform: rotate(90deg); }

.rbr-char-body {
  padding: 12px 14px;
  display: none;
}
.rbr-char-body.open { display: block; }

.rbr-char-field-group {
  margin-bottom: 10px;
}

.rbr-field-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.rbr-field-row .rbr-label { min-width: 70px; }

.rbr-field-row .rbr-input,
.rbr-field-row .rbr-textarea,
.rbr-field-row .rbr-select {
  flex: 1;
}

.rbr-field-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.rbr-icon-btn {
  background: none;
  border: 1px solid transparent;
  color: var(--rbr-muted);
  cursor: pointer;
  font-size: 0.9em;
  padding: 3px 6px;
  border-radius: 4px;
  transition: all 0.2s;
}
.rbr-icon-btn:hover { color: var(--rbr-crimson); border-color: var(--rbr-border); }
.rbr-icon-btn.locked { color: var(--rbr-crimson); }
.rbr-icon-btn:disabled { opacity: 0.3; cursor: not-allowed; }

.rbr-char-remove-btn {
  display: block;
  width: 100%;
  padding: 6px;
  margin-top: 8px;
  background: transparent;
  border: 1px dashed var(--rbr-border);
  border-radius: 6px;
  color: var(--rbr-muted);
  font-family: inherit;
  font-size: 0.8em;
  cursor: pointer;
  transition: all 0.2s;
}
.rbr-char-remove-btn:hover { color: var(--rbr-crimson); border-color: var(--rbr-crimson); }

.rbr-areas-list, .rbr-escapes-list {
  max-height: 250px;
  overflow-y: auto;
  padding: 4px;
}
</style>`;
