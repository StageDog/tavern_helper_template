// 包豪斯主题 (bauhaus) extraCss
// 风格关键词：原色（红/黄/蓝） + 黑白、基础几何（圆/方/三角）、无衬线、功能主义、极简
// 与 news 不同，本主题没有浅深双版，因此本文件直接写死风格相关的颜色

/* ============ 顶部状态栏 (Mundus) ============ */
export const BAUHAUS_TOP_EXTRA_CSS = `
& {
  --bh-red: #B23A2E;
  --bh-yellow: #e3b939;
  --bh-blue: #2F5891;
  --bh-black: #2C2C2E;
  --bh-paper: #ECE7D6;
  border: 0;
  border-top: 8px solid var(--bh-black);
  border-bottom: 8px solid var(--bh-black);
  box-shadow: var(--sl-shadow);
  position: relative;
}
& .sl-card-inner {
  padding: 22px 24px 18px;
  border: 0;
  position: relative;
}
/* 几何角标：替换原本的 .sl-corner 圆角线条 */
& .sl-corner { display: none; }

& .sl-news-masthead { display: none; }
& .sl-news-colophon { display: none; }

/* —— 标题：大写无衬线，红色色块衬底 —— */
& .sl-card-head {
  flex-direction: column;
  align-items: flex-start;
  border-bottom: 4px solid var(--bh-black);
  padding-bottom: 12px;
  margin-bottom: 14px;
  gap: 6px;
}
& .sl-card-titleblock {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  position: relative;
}
& .sl-card-title {
  font-family: var(--sl-font-display);
  font-size: 2.2em;
  font-weight: 900;
  letter-spacing: 0.04em;
  color: var(--bh-black);
  font-variant: normal;
  line-height: 1;
  text-transform: uppercase;
  padding: 4px 14px 4px 12px;
  background: var(--bh-yellow);
  margin: 0;
}
& .sl-card-sub {
  font-family: var(--sl-font-label);
  font-style: normal;
  font-size: 0.7em;
  letter-spacing: 0.34em;
  color: var(--bh-black);
  margin-left: 0;
  text-transform: uppercase;
  font-weight: 700;
}
& .sl-card-mark {
  display: inline-block;
  font-family: var(--sl-font-label);
  font-style: normal;
  font-size: 0.66em;
  letter-spacing: 0.24em;
  color: #FFFFFF;
  background: var(--bh-blue);
  padding: 3px 10px;
  text-transform: uppercase;
  font-weight: 700;
  align-self: flex-start;
  opacity: 1;
}

/* —— 状态栏：4 个独立模块卡，对角几何装饰 —— */
& .sl-rows {
  display: grid;
  gap: 18px;
  padding: 8px 6px 4px;
}
& .sl-row {
  grid-template-columns: 1fr;
  gap: 0;
  padding: 0;
}
& .sl-row > .sl-divider { display: none; }

& .sl-row-meta,
& .sl-row-news {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  border: 0;
  background: transparent;
}
& .sl-row .sl-chip {
  position: relative;
  border: 2px solid var(--bh-black);
  background: #FFFFFF;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  transition: transform 0.28s cubic-bezier(.2,.7,.3,1.2),
              box-shadow 0.28s cubic-bezier(.2,.7,.3,1.2);
  overflow: visible;
  isolation: isolate;
}
/* 各 chip 左上"圆"装饰 */
& .sl-row .sl-chip::before {
  content: "";
  position: absolute;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  top: -11px;
  left: -11px;
  background: var(--bh-yellow);
  border: 2px solid var(--bh-black);
  transition: transform 0.45s cubic-bezier(.4,.1,.2,1);
  z-index: 2;
}
/* 各 chip 右下"方"装饰 */
& .sl-row .sl-chip::after {
  content: "";
  position: absolute;
  width: 18px;
  height: 18px;
  bottom: -10px;
  right: -10px;
  background: var(--bh-blue);
  border: 2px solid var(--bh-black);
  transition: transform 0.45s cubic-bezier(.4,.1,.2,1);
  z-index: 2;
}
/* 4 个 chip 的不同角标配色 */
& .sl-row-meta .sl-chip-tempus::before { background: var(--bh-yellow); }
& .sl-row-meta .sl-chip-tempus::after  { background: var(--bh-blue); }
& .sl-row-meta .sl-chip-locus::before  { background: var(--bh-red); }
& .sl-row-meta .sl-chip-locus::after   { background: var(--bh-yellow); }
& .sl-row-news .sl-chip-caelum::before { background: var(--bh-blue); }
& .sl-row-news .sl-chip-caelum::after  { background: var(--bh-red); }
& .sl-row-news .sl-chip-CANTUS::before { background: var(--bh-yellow); }
& .sl-row-news .sl-chip-CANTUS::after  { background: var(--bh-black); }

/* hover：上浮 + 黑色实心阴影 + 角标旋转，4 个模块统一 */
& .sl-row .sl-chip:hover {
  transform: translate(-2px, -4px);
  box-shadow: 6px 6px 0 0 var(--bh-black);
}
& .sl-row .sl-chip:hover::before,
& .sl-row .sl-chip:hover::after {
  transform: rotate(180deg);
}

& .sl-row .sl-key {
  font-family: var(--sl-font-label);
  font-size: 0.66em;
  letter-spacing: 0.22em;
  font-weight: 900;
  text-transform: uppercase;
  border: 0;
  background: transparent;
  padding: 0;
  color: var(--bh-red);
  opacity: 1;
}
& .sl-row .sl-val {
  font-family: var(--sl-font-serif);
  font-size: 1em;
  line-height: 1.5;
  font-weight: 500;
  color: var(--bh-black);
}

/* 音乐 chip：按钮绝对定位到右上角，避免占用 chip 列内空间 */
& .sl-row-news .sl-chip-CANTUS.sl-music-chip {
  padding-right: 56px;
}
& .sl-row-news .sl-chip-CANTUS .sl-music-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  margin-left: 0;
  width: 28px;
  height: 28px;
  border-radius: 0;
  border: 2px solid var(--bh-black);
  background: var(--bh-yellow);
  color: var(--bh-black);
  font-weight: 900;
  z-index: 3;
}
& .sl-row-news .sl-chip-CANTUS .sl-music-btn:hover {
  background: var(--bh-red);
  color: #FFFFFF;
  border-color: var(--bh-black);
}

@media (max-width: 760px) {
  & .sl-row-meta,
  & .sl-row-news {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  & .sl-card-title { font-size: 1.7em; }
}
`;

/* ============ 底部状态栏 (Personae & Liber) ============ */
export const BAUHAUS_BOTTOM_EXTRA_CSS = `
& {
  --bh-red: #B23A2E;
  --bh-yellow: #e3b939;
  --bh-blue: #2F5891;
  --bh-black: #2C2C2E;
  --bh-paper: #ECE7D6;
  border: 0;
  border-top: 8px solid var(--bh-black);
  border-bottom: 8px solid var(--bh-black);
  box-shadow: var(--sl-shadow);
}
& .sl-card-inner {
  padding: 22px 24px 18px;
  border: 0;
  position: relative;
}
& .sl-corner { display: none; }
& .sl-news-masthead,
& .sl-news-colophon { display: none; }

/* —— 标题：黄底大写 —— */
& .sl-card-head {
  flex-direction: column;
  align-items: flex-start;
  border-bottom: 4px solid var(--bh-black);
  padding-bottom: 12px;
  margin-bottom: 16px;
  gap: 6px;
}
& .sl-card-titleblock {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}
& .sl-card-title {
  font-family: var(--sl-font-display);
  font-size: 2em;
  font-weight: 900;
  letter-spacing: 0.04em;
  color: var(--bh-black);
  font-variant: normal;
  line-height: 1;
  text-transform: uppercase;
  padding: 4px 14px 4px 12px;
  background: var(--bh-yellow);
}
& .sl-card-sub {
  font-family: var(--sl-font-label);
  font-style: normal;
  font-size: 0.7em;
  letter-spacing: 0.34em;
  color: var(--bh-black);
  margin-left: 0;
  text-transform: uppercase;
  font-weight: 700;
}
& .sl-card-mark {
  display: inline-block;
  font-family: var(--sl-font-label);
  font-style: normal;
  font-size: 0.66em;
  letter-spacing: 0.24em;
  color: #FFFFFF;
  background: var(--bh-blue);
  padding: 3px 10px;
  text-transform: uppercase;
  font-weight: 700;
  align-self: flex-start;
  opacity: 1;
}

/* —— Section 通用 —— */
& .sl-section {
  margin-top: 16px;
}
& .sl-section-title {
  font-family: var(--sl-font-display);
  font-size: 0.9em;
  font-weight: 900;
  letter-spacing: 0.18em;
  color: var(--bh-black);
  text-transform: uppercase;
}

/* —— 在场角色 —— */
& .sl-section-people .sl-section-title {
  display: inline-block;
  background: var(--bh-red);
  color: #FFFFFF;
  padding: 4px 12px;
  margin-bottom: 12px;
}
& .sl-acc-list {
  border: 2px solid var(--bh-black);
  background: #FFFFFF;
}
& .sl-acc {
  border-top: 2px solid var(--bh-black);
}
& .sl-acc:first-child { border-top: 0; }
& .sl-acc-head {
  padding: 10px 14px;
  gap: 14px;
  background: transparent;
}
& .sl-acc[open] .sl-acc-head {
  background: #FFFFFF;
}
& .sl-acc-mark {
  display: inline-flex;
  width: 22px;
  height: 22px;
  align-items: center;
  justify-content: center;
  background: var(--bh-blue);
  color: #FFFFFF;
  font-family: var(--sl-font-display);
  font-style: normal;
  font-size: 0.85em;
  font-weight: 900;
}
& .sl-acc-name {
  font-family: var(--sl-font-display);
  font-weight: 900;
  font-size: 1em;
  letter-spacing: 0.04em;
  color: var(--bh-black);
  text-transform: uppercase;
}
& .sl-acc-action {
  font-family: var(--sl-font-label);
  font-size: 0.66em;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-weight: 900;
  border: 2px solid var(--bh-black);
  background: #FFFFFF;
  color: var(--bh-black);
  padding: 2px 8px;
  border-radius: 0;
}
& .sl-acc[open] .sl-acc-action {
  background: var(--bh-black);
  color: #FFFFFF;
  border-color: var(--bh-black);
}
& .sl-acc-body {
  padding: 10px 14px 14px;
  background: var(--bh-paper);
  border-top: 1px solid var(--bh-black);
}
& .sl-acc-body .sl-detail {
  grid-template-columns: 96px 1fr;
  gap: 12px;
  margin-bottom: 8px;
  align-items: center;
}
& .sl-acc-body .sl-detail .sl-key {
  border: 0;
  background: var(--bh-black);
  color: #FFFFFF;
  padding: 3px 8px;
  font-family: var(--sl-font-label);
  font-size: 0.62em;
  letter-spacing: 0.18em;
  font-weight: 900;
  text-transform: uppercase;
  align-self: center;
  text-align: center;
}
& .sl-acc-body .sl-thought {
  border: 0;
  border-left: 6px solid var(--bh-red);
  background: #FFFFFF;
  padding: 8px 12px;
  margin-top: 10px;
  font-style: normal;
  font-family: var(--sl-font-serif);
}

/* —— 角色与小总结之间的分隔（红黄蓝三色条） —— */
& .sl-news-rule {
  display: flex;
  margin: 18px 0;
  height: 8px;
  padding: 0;
  border: 0;
}
& .sl-news-rule::before,
& .sl-news-rule::after { display: none; }
& .sl-news-rule .sl-news-rule-mark {
  display: none;
}
& .sl-news-rule {
  background: linear-gradient(
    to right,
    var(--bh-red) 0,
    var(--bh-red) 33.3%,
    var(--bh-yellow) 33.3%,
    var(--bh-yellow) 66.6%,
    var(--bh-blue) 66.6%,
    var(--bh-blue) 100%
  );
}

/* —— 小总结 —— */
& .sl-section-memory .sl-memory-summary {
  border: 2px solid var(--bh-black);
  border-left: 0;
  background: var(--bh-blue);
  color: #FFFFFF;
  padding: 8px 14px;
  justify-content: space-between;
}
& .sl-section-memory .sl-memory-summary .sl-section-title {
  font-size: 1em;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #FFFFFF;
}
& .sl-vol-num {
  font-family: var(--sl-font-display);
  font-style: normal;
  font-weight: 900;
  font-size: 1.2em;
  margin: 0 6px;
  color: #FFFFFF;
}
& .sl-section-memory .sl-memory-summary .sl-acc-action {
  background: var(--bh-yellow);
  color: var(--bh-black);
  border-color: var(--bh-black);
}

/* —— 小总结 body：竖排正常排版（不做卡片栅格） —— */
& .sl-memory-body {
  margin-top: 14px;
  display: block;
}
& .sl-block {
  border: 0;
  background: transparent;
  padding: 0;
  margin: 0 0 18px;
  overflow: visible;
}
& .sl-block:last-child { margin-bottom: 0; }
& .sl-block-title {
  display: inline-block;
  font-family: var(--sl-font-display);
  font-size: 0.74em;
  font-weight: 900;
  letter-spacing: 0.22em;
  color: #FFFFFF;
  background: var(--bh-black);
  text-transform: uppercase;
  margin: 0 0 8px;
  padding: 4px 12px;
  border: 0;
}
& .sl-block-worldstate .sl-block-title { background: var(--bh-blue); }
& .sl-block-currentTask .sl-block-title { background: var(--bh-red); }
& .sl-block-plot .sl-block-title { background: var(--bh-black); }
& .sl-block-psychology .sl-block-title { background: var(--bh-yellow); color: var(--bh-black); }
& .sl-block-list .sl-block-title { background: var(--bh-blue); }
& .sl-block-database .sl-block-title { background: var(--bh-black); }
& .sl-block-body {
  padding: 0 0 0 4px;
  font-family: var(--sl-font-serif);
  font-size: 0.95em;
  line-height: 1.7;
  color: var(--bh-black);
  border-left: 2px solid var(--bh-black);
  padding-left: 14px;
}
& .sl-block-list .sl-block-body {
  font-size: 0.92em;
  line-height: 1.6;
}

/* —— list 按角色拆分:几何色块标题 —— */
& .sl-block-list .sl-list-grid {
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-top: 6px;
}
& .sl-block-list .sl-list-char {
  border: 2px solid var(--bh-black);
  border-left: 8px solid var(--bh-black);
  background: #FFFFFF;
  padding: 6px 10px 8px;
}
& .sl-block-list .sl-list-char:nth-child(4n+1) { border-left-color: var(--bh-red); }
& .sl-block-list .sl-list-char:nth-child(4n+2) { border-left-color: var(--bh-yellow); }
& .sl-block-list .sl-list-char:nth-child(4n+3) { border-left-color: var(--bh-blue); }
& .sl-block-list .sl-list-char:nth-child(4n+4) { border-left-color: var(--bh-black); }
& .sl-block-list .sl-list-char-name {
  font-family: var(--sl-font-display);
  font-size: 0.74em;
  font-weight: 900;
  letter-spacing: 0.18em;
  color: var(--bh-black);
  margin-bottom: 6px;
  padding-bottom: 4px;
  border-bottom: 2px solid var(--bh-black);
  text-transform: uppercase;
}
& .sl-block-list .sl-list-char-items {
  padding-left: 18px;
  font-size: 0.92em;
  color: var(--bh-black);
}

@media (max-width: 760px) {
  & .sl-card-title { font-size: 1.6em; }
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
export const BAUHAUS_BRANCH_EXTRA_CSS = `
& {
  --bh-red: #B23A2E;
  --bh-yellow: #e3b939;
  --bh-blue: #2F5891;
  --bh-black: #2C2C2E;
  --bh-paper: #ECE7D6;
  border: 0;
  border-top: 8px solid var(--bh-black);
  border-bottom: 8px solid var(--bh-black);
  box-shadow: var(--sl-shadow);
}
& .sl-card-inner {
  padding: 18px 20px 16px;
  border: 0;
}
& .sl-corner { display: none; }

& .sl-card-head {
  border-bottom: 4px solid var(--bh-black);
  padding-bottom: 8px;
  margin-bottom: 14px;
  align-items: baseline;
  flex-wrap: nowrap;
  gap: 12px;
}
& .sl-card-title {
  font-family: var(--sl-font-display);
  font-size: 1.3em;
  font-weight: 900;
  letter-spacing: 0.16em;
  color: #FFFFFF;
  background: var(--bh-black);
  text-transform: uppercase;
  padding: 4px 12px;
  font-variant: normal;
}
& .sl-card-sub {
  font-family: var(--sl-font-label);
  font-style: normal;
  font-size: 0.74em;
  letter-spacing: 0.18em;
  color: var(--bh-black);
  text-transform: uppercase;
  font-weight: 700;
}

/* —— 选项按钮：原色块按钮 + 文字下方红线 (Underline From Left) —— */
& .sl-branch-list {
  gap: 10px;
}
& .sl-branch-btn {
  border: 2px solid var(--bh-black);
  border-left: 12px solid var(--bh-black);
  background: #FFFFFF;
  padding: 12px 14px;
  grid-template-columns: auto 1fr auto;
  gap: 14px;
  align-items: center;
  transition: none;
}
& .sl-branch-btn:nth-child(3n+1) { border-left-color: var(--bh-red); }
& .sl-branch-btn:nth-child(3n+2) { border-left-color: var(--bh-yellow); }
& .sl-branch-btn:nth-child(3n+3) { border-left-color: var(--bh-blue); }
/* 移除整体上浮 / 背景色变化，改为文字下方红线 */
& .sl-branch-btn:hover {
  background: #FFFFFF;
  transform: none;
}

& .sl-branch-key {
  width: 36px;
  height: 36px;
  border: 0;
  background: var(--bh-black);
  color: #FFFFFF;
  font-family: var(--sl-font-display);
  font-size: 1.2em;
  font-weight: 900;
  letter-spacing: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
}
& .sl-branch-btn:nth-child(3n+1) .sl-branch-key { background: var(--bh-red); }
& .sl-branch-btn:nth-child(3n+2) .sl-branch-key { background: var(--bh-yellow); color: var(--bh-black); }
& .sl-branch-btn:nth-child(3n+3) .sl-branch-key { background: var(--bh-blue); }

/* sl-branch-text 下划线从左展开 */
& .sl-branch-text {
  position: relative;
  font-family: var(--sl-font-serif);
  font-size: 0.98em;
  line-height: 1.5;
  color: var(--bh-black);
  font-weight: 500;
  display: inline-block;
  padding-bottom: 3px;
}
& .sl-branch-text::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 0;
  height: 2px;
  background: var(--bh-red);
  transition: width 0.3s cubic-bezier(.5,0,.2,1);
  pointer-events: none;
}
& .sl-branch-btn:hover .sl-branch-text::after {
  width: 100%;
}
& .sl-branch-arrow {
  color: var(--bh-black);
  font-size: 1em;
  font-weight: 900;
  transition: transform 0.25s ease;
}
& .sl-branch-btn:hover .sl-branch-arrow {
  transform: translateX(3px);
  color: var(--bh-red);
}

& .sl-card-foot {
  font-family: var(--sl-font-label);
  font-size: 0.7em;
  letter-spacing: 0.22em;
  color: var(--bh-black);
  border-top: 2px solid var(--bh-black);
  padding-top: 8px;
  margin-top: 12px;
  text-transform: uppercase;
  font-weight: 700;
}

@media (max-width: 760px) {
  /* 窄屏：避免 OPTION 标题字符级折行 + Option 文字硬挤压 */
  & .sl-card-head {
    flex-wrap: wrap;
    gap: 6px;
  }
  & .sl-card-title {
    font-size: 1em;
    letter-spacing: 0.08em;
    padding: 3px 10px;
    white-space: nowrap;
  }
  & .sl-card-sub {
    font-size: 0.7em;
    letter-spacing: 0.08em;
  }
  /* 窄屏：单列堆叠，避免长文本被 grid auto 1fr auto 挤压换行 */
  & .sl-branch-btn {
    grid-template-columns: 1fr;
    gap: 6px;
    padding: 10px 12px;
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
