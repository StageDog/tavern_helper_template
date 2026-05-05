// ═══════════════════════════════════════════════════════════════
// Run Baby Run — 舞台配置 CSS
// ═══════════════════════════════════════════════════════════════

export const STYLE = `<style>
@import url("https://fontsapi.zeoseven.com/324/main/result.css");

:root {
  /* 与状态栏一致的构成主义三色 */
  --rbr-red: #b62f2f;
  --rbr-red-dark: #7f1616;
  --rbr-black: #312c2c;
  --rbr-paper: #f2e8d5;
  --rbr-paper-dark: #e6d5b8;
  --rbr-ink: #1f1b1b;
  --rbr-border: 3px solid var(--rbr-black);
  --rbr-border-red: 3px solid var(--rbr-red);
  --rbr-shadow: 8px 8px 0 var(--rbr-black);
  --rbr-font: "Arial Black", "Helvetica Neue", sans-serif;
}

.rbr-stage-wrapper {
  font-family: var(--rbr-font);
  max-width: min(620px, 100%);
  margin: 14px auto;
  color: var(--rbr-ink);
  position: relative;
}

.rbr-stage-wrapper::before {
  content: "";
  position: absolute;
  left: -8px;
  top: 10px;
  width: 60px;
  height: 14px;
  background: var(--rbr-red);
  transform: rotate(-6deg);
  z-index: 1;
}

.rbr-stage-wrapper::after {
  content: "";
  position: absolute;
  right: -14px;
  top: 50px;
  width: 92px;
  height: 12px;
  background: var(--rbr-black);
  transform: rotate(3deg);
  z-index: 1;
}

.rbr-card {
  background: linear-gradient(145deg, var(--rbr-paper) 0%, var(--rbr-paper-dark) 100%);
  border: var(--rbr-border);
  box-shadow: var(--rbr-shadow);
  padding: 20px 18px 16px;
  position: relative;
  overflow: hidden;
}

.rbr-card::before {
  content: "";
  position: absolute;
  right: -70px;
  top: -24px;
  width: 180px;
  height: 48px;
  background: var(--rbr-red);
  transform: rotate(-12deg);
  opacity: 0.18;
  pointer-events: none;
}

.rbr-card::after {
  content: "";
  position: absolute;
  left: -65px;
  bottom: -34px;
  width: 160px;
  height: 44px;
  background: var(--rbr-black);
  transform: rotate(12deg);
  opacity: 0.14;
  pointer-events: none;
}

.rbr-title {
  text-align: center;
  font-size: 1.46em;
  color: var(--rbr-paper);
  letter-spacing: 3px;
  margin-bottom: 16px;
  background: var(--rbr-black);
  border: var(--rbr-border-red);
  padding: 10px 12px;
  text-transform: uppercase;
  transform: skewX(-3deg);
}

/* ── 标签页 ── */
.rbr-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 12px;
  border: var(--rbr-border);
  background: var(--rbr-paper-dark);
  transform: skewX(-3deg);
}

.rbr-tab {
  flex: 1;
  text-align: center;
  padding: 8px 0;
  cursor: pointer;
  color: var(--rbr-black);
  font-size: 0.88em;
  letter-spacing: 1px;
  transition: all 0.2s;
  border-right: 2px solid var(--rbr-black);
  background: var(--rbr-paper-dark);
  user-select: none;
  text-transform: uppercase;
  font-weight: 900;
  transform: skewX(3deg);
}
.rbr-tab:last-child { border-right: none; }

.rbr-tab:hover {
  background: var(--rbr-red);
  color: var(--rbr-paper);
}

.rbr-tab.active {
  color: var(--rbr-paper);
  background: var(--rbr-black);
}

.rbr-tab-content { display: none; }
.rbr-tab-content.active { display: block; }

/* ── 通用表单 ── */
.rbr-section {
  margin-bottom: 12px;
  border: 2px solid var(--rbr-black);
  padding: 8px 10px 10px;
  background: rgba(242, 232, 213, 0.9);
}

.rbr-section-title {
  color: var(--rbr-paper);
  font-weight: 900;
  font-size: 0.86em;
  margin-bottom: 8px;
  padding: 5px 8px;
  background: var(--rbr-black);
  border-left: 8px solid var(--rbr-red);
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.rbr-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 7px;
}

.rbr-row-top { align-items: flex-start; }

.rbr-row-grow {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  flex: 1;
}

.rbr-label {
  min-width: 76px;
  color: var(--rbr-black);
  font-size: 0.76em;
  flex-shrink: 0;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.rbr-select, .rbr-input, .rbr-textarea {
  flex: 1;
  background: var(--rbr-paper);
  color: var(--rbr-black);
  border: 2px solid var(--rbr-black);
  border-radius: 0;
  padding: 7px 8px;
  font-size: 0.84em;
  font-family: inherit;
  outline: none;
  transition: all 0.18s;
  line-height: 1.35;
}

.rbr-select:focus, .rbr-input:focus, .rbr-textarea:focus {
  border-color: var(--rbr-red);
  background: #f6efdf;
  box-shadow: 0 0 0 2px rgba(182, 47, 47, 0.14);
}

.rbr-textarea {
  resize: both;
  min-height: 56px;
  overflow: auto;
}

.rbr-inline-btns {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.rbr-mode-btn {
  border: 2px solid var(--rbr-black);
  background: var(--rbr-paper-dark);
  color: var(--rbr-black);
  font-family: inherit;
  font-size: 0.72em;
  font-weight: 900;
  text-transform: uppercase;
  padding: 5px 8px;
  cursor: pointer;
  transition: all 0.2s;
  transform: skewX(-3deg);
}

.rbr-mode-btn:hover {
  background: var(--rbr-red);
  color: var(--rbr-paper);
}

.rbr-mode-btn.active {
  background: var(--rbr-black);
  color: var(--rbr-paper);
  border-color: var(--rbr-red);
}

/* ── 区域列表可编辑条目 ── */
.rbr-editable-item {
  background: var(--rbr-paper-dark);
  border: 2px solid var(--rbr-black);
  border-radius: 0;
  padding: 8px 8px 7px;
  margin-bottom: 7px;
  position: relative;
}

.rbr-editable-item .rbr-item-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 5px;
}

.rbr-editable-item .rbr-item-name {
  flex: 1;
  background: var(--rbr-paper);
  color: var(--rbr-black);
  border: 2px solid var(--rbr-black);
  border-radius: 0;
  padding: 4px 6px;
  font-weight: 900;
  font-size: 0.82em;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}
.rbr-editable-item .rbr-item-name:focus { border-color: var(--rbr-red); }

.rbr-editable-item .rbr-item-desc {
  width: 100%;
  background: var(--rbr-paper);
  color: var(--rbr-ink);
  border: 2px solid var(--rbr-black);
  border-radius: 0;
  padding: 4px 6px;
  font-size: 0.78em;
  font-family: inherit;
  outline: none;
  resize: both;
  overflow: auto;
  min-height: 34px;
  transition: border-color 0.2s;
}
.rbr-editable-item .rbr-item-desc:focus { border-color: var(--rbr-red); }

.rbr-item-remove {
  background: var(--rbr-black);
  border: 2px solid var(--rbr-black);
  color: var(--rbr-paper);
  cursor: pointer;
  font-size: 0.9em;
  padding: 1px 7px;
  border-radius: 0;
  transition: color 0.2s;
  font-weight: 900;
}
.rbr-item-remove:hover {
  background: var(--rbr-red);
  color: var(--rbr-paper);
  border-color: var(--rbr-red-dark);
}

/* ── 区域元数据行（可通行 + 危险等级） ── */
.rbr-area-meta-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 6px;
  flex-wrap: wrap;
}

.rbr-area-meta-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.74em;
  color: var(--rbr-black);
  cursor: pointer;
  user-select: none;
  font-weight: 900;
}

.rbr-area-meta-label input[type="checkbox"] {
  accent-color: var(--rbr-red);
  width: 14px;
  height: 14px;
  cursor: pointer;
}

.rbr-item-danger {
  background: var(--rbr-paper);
  color: var(--rbr-black);
  border: 2px solid var(--rbr-black);
  border-radius: 0;
  padding: 2px 6px;
  font-size: 0.74em;
  font-family: inherit;
  outline: none;
  cursor: pointer;
}
.rbr-item-danger:focus { border-color: var(--rbr-red); }

.rbr-area-tags {
  display: flex;
  gap: 6px;
  margin-top: 4px;
  flex-wrap: wrap;
}

.rbr-tag {
  font-size: 0.72em;
  padding: 2px 8px;
  border-radius: 0;
  background: rgba(49, 44, 44, 0.11);
  color: var(--rbr-black);
  border: 1px solid rgba(49, 44, 44, 0.2);
}

.rbr-tag.danger { background: rgba(182, 47, 47, 0.16); color: var(--rbr-red-dark); }

/* ── 添加/随机按钮行 ── */
.rbr-action-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.rbr-btn-sm {
  padding: 4px 9px;
  border: 2px solid var(--rbr-black);
  border-radius: 0;
  background: var(--rbr-paper-dark);
  color: var(--rbr-black);
  font-family: inherit;
  font-size: 0.72em;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
}
.rbr-btn-sm:hover {
  border-color: var(--rbr-red);
  background: var(--rbr-red);
  color: var(--rbr-paper);
}

.rbr-btn-null {
  min-width: 74px;
  background: var(--rbr-black);
  color: var(--rbr-paper);
}
.rbr-btn-null:hover {
  background: var(--rbr-red);
}

/* ── 主按钮行 ── */
.rbr-btn-row {
  display: flex;
  gap: 8px;
  margin-top: 14px;
  justify-content: center;
}

.rbr-btn {
  padding: 8px 22px;
  border: var(--rbr-border);
  border-radius: 0;
  background: var(--rbr-paper-dark);
  color: var(--rbr-black);
  font-family: inherit;
  font-size: 0.86em;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: 2px;
  text-transform: uppercase;
  transform: skewX(-4deg);
}

.rbr-btn:hover {
  background: var(--rbr-red);
  color: var(--rbr-paper);
  border-color: var(--rbr-red-dark);
}

.rbr-btn.primary {
  background: var(--rbr-red);
  color: var(--rbr-paper);
  border-color: var(--rbr-red-dark);
}
.rbr-btn.primary:hover {
  background: var(--rbr-black);
  color: var(--rbr-paper);
}

.rbr-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.rbr-hint {
  text-align: center;
  color: var(--rbr-black);
  font-size: 0.72em;
  margin-top: 9px;
  font-weight: 900;
  letter-spacing: 0.3px;
}

.rbr-divider {
  border: none;
  border-top: 3px solid var(--rbr-black);
  margin: 11px 0;
}

.rbr-done-msg {
  text-align: center;
  color: var(--rbr-paper);
  background: var(--rbr-black);
  border: var(--rbr-border-red);
  font-size: 0.98em;
  padding: 14px;
  letter-spacing: 1px;
  text-transform: uppercase;
  transform: skewX(-3deg);
}

/* ── 角色面板 ── */
.rbr-char-card {
  background: var(--rbr-paper-dark);
  border: 2px solid var(--rbr-black);
  border-radius: 0;
  margin-bottom: 10px;
  overflow: hidden;
  transform: skewX(-1.5deg);
}

.rbr-char-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 9px;
  cursor: pointer;
  background: var(--rbr-black);
  transition: background 0.2s;
  user-select: none;
}
.rbr-char-header:hover { background: var(--rbr-red-dark); }

.rbr-char-header .rbr-char-name-display {
  color: var(--rbr-paper);
  font-weight: 900;
  font-size: 0.83em;
  transform: skewX(1.5deg);
}

.rbr-char-header .rbr-char-toggle {
  color: var(--rbr-paper);
  font-size: 0.74em;
  transition: transform 0.3s;
  transform: skewX(1.5deg);
}
.rbr-char-header .rbr-char-toggle.open { transform: rotate(90deg); }

.rbr-char-body {
  padding: 8px 8px 6px;
  display: none;
  transform: skewX(1.5deg);
}
.rbr-char-body.open { display: block; }

.rbr-char-field-group {
  margin-bottom: 10px;
}

.rbr-field-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 5px;
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
  background: var(--rbr-black);
  border: 2px solid var(--rbr-black);
  color: var(--rbr-paper);
  cursor: pointer;
  font-size: 0.72em;
  padding: 3px 6px;
  border-radius: 0;
  transition: all 0.2s;
  font-weight: 900;
  text-transform: uppercase;
}
.rbr-icon-btn:hover { background: var(--rbr-red); border-color: var(--rbr-red-dark); }
.rbr-icon-btn.locked { background: var(--rbr-red-dark); border-color: var(--rbr-red-dark); }
.rbr-icon-btn:disabled { opacity: 0.3; cursor: not-allowed; }

.rbr-char-remove-btn {
  display: block;
  width: 100%;
  padding: 6px;
  margin-top: 7px;
  background: var(--rbr-paper);
  border: 2px dashed var(--rbr-black);
  border-radius: 0;
  color: var(--rbr-black);
  font-family: inherit;
  font-size: 0.73em;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
}
.rbr-char-remove-btn:hover {
  color: var(--rbr-paper);
  border-color: var(--rbr-red-dark);
  background: var(--rbr-red);
}

.rbr-areas-list, .rbr-escapes-list {
  max-height: 250px;
  overflow-y: auto;
  padding: 3px;
}

.rbr-areas-list::-webkit-scrollbar,
.rbr-escapes-list::-webkit-scrollbar {
  width: 5px;
}

.rbr-areas-list::-webkit-scrollbar-track,
.rbr-escapes-list::-webkit-scrollbar-track {
  background: var(--rbr-paper-dark);
}

.rbr-areas-list::-webkit-scrollbar-thumb,
.rbr-escapes-list::-webkit-scrollbar-thumb {
  background: var(--rbr-red);
}

@media (max-width: 560px) {
  .rbr-stage-wrapper { margin: 8px auto; }
  .rbr-card { padding: 14px 10px 10px; box-shadow: 5px 5px 0 var(--rbr-black); }
  .rbr-row { flex-wrap: wrap; }
  .rbr-label { width: 100%; min-width: 0; margin-bottom: 2px; }
  .rbr-row-grow { width: 100%; flex-wrap: wrap; }
  /* section 标题在手机端：标题 + 带文字的按钮组改为上下排布 */
  .rbr-section-title {
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
  }
  .rbr-section-title .rbr-field-actions {
    width: 100%;
    display: flex;
    gap: 6px;
    justify-content: stretch;
  }
  .rbr-section-title .rbr-field-actions .rbr-btn-sm {
    flex: 1 1 0;
    text-align: center;
  }
  /* 手机端 textarea 宽度被强制 100%，仅保留垂直拖拽 */
  .rbr-textarea,
  .rbr-editable-item .rbr-item-desc {
    resize: vertical;
  }
  .rbr-field-row {
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 4px;
  }
  .rbr-field-row .rbr-label {
    width: 100%;
    min-width: 0;
    margin-bottom: 2px;
  }
  .rbr-field-row .rbr-input,
  .rbr-field-row .rbr-textarea,
  .rbr-field-row .rbr-select {
    width: 100%;
    flex: 1 1 100%;
  }
  .rbr-field-actions { width: 100%; }
  .rbr-field-row .rbr-field-actions { justify-content: flex-end; }
  .rbr-inline-btns { width: 100%; }
  .rbr-mode-btn { flex: 1 1 auto; }
  .rbr-btn-sm { flex: 1 1 auto; text-align: center; }
  .rbr-char-card { transform: none; }
  .rbr-char-header { align-items: flex-start; }
  .rbr-char-header .rbr-char-name-display { white-space: normal; word-break: break-word; line-height: 1.3; }
  .rbr-char-header .rbr-char-name-display { transform: none; }
  .rbr-char-header .rbr-char-toggle { transform: none; }
  .rbr-char-body { transform: none; }
  .rbr-btn { width: 100%; transform: none; }
}
</style>`;
