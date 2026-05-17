// 涂鸦街头主题 (graffiti) extraCss
// 风格关键词：涂鸦/喷漆/撞色/font-black/uppercase/随机旋转/text-shadow 喷漆扩散
// 本主题没有浅深双版，颜色直接写死于本文件

const GR_VARS = `
  --gr-bg: #232327;
  --gr-wall: #2C2C30;
  --gr-text: #E8E8EA;
  --gr-pink: #C84765;
  --gr-cyan: #4FA8B8;
  --gr-yellow: #e6cb43;
  --gr-purple: #8E4DAE;
  --gr-lime: #abd453;
`;

/* ============ 顶部状态栏 (Mundus) ============ */
export const GRAFFITI_TOP_EXTRA_CSS = `
& {
${GR_VARS}
  border: 3px solid var(--gr-text);
  box-shadow: 6px 6px 0 0 var(--gr-pink), 12px 12px 0 0 var(--gr-cyan);
  position: relative;
  overflow: visible;
}
/* 涂鸦"已签收"标记，顶部右上小喷漆字 */
& .sl-corner { display: none; }
& .sl-card-inner {
  padding: 22px 22px 16px;
  border: 0;
  position: relative;
}
& .sl-news-masthead,
& .sl-news-colophon { display: none; }

/* —— 标题：粗黑大写 + 旋转 —— */
& .sl-card-head {
  flex-direction: column;
  align-items: flex-start;
  border-bottom: 0;
  padding-bottom: 10px;
  margin-bottom: 14px;
  gap: 8px;
  position: relative;
}
& .sl-card-titleblock {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  transform: rotate(-2deg);
  transform-origin: left center;
}
& .sl-card-title {
  font-family: var(--sl-font-display);
  font-size: 2.6em;
  font-weight: 900;
  letter-spacing: 0.02em;
  color: var(--gr-pink);
  text-transform: uppercase;
  font-variant: normal;
  line-height: 0.95;
  text-shadow:
    2px 2px 0 var(--gr-yellow),
    4px 4px 0 var(--gr-cyan),
    0 0 12px rgba(200, 71, 101, 0.45);
}
& .sl-card-sub {
  font-family: var(--sl-font-label);
  font-style: normal;
  font-size: 0.76em;
  letter-spacing: 0.22em;
  color: var(--gr-cyan);
  margin-left: 4px;
  text-transform: uppercase;
  font-weight: 900;
  text-shadow: 0 0 6px rgba(79, 168, 184, 0.5);
}
& .sl-card-mark {
  display: inline-block;
  font-family: var(--sl-font-label);
  font-size: 0.7em;
  letter-spacing: 0.22em;
  color: var(--gr-bg);
  background: var(--gr-yellow);
  padding: 2px 10px;
  text-transform: uppercase;
  font-weight: 900;
  font-style: normal;
  align-self: flex-start;
  transform: rotate(3deg);
  opacity: 1;
}

/* —— 状态栏：规整的喷漆贴纸，hover 时整体右上倾斜并带阴影 —— */
& .sl-rows {
  display: grid;
  gap: 14px;
}
& .sl-row {
  grid-template-columns: 1fr;
  gap: 10px;
  padding: 0;
}
& .sl-row > .sl-divider { display: none; }

& .sl-row-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 2px dashed var(--gr-text);
}
& .sl-row-meta .sl-chip {
  border: 2px solid var(--gr-text);
  background: var(--gr-wall);
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  transform: none;
  transition: transform 0.28s cubic-bezier(.2,.7,.3,1.2),
              box-shadow 0.28s cubic-bezier(.2,.7,.3,1.2);
}
& .sl-row-meta .sl-chip-tempus:hover {
  transform: translate(3px, -3px) rotate(2deg);
  box-shadow: -5px 5px 0 0 var(--gr-cyan);
}
& .sl-row-meta .sl-chip-locus:hover {
  transform: translate(3px, -3px) rotate(2deg);
  box-shadow: -5px 5px 0 0 var(--gr-pink);
}
& .sl-row-meta .sl-key {
  font-family: var(--sl-font-label);
  font-size: 0.76em;
  letter-spacing: 0.22em;
  font-weight: 900;
  text-transform: uppercase;
  border: 0;
  background: transparent;
  padding: 0;
  color: var(--gr-yellow);
}
& .sl-row-meta .sl-val {
  font-family: var(--sl-font-serif);
  color: var(--gr-text);
  font-weight: 700;
}

& .sl-row-news {
  display: grid;
  grid-template-columns: minmax(0, 6fr) minmax(0, 4fr);
  gap: 12px;
}
& .sl-row-news .sl-chip {
  border: 3px solid var(--gr-text);
  background: var(--gr-wall);
  padding: 12px 14px;
  display: block;
  transform: none;
  box-shadow: none;
  transition: transform 0.3s cubic-bezier(.2,.7,.3,1.2),
              box-shadow 0.3s cubic-bezier(.2,.7,.3,1.2);
}
& .sl-row-news .sl-chip-caelum {
  border-color: var(--gr-cyan);
}
& .sl-row-news .sl-chip-CANTUS {
  border-color: var(--gr-purple);
}
& .sl-row-news .sl-chip-caelum:hover {
  transform: translate(4px, -4px) rotate(1.8deg);
  box-shadow: -6px 6px 0 0 var(--gr-pink);
}
& .sl-row-news .sl-chip-CANTUS:hover {
  transform: translate(4px, -4px) rotate(1.8deg);
  box-shadow: -6px 6px 0 0 var(--gr-yellow);
}
& .sl-row-news .sl-chip-caelum > .sl-key,
& .sl-row-news .sl-chip-CANTUS > .sl-key {
  display: block;
  font-family: var(--sl-font-label);
  font-size: 0.72em;
  font-weight: 900;
  letter-spacing: 0.2em;
  border: 0;
  background: transparent;
  padding: 0 0 6px;
  margin-bottom: 4px;
  text-transform: uppercase;
  text-shadow: 0 0 4px currentColor;
}
& .sl-row-news .sl-chip-caelum > .sl-key { color: var(--gr-cyan); }
& .sl-row-news .sl-chip-CANTUS > .sl-key { color: var(--gr-purple); }
& .sl-row-news .sl-chip-caelum > .sl-val,
& .sl-row-news .sl-chip-CANTUS > .sl-val {
  display: block;
  font-family: var(--sl-font-serif);
  font-size: 0.95em;
  line-height: 1.6;
  color: var(--gr-text);
  font-weight: 600;
}

/* 音乐 chip：按钮绝对定位到右上角 */
& .sl-row-news .sl-chip-CANTUS.sl-music-chip {
  position: relative;
  padding-right: 44px;
}
& .sl-row-news .sl-chip-CANTUS .sl-music-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  margin-left: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid var(--gr-yellow);
  background: var(--gr-wall);
  color: var(--gr-yellow);
  font-weight: 900;
  z-index: 3;
  text-shadow: 0 0 4px rgba(230, 203, 67, 0.55);
}
& .sl-row-news .sl-chip-CANTUS .sl-music-btn:hover {
  background: var(--gr-yellow);
  color: var(--gr-bg);
}

@media (max-width: 760px) {
  & .sl-row-meta { grid-template-columns: 1fr; }
  & .sl-row-news { grid-template-columns: 1fr; }
  & .sl-card-title { font-size: 1.9em; }
}
`;

/* ============ 底部状态栏 (Personae & Liber) ============ */
export const GRAFFITI_BOTTOM_EXTRA_CSS = `
& {
${GR_VARS}
  border: 3px solid var(--gr-text);
  box-shadow: 6px 6px 0 0 var(--gr-purple), 12px 12px 0 0 var(--gr-yellow);
  position: relative;
}
& .sl-card-inner {
  padding: 22px 22px 18px;
  border: 0;
}
& .sl-corner { display: none; }
& .sl-news-masthead,
& .sl-news-colophon { display: none; }

& .sl-card-head {
  flex-direction: column;
  align-items: flex-start;
  border-bottom: 0;
  padding-bottom: 8px;
  margin-bottom: 16px;
  gap: 8px;
}
& .sl-card-titleblock {
  transform: rotate(-1.5deg);
  transform-origin: left center;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}
& .sl-card-title {
  font-family: var(--sl-font-display);
  font-size: 2.2em;
  font-weight: 900;
  letter-spacing: 0.02em;
  color: var(--gr-cyan);
  text-transform: uppercase;
  font-variant: normal;
  line-height: 0.95;
  text-shadow:
    2px 2px 0 var(--gr-purple),
    4px 4px 0 var(--gr-pink),
    0 0 10px rgba(79, 168, 184, 0.45);
}
& .sl-card-sub {
  font-family: var(--sl-font-label);
  font-size: 0.74em;
  letter-spacing: 0.22em;
  color: var(--gr-yellow);
  margin-left: 4px;
  text-transform: uppercase;
  font-weight: 900;
  font-style: normal;
  text-shadow: 0 0 6px rgba(201, 177, 55, 0.45);
}
& .sl-card-mark {
  display: inline-block;
  font-family: var(--sl-font-label);
  font-size: 0.7em;
  letter-spacing: 0.22em;
  color: var(--gr-bg);
  background: var(--gr-lime);
  padding: 2px 10px;
  text-transform: uppercase;
  font-weight: 900;
  font-style: normal;
  transform: rotate(2deg);
  align-self: flex-start;
  opacity: 1;
}

/* —— Section 通用 —— */
& .sl-section {
  margin-top: 16px;
}
& .sl-section-title {
  font-family: var(--sl-font-display);
  font-size: 1em;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

/* —— 在场角色 —— */
& .sl-section-people .sl-section-title {
  display: inline-block;
  background: var(--gr-pink);
  color: var(--gr-bg);
  padding: 4px 12px;
  margin-bottom: 14px;
  transform: rotate(-1.5deg);
  text-shadow: none;
  box-shadow: 3px 3px 0 0 var(--gr-yellow);
}
& .sl-acc {
  border-top: 2px dashed var(--gr-text);
  border-bottom: 0;
}
& .sl-acc:last-child {
  border-bottom: 2px dashed var(--gr-text);
}
& .sl-acc-head {
  padding: 10px 6px;
  gap: 12px;
}
& .sl-acc-mark {
  display: inline-flex;
  width: 26px;
  height: 26px;
  align-items: center;
  justify-content: center;
  background: var(--gr-yellow);
  color: var(--gr-bg);
  font-family: var(--sl-font-display);
  font-style: normal;
  font-weight: 900;
  font-size: 0.85em;
  transform: rotate(-8deg);
}
& .sl-acc-name {
  font-family: var(--sl-font-display);
  font-weight: 900;
  font-size: 1.1em;
  letter-spacing: 0.04em;
  color: var(--gr-text);
  text-transform: uppercase;
  text-shadow: 1px 1px 0 var(--gr-purple);
}
& .sl-acc-action {
  font-family: var(--sl-font-label);
  font-size: 0.64em;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  font-weight: 900;
  border: 2px solid var(--gr-cyan);
  background: transparent;
  color: var(--gr-cyan);
  padding: 2px 8px;
  border-radius: 0;
}
& .sl-acc[open] .sl-acc-action {
  background: var(--gr-cyan);
  color: var(--gr-bg);
  border-color: var(--gr-cyan);
}
& .sl-acc-body {
  padding: 6px 6px 14px;
}
& .sl-acc-body .sl-detail {
  grid-template-columns: 92px 1fr;
  gap: 12px;
  margin-bottom: 8px;
  align-items: center;
}
& .sl-acc-body .sl-detail .sl-key {
  border: 0;
  background: var(--gr-purple);
  color: var(--gr-text);
  padding: 3px 8px;
  font-family: var(--sl-font-label);
  font-size: 0.92em;
  letter-spacing: 0.15em;
  font-weight: 400;
  text-transform: uppercase;
  align-self: center;
  text-align: center;
}
& .sl-acc-body .sl-thought {
  border: 0;
  border-left: 5px solid var(--gr-pink);
  background: rgba(200, 71, 101, 0.08);
  padding: 8px 12px;
  margin-top: 10px;
  font-style: italic;
  font-family: var(--sl-font-serif);
  color: var(--gr-text);
}

/* —— 角色与小总结分隔：贴纸条 —— */
& .sl-news-rule {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px 0;
  position: relative;
  height: auto;
}
& .sl-news-rule::before,
& .sl-news-rule::after {
  content: "";
  flex: 1;
  border-top: 2px dashed var(--gr-text);
}
& .sl-news-rule .sl-news-rule-mark {
  display: inline-block;
  padding: 4px 14px;
  background: var(--gr-yellow);
  color: var(--gr-bg);
  font-family: var(--sl-font-display);
  font-weight: 900;
  font-size: 1em;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  margin: 0 12px;
  transform: rotate(-2deg);
}

/* —— 小总结 —— */
& .sl-section-memory .sl-memory-summary {
  border: 2px solid var(--gr-text);
  border-left: 8px solid var(--gr-cyan);
  background: var(--gr-wall);
  padding: 8px 14px;
  justify-content: space-between;
}
& .sl-section-memory .sl-memory-summary .sl-section-title {
  font-size: 1em;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--gr-cyan);
  text-shadow: 0 0 6px rgba(79, 168, 184, 0.45);
}
& .sl-vol-num {
  font-family: var(--sl-font-display);
  font-style: normal;
  font-weight: 900;
  font-size: 1.05em;
  margin: 0 6px;
  color: var(--gr-yellow);
}
& .sl-section-memory .sl-memory-summary .sl-acc-action {
  border-color: var(--gr-yellow);
  color: var(--gr-yellow);
}
& .sl-section-memory .sl-memory-details[open] .sl-memory-summary .sl-acc-action {
  background: var(--gr-yellow);
  color: var(--gr-bg);
}

/* —— 小总结 body：multi-column 排版；为 hover 时 transform 与 box-shadow 预留位移空间 —— */
& .sl-memory-body {
  margin-top: 16px;
  column-count: 3;
  column-gap: 18px;
}
& .sl-block {
  break-inside: avoid;
  display: block;
  border: 2px solid var(--gr-text);
  background: var(--gr-wall);
  padding: 0;
  margin: 6px 4px 22px;
  position: relative;
  overflow: visible;
  box-shadow: none;
  transform: none;
  transition: transform 0.32s cubic-bezier(.25,.7,.3,1.1),
              box-shadow 0.32s cubic-bezier(.25,.7,.3,1.1);
}
/* 涂鸦：右上角两条短竖线（喷漆滴痕）—— 放在 block 内部上沿，避免 multi-column 下漂到相邻列 */
& .sl-block::before,
& .sl-block::after {
  content: "";
  position: absolute;
  top: 0;
  width: 2px;
  pointer-events: none;
  transition: height 0.32s cubic-bezier(.25,.7,.3,1.1),
              top 0.32s cubic-bezier(.25,.7,.3,1.1);
  z-index: 2;
}
& .sl-block::before {
  right: 18px;
  background: var(--gr-pink);
  height: 14px;
}
& .sl-block::after {
  right: 26px;
  background: var(--gr-cyan);
  height: 18px;
}
/* nth-child 配色：双竖线随 block 类型轮换 */
& .sl-block:nth-child(4n+1)::before { background: var(--gr-pink); }
& .sl-block:nth-child(4n+1)::after  { background: var(--gr-yellow); }
& .sl-block:nth-child(4n+2)::before { background: var(--gr-cyan); }
& .sl-block:nth-child(4n+2)::after  { background: var(--gr-pink); }
& .sl-block:nth-child(4n+3)::before { background: var(--gr-yellow); }
& .sl-block:nth-child(4n+3)::after  { background: var(--gr-purple); }
& .sl-block:nth-child(4n+4)::before { background: var(--gr-purple); }
& .sl-block:nth-child(4n+4)::after  { background: var(--gr-cyan); }

/* hover：轻微倾斜 + 向下延伸的彩色阴影 */
& .sl-block:hover {
  transform: rotate(-0.8deg);
  box-shadow: 3px 9px 0 0 var(--gr-pink);
}
& .sl-block:nth-child(odd):hover  { transform: rotate(-0.8deg); }
& .sl-block:nth-child(even):hover { transform: rotate(0.8deg); }
& .sl-block:nth-child(4n+1):hover { box-shadow: 3px 9px 0 0 var(--gr-pink); }
& .sl-block:nth-child(4n+2):hover { box-shadow: 3px 9px 0 0 var(--gr-cyan); }
& .sl-block:nth-child(4n+3):hover { box-shadow: 3px 9px 0 0 var(--gr-yellow); }
& .sl-block:nth-child(4n+4):hover { box-shadow: 3px 9px 0 0 var(--gr-purple); }
/* hover 时涂鸦双竖线向下伸长（仍保持在 block 内部） */
& .sl-block:hover::before { height: 52px; }
& .sl-block:hover::after  { height: 68px; }

& .sl-block-title {
  font-family: var(--sl-font-display);
  font-size: 0.78em;
  font-weight: 900;
  letter-spacing: 0.22em;
  color: var(--gr-bg);
  text-transform: uppercase;
  margin: 0;
  padding: 5px 10px;
  border: 0;
  position: relative;
  z-index: 1;
}
& .sl-block-worldstate .sl-block-title { background: var(--gr-cyan); }
& .sl-block-currentTask .sl-block-title { background: var(--gr-pink); color: var(--gr-text); }
& .sl-block-plot .sl-block-title { background: var(--gr-yellow); }
& .sl-block-psychology .sl-block-title { background: var(--gr-purple); color: var(--gr-text); }
& .sl-block-list .sl-block-title { background: var(--gr-lime); }
& .sl-block-database .sl-block-title { background: var(--gr-text); color: var(--gr-bg); }
& .sl-block-body {
  padding: 10px 12px 12px;
  font-family: var(--sl-font-serif);
  font-size: 0.95em;
  line-height: 1.65;
  color: var(--gr-text);
  position: relative;
  z-index: 1;
}
& .sl-block-list .sl-block-body {
  font-size: 0.92em;
  line-height: 1.55;
}

/* —— list 多角色拆分:每个角色作为独立 mini-block,平等参与 column-count 列流 ——
 * 仅在解析成功(存在 .sl-list-grid)时触发;回退场景(只有 .sl-block-body)沿用通用 .sl-block 规则
 */
& .sl-block-list:has(.sl-list-grid) {
  display: contents;
}
& .sl-block-list:has(.sl-list-grid) > .sl-block-title {
  display: none;
}
& .sl-block-list:has(.sl-list-grid) .sl-list-grid {
  display: contents;
}
& .sl-block-list:has(.sl-list-grid) .sl-list-char {
  break-inside: avoid;
  display: block;
  border: 2px solid var(--gr-text);
  background: var(--gr-wall);
  padding: 0;
  margin: 6px 4px 22px;
  position: relative;
  overflow: visible;
  box-shadow: none;
  transform: none;
  transition: transform 0.32s cubic-bezier(.25,.7,.3,1.1),
              box-shadow 0.32s cubic-bezier(.25,.7,.3,1.1);
}
/* 双竖线喷漆滴痕,几何参数与 .sl-block::before / ::after 一致(P3-3 修正后) */
& .sl-block-list:has(.sl-list-grid) .sl-list-char::before,
& .sl-block-list:has(.sl-list-grid) .sl-list-char::after {
  content: "";
  position: absolute;
  top: 0;
  width: 2px;
  pointer-events: none;
  transition: height 0.32s cubic-bezier(.25,.7,.3,1.1),
              top 0.32s cubic-bezier(.25,.7,.3,1.1);
  z-index: 2;
}
& .sl-block-list:has(.sl-list-grid) .sl-list-char::before {
  right: 18px;
  background: var(--gr-pink);
  height: 14px;
}
& .sl-block-list:has(.sl-list-grid) .sl-list-char::after {
  right: 26px;
  background: var(--gr-cyan);
  height: 18px;
}
/* nth-child 配色:双竖线随角色顺序轮换 */
& .sl-block-list:has(.sl-list-grid) .sl-list-char:nth-child(4n+1)::before { background: var(--gr-pink); }
& .sl-block-list:has(.sl-list-grid) .sl-list-char:nth-child(4n+1)::after  { background: var(--gr-yellow); }
& .sl-block-list:has(.sl-list-grid) .sl-list-char:nth-child(4n+2)::before { background: var(--gr-cyan); }
& .sl-block-list:has(.sl-list-grid) .sl-list-char:nth-child(4n+2)::after  { background: var(--gr-pink); }
& .sl-block-list:has(.sl-list-grid) .sl-list-char:nth-child(4n+3)::before { background: var(--gr-yellow); }
& .sl-block-list:has(.sl-list-grid) .sl-list-char:nth-child(4n+3)::after  { background: var(--gr-purple); }
& .sl-block-list:has(.sl-list-grid) .sl-list-char:nth-child(4n+4)::before { background: var(--gr-purple); }
& .sl-block-list:has(.sl-list-grid) .sl-list-char:nth-child(4n+4)::after  { background: var(--gr-cyan); }

/* hover:轻微倾斜 + 向下延伸的彩色阴影 */
& .sl-block-list:has(.sl-list-grid) .sl-list-char:nth-child(odd):hover  { transform: rotate(-0.8deg); }
& .sl-block-list:has(.sl-list-grid) .sl-list-char:nth-child(even):hover { transform: rotate(0.8deg); }
& .sl-block-list:has(.sl-list-grid) .sl-list-char:nth-child(4n+1):hover { box-shadow: 3px 9px 0 0 var(--gr-pink); }
& .sl-block-list:has(.sl-list-grid) .sl-list-char:nth-child(4n+2):hover { box-shadow: 3px 9px 0 0 var(--gr-cyan); }
& .sl-block-list:has(.sl-list-grid) .sl-list-char:nth-child(4n+3):hover { box-shadow: 3px 9px 0 0 var(--gr-yellow); }
& .sl-block-list:has(.sl-list-grid) .sl-list-char:nth-child(4n+4):hover { box-shadow: 3px 9px 0 0 var(--gr-purple); }
& .sl-block-list:has(.sl-list-grid) .sl-list-char:hover::before { height: 52px; }
& .sl-block-list:has(.sl-list-grid) .sl-list-char:hover::after  { height: 68px; }

/* 角色名:撞色头条 mini-block-title,nth-child 4n 轮换 */
& .sl-block-list:has(.sl-list-grid) .sl-list-char-name {
  font-family: var(--sl-font-display);
  font-size: 0.78em;
  font-weight: 900;
  letter-spacing: 0.22em;
  color: var(--gr-bg);
  text-transform: uppercase;
  margin: 0;
  padding: 5px 10px;
  border: 0;
  position: relative;
  z-index: 1;
  text-shadow: none;
  background: var(--gr-lime);
}
& .sl-block-list:has(.sl-list-grid) .sl-list-char:nth-child(4n+1) .sl-list-char-name { background: var(--gr-cyan); }
& .sl-block-list:has(.sl-list-grid) .sl-list-char:nth-child(4n+2) .sl-list-char-name { background: var(--gr-pink); color: var(--gr-text); }
& .sl-block-list:has(.sl-list-grid) .sl-list-char:nth-child(4n+3) .sl-list-char-name { background: var(--gr-yellow); }
& .sl-block-list:has(.sl-list-grid) .sl-list-char:nth-child(4n+4) .sl-list-char-name { background: var(--gr-purple); color: var(--gr-text); }

/* 角色 items:mini-block body */
& .sl-block-list:has(.sl-list-grid) .sl-list-char-items {
  padding: 10px 30px 12px;
  margin: 0;
  font-family: var(--sl-font-serif);
  font-size: 0.92em;
  line-height: 1.55;
  color: var(--gr-text);
  position: relative;
  z-index: 1;
}

@media (max-width: 1100px) {
  & .sl-memory-body { column-count: 2; }
}

@media (max-width: 760px) {
  & .sl-card-title { font-size: 1.7em; }
  & .sl-memory-body { column-count: 1; }
  /* 窄屏：标签独占一行 + 内容在下 */
  & .sl-acc-body .sl-detail {
    grid-template-columns: 1fr;
    gap: 4px;
  }
  & .sl-acc-body .sl-detail .sl-key {
    display: block;
    width: 100%;
    text-align: center;
    align-self: stretch;
  }
}
`;

/* ============ 行动选项 (Optio / Branch) ============ */
export const GRAFFITI_BRANCH_EXTRA_CSS = `
& {
${GR_VARS}
  border: 3px solid var(--gr-text);
  box-shadow: 5px 5px 0 0 var(--gr-yellow), 10px 10px 0 0 var(--gr-pink);
}
& .sl-card-inner {
  padding: 18px 20px 16px;
  border: 0;
}
& .sl-corner { display: none; }

& .sl-card-head {
  border-bottom: 2px dashed var(--gr-text);
  padding-bottom: 8px;
  margin-bottom: 14px;
  align-items: baseline;
  gap: 10px;
  flex-wrap: nowrap;
}
& .sl-card-title {
  font-family: var(--sl-font-display);
  font-size: 1.4em;
  font-weight: 900;
  letter-spacing: 0.18em;
  color: var(--gr-yellow);
  text-transform: uppercase;
  font-variant: normal;
  text-shadow:
    2px 2px 0 var(--gr-pink),
    0 0 8px rgba(201, 177, 55, 0.5);
  transform: rotate(-1.5deg);
  display: inline-block;
}
& .sl-card-sub {
  font-family: var(--sl-font-label);
  font-style: normal;
  font-size: 0.78em;
  letter-spacing: 0.18em;
  color: var(--gr-cyan);
  text-transform: uppercase;
  font-weight: 900;
}

/* —— 选项按钮：贴纸式撞色 —— */
& .sl-branch-list {
  gap: 12px;
}
& .sl-branch-btn {
  border: 2px solid var(--gr-text);
  border-left: 8px solid var(--gr-pink);
  background: var(--gr-wall);
  color: var(--gr-text);
  padding: 12px 14px;
  grid-template-columns: auto 1fr auto;
  gap: 14px;
  align-items: center;
  position: relative;
  transition: transform 0.16s cubic-bezier(.3,.7,.3,1),
              box-shadow 0.16s cubic-bezier(.3,.7,.3,1);
}
& .sl-branch-btn:nth-child(4n+1) { border-left-color: var(--gr-pink);   box-shadow: 4px 4px 0 0 var(--gr-pink); }
& .sl-branch-btn:nth-child(4n+2) { border-left-color: var(--gr-cyan);   box-shadow: 4px 4px 0 0 var(--gr-cyan); }
& .sl-branch-btn:nth-child(4n+3) { border-left-color: var(--gr-yellow); box-shadow: 4px 4px 0 0 var(--gr-yellow); }
& .sl-branch-btn:nth-child(4n+4) { border-left-color: var(--gr-purple); box-shadow: 4px 4px 0 0 var(--gr-purple); }
& .sl-branch-btn:nth-child(odd)  { transform: rotate(-0.5deg); }
& .sl-branch-btn:nth-child(even) { transform: rotate(0.5deg); }
& .sl-branch-btn:hover {
  transform: translate(-2px, -2px) rotate(0deg);
  box-shadow: 6px 6px 0 0 currentColor;
}
/* 按下：阴影向内缩回，按钮被"按入"贴纸 */
& .sl-branch-btn:active {
  transform: translate(4px, 4px) rotate(0deg);
  box-shadow: 0 0 0 0 currentColor;
  transition: transform 0.08s ease, box-shadow 0.08s ease;
}

& .sl-branch-key {
  width: 36px;
  height: 36px;
  border: 0;
  background: var(--gr-text);
  color: var(--gr-bg);
  font-family: var(--sl-font-display);
  font-size: 1.3em;
  font-weight: 900;
  letter-spacing: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
  transform: rotate(-6deg);
}
& .sl-branch-btn:nth-child(4n+1) .sl-branch-key { background: var(--gr-pink); color: var(--gr-text); }
& .sl-branch-btn:nth-child(4n+2) .sl-branch-key { background: var(--gr-cyan); color: var(--gr-bg); }
& .sl-branch-btn:nth-child(4n+3) .sl-branch-key { background: var(--gr-yellow); color: var(--gr-bg); }
& .sl-branch-btn:nth-child(4n+4) .sl-branch-key { background: var(--gr-purple); color: var(--gr-text); }

& .sl-branch-text {
  font-family: var(--sl-font-serif);
  font-size: 1em;
  line-height: 1.5;
  color: var(--gr-text);
  font-weight: 600;
}
& .sl-branch-arrow {
  color: var(--gr-yellow);
  font-size: 1.1em;
  font-weight: 900;
  text-shadow: 0 0 6px rgba(201, 177, 55, 0.55);
}

& .sl-card-foot {
  font-family: var(--sl-font-label);
  font-size: 0.7em;
  letter-spacing: 0.22em;
  color: var(--gr-yellow);
  border-top: 2px dashed var(--gr-text);
  padding-top: 8px;
  margin-top: 12px;
  text-transform: uppercase;
  font-weight: 900;
}

@media (max-width: 760px) {
  /* 窄屏：避免 OPTION 标题字符级折行 + Option 文字硬挤压 */
  & .sl-card-head {
    flex-wrap: wrap;
    gap: 6px;
  }
  & .sl-card-title {
    font-size: 1.1em;
    letter-spacing: 0.12em;
    transform: rotate(-1deg);
    white-space: nowrap;
  }
  & .sl-card-sub {
    font-size: 0.7em;
  }
  /* 窄屏：单列堆叠，保留贴纸 ±0.5deg 倾斜装饰 */
  & .sl-branch-btn {
    grid-template-columns: 1fr;
    gap: 6px;
    padding: 12px 14px;
  }
  & .sl-branch-key {
    justify-self: start;
  }
  & .sl-branch-text {
    display: block;
    width: 100%;
  }
  & .sl-branch-arrow {
    justify-self: end;
  }
}
`;
