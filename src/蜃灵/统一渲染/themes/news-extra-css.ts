// 报纸主题 (news / news-deep) 共享的 extraCss
// 颜色靠现有 CSS 变量自动适配浅 / 深双版
// 用 & 锚点（自动 scope 到 `.sl-unified-card[data-theme-id="news"]` 等根选择器）

/* ============ 顶部状态栏 (Mundus) ============ */
export const NEWS_TOP_EXTRA_CSS = `
& {
  border: 2px solid var(--sl-border);
  box-shadow: var(--sl-shadow);
}
& .sl-card-inner {
  padding: 18px 22px 14px;
  border: 1px solid var(--sl-border-thin);
}

/* —— 顶部刊号细行（Vol. / Edition 风格） —— */
& .sl-news-masthead {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-family: var(--sl-font-label);
  font-size: 0.66em;
  letter-spacing: 0.28em;
  color: var(--sl-muted);
  text-transform: uppercase;
  border-bottom: 1px solid var(--sl-border);
  padding: 0 2px 5px;
  margin-bottom: 12px;
  font-variant: small-caps;
}
& .sl-news-masthead .sl-news-issue {
  font-weight: 700;
}

/* —— 大标题刊头 —— */
& .sl-card-head {
  flex-direction: column;
  align-items: center;
  text-align: center;
  border-bottom: 4px double var(--sl-border);
  padding-bottom: 10px;
  margin-bottom: 12px;
  gap: 4px;
}
& .sl-card-titleblock {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
& .sl-card-title {
  font-family: var(--sl-font-display);
  font-size: 2.4em;
  font-weight: 900;
  letter-spacing: 0.1em;
  color: var(--sl-accent);
  font-variant: normal;
  line-height: 1.05;
}
& .sl-card-sub {
  font-style: italic;
  font-size: 0.78em;
  letter-spacing: 0.34em;
  color: var(--sl-muted);
  margin-left: 0;
}
/* 顶部右上角的旧 mark 在报纸主题下隐藏（已下沉到 colophon） */
& .sl-card-mark {
  display: none;
}

/* —— 状态栏：Time/Location 刊头细行（横排） —— */
& .sl-rows {
  display: block;
}
& .sl-row-meta {
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 14px;
  border-bottom: 1px solid var(--sl-border);
  padding: 4px 0 8px;
  margin-bottom: 12px;
  font-style: italic;
  font-size: 0.92em;
  color: var(--sl-muted);
}
& .sl-row-meta .sl-chip {
  border: none;
  background: transparent;
  padding: 0;
  flex: 0 1 auto;
}
& .sl-row-meta .sl-key {
  font-size: 0.7em;
  letter-spacing: 0.18em;
  border: none;
  background: transparent;
  padding: 0;
  font-variant: small-caps;
  margin-right: 4px;
  color: var(--sl-accent);
  font-weight: 700;
}
& .sl-row-meta .sl-divider {
  color: var(--sl-border);
  font-size: 0.85em;
  opacity: 0.65;
}

/* —— 状态栏：Weather 头条 + Spatial sidebar —— */
& .sl-row-news {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 3fr);
  gap: 16px;
  align-items: stretch;
  padding-top: 4px;
}
& .sl-row-news > .sl-divider {
  display: none;
}
& .sl-row-news .sl-chip {
  display: block;
  border: none;
  background: transparent;
  padding: 0;
}
& .sl-row-news .sl-chip-caelum {
  /* 头条样式 */
  padding-right: 14px;
  border-right: 1px solid var(--sl-border-thin);
}
& .sl-row-news .sl-chip-CANTUS {
  /* sidebar 样式 */
  padding: 6px 8px;
  border: 1px solid var(--sl-border);
  background: var(--sl-chip-bg);
}
/* 音乐 chip 在报纸 sidebar 下需要给按钮腾出右上角空间 */
& .sl-row-news .sl-chip-CANTUS.sl-music-chip {
  position: relative;
  padding-right: 36px;
}
& .sl-row-news .sl-chip-CANTUS .sl-music-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  margin-left: 0;
  border-color: var(--sl-accent);
  color: var(--sl-accent);
  background: var(--sl-panel-bg);
}
& .sl-row-news .sl-chip-caelum > .sl-key,
& .sl-row-news .sl-chip-CANTUS > .sl-key {
  display: block;
  font-size: 0.72em;
  font-weight: 900;
  letter-spacing: 0.18em;
  color: var(--sl-accent);
  border: none;
  background: transparent;
  padding: 0 0 4px;
  margin-bottom: 6px;
  border-bottom: 2px solid var(--sl-border);
  width: 100%;
  text-transform: uppercase;
}
& .sl-row-news .sl-chip-caelum > .sl-val,
& .sl-row-news .sl-chip-CANTUS > .sl-val {
  display: block;
  text-align: justify;
  hyphens: auto;
  font-size: 0.96em;
  line-height: 1.7;
}
/* 头条首字下沉（仅 Caelum） */
& .sl-row-news .sl-chip-caelum > .sl-val::first-letter {
  font-family: var(--sl-font-display);
  font-size: 3.4em;
  font-weight: 900;
  float: left;
  line-height: 0.85;
  padding: 4px 8px 0 0;
  color: var(--sl-accent);
}
/* sidebar 内容字号略小、紧凑 */
& .sl-row-news .sl-chip-CANTUS > .sl-val {
  font-size: 0.88em;
  line-height: 1.6;
}

/* —— 底部 colophon —— */
& .sl-news-colophon {
  display: block;
  text-align: center;
  border-top: 4px double var(--sl-border);
  margin-top: 16px;
  padding-top: 8px;
  font-family: var(--sl-font-label);
  font-size: 0.72em;
  letter-spacing: 0.26em;
  color: var(--sl-muted);
  font-variant: small-caps;
}

@media (max-width: 760px) {
  & .sl-row-news {
    grid-template-columns: 1fr;
  }
  & .sl-row-news .sl-chip-caelum {
    border-right: none;
    border-bottom: 1px solid var(--sl-border-thin);
    padding-right: 0;
    padding-bottom: 12px;
  }
  & .sl-row-meta {
    flex-wrap: wrap;
    justify-content: flex-start;
  }
  & .sl-row-meta .sl-chip {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }
  & .sl-row-meta .sl-key {
    margin-right: 0;
  }
  & .sl-card-title {
    font-size: 1.9em;
  }
}
`;

/* ============ 底部状态栏 (Personae & Liber) ============ */
export const NEWS_BOTTOM_EXTRA_CSS = `
& {
  border: 2px solid var(--sl-border);
  box-shadow: var(--sl-shadow);
}
& .sl-card-inner {
  padding: 18px 22px 14px;
  border: 1px solid var(--sl-border-thin);
}

/* —— 顶部刊号细行 —— */
& .sl-news-masthead {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-family: var(--sl-font-label);
  font-size: 0.66em;
  letter-spacing: 0.28em;
  color: var(--sl-muted);
  text-transform: uppercase;
  border-bottom: 1px solid var(--sl-border);
  padding: 0 2px 5px;
  margin-bottom: 12px;
  font-variant: small-caps;
}
& .sl-news-masthead .sl-news-issue {
  font-weight: 700;
}

/* —— 大标题刊头 —— */
& .sl-card-head {
  flex-direction: column;
  align-items: center;
  text-align: center;
  border-bottom: 4px double var(--sl-border);
  padding-bottom: 10px;
  margin-bottom: 14px;
  gap: 4px;
}
& .sl-card-titleblock {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
& .sl-card-title {
  font-family: var(--sl-font-display);
  font-size: 2em;
  font-weight: 900;
  letter-spacing: 0.08em;
  color: var(--sl-accent);
  font-variant: normal;
  line-height: 1.1;
}
& .sl-card-sub {
  font-style: italic;
  font-size: 0.78em;
  letter-spacing: 0.22em;
  color: var(--sl-muted);
  margin-left: 0;
}
& .sl-card-mark {
  display: none;
}

/* —— Section 通用：标题做小报刊头 —— */
& .sl-section-title {
  font-family: var(--sl-font-display);
  font-size: 1.05em;
  font-weight: 900;
  letter-spacing: 0.04em;
  color: var(--sl-accent);
}

/* —— 在场角色 (single-column details list) —— */
& .sl-section-people .sl-section-title {
  display: inline-block;
  border-bottom: 2px solid var(--sl-border);
  padding-bottom: 3px;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}
& .sl-acc {
  border-top: 1px solid var(--sl-border-thin);
  border-bottom: none;
}
& .sl-acc:last-child {
  border-bottom: 1px solid var(--sl-border-thin);
}
& .sl-acc-head {
  padding: 8px 4px;
  gap: 12px;
}
& .sl-acc-mark {
  font-family: var(--sl-font-display);
  font-style: italic;
  font-size: 1.05em;
  color: var(--sl-accent);
}
& .sl-acc-name {
  font-family: var(--sl-font-display);
  font-weight: 900;
  font-size: 1.05em;
  letter-spacing: 0.04em;
  color: var(--sl-text);
}
& .sl-acc-action {
  font-family: var(--sl-font-label);
  font-size: 0.66em;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  border-radius: 0;
}
& .sl-acc-body {
  padding: 4px 4px 12px;
}
& .sl-acc-body .sl-detail {
  grid-template-columns: 92px 1fr;
}
& .sl-acc-body .sl-detail .sl-key {
  border: none;
  background: transparent;
  padding: 0;
  font-size: 0.7em;
  letter-spacing: 0.2em;
  color: var(--sl-accent);
  font-weight: 700;
  border-bottom: 1px dotted var(--sl-border-thin);
  align-self: start;
}
& .sl-acc-body .sl-thought {
  border-top: none;
  border-bottom: none;
  border-left: 4px solid var(--sl-accent);
  padding: 6px 12px;
  background: transparent;
}

/* —— 角色栏 + 小总结之间的报纸粗双线分隔 —— */
& .sl-news-rule {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 18px 0;
  position: relative;
}
& .sl-news-rule::before,
& .sl-news-rule::after {
  content: "";
  flex: 1;
  border-top: 4px double var(--sl-border);
}
& .sl-news-rule .sl-news-rule-mark {
  padding: 0 12px;
  font-family: var(--sl-font-display);
  color: var(--sl-accent);
  font-size: 1.1em;
}

/* —— 小总结 (memory) —— */
& .sl-section-memory .sl-memory-summary {
  border: none;
  border-top: 2px solid var(--sl-border);
  border-bottom: 2px solid var(--sl-border);
  border-left: none;
  background: transparent;
  padding: 8px 4px;
  justify-content: space-between;
}
& .sl-section-memory .sl-memory-summary .sl-section-title {
  font-size: 1.15em;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
& .sl-vol-num {
  font-family: var(--sl-font-display);
  font-style: italic;
  font-weight: 900;
  font-size: 1.15em;
  margin: 0 6px;
  color: var(--sl-accent);
}

/* —— 小总结 body：multi-column 报纸排版，长短不一时自动均衡 —— */
& .sl-memory-body {
  margin-top: 14px;
  column-count: 3;
  column-gap: 16px;
  column-rule: 1px solid var(--sl-border-thin);
}
& .sl-block {
  break-inside: avoid;
  display: block;
  border: 1px solid var(--sl-border);
  background: transparent;
  padding: 10px 12px 12px;
  margin: 0 0 14px;
  position: relative;
}
& .sl-block-title {
  font-family: var(--sl-font-display);
  font-size: 0.82em;
  font-weight: 900;
  letter-spacing: 0.22em;
  color: var(--sl-accent);
  text-transform: uppercase;
  margin: 0 0 8px;
  padding-bottom: 4px;
  border-bottom: 2px solid var(--sl-border);
}
& .sl-block-body {
  text-align: justify;
  hyphens: auto;
  font-size: 0.95em;
  line-height: 1.7;
}
/* 首字下沉：纯文本类的 block（不包括 List，List 是项目符号列表） */
& .sl-block-worldstate .sl-block-body::first-letter,
& .sl-block-currentTask .sl-block-body::first-letter,
& .sl-block-plot .sl-block-body::first-letter,
& .sl-block-psychology .sl-block-body::first-letter,
& .sl-block-database .sl-block-body::first-letter {
  font-family: var(--sl-font-display);
  font-size: 2.8em;
  font-weight: 900;
  float: left;
  line-height: 0.85;
  padding: 3px 7px 0 0;
  color: var(--sl-accent);
}
/* List 类：保持紧凑列表，不下沉 */
& .sl-block-list .sl-block-body {
  font-size: 0.92em;
  line-height: 1.65;
}

/* —— list 按角色拆分:在 multi-column 下让整块占满全宽,避免被列再切 —— */
& .sl-block-list {
  column-span: all;
}
& .sl-block-list .sl-list-grid {
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-top: 6px;
}
& .sl-block-list .sl-list-char {
  border-left: 2px solid var(--sl-accent);
  background: var(--sl-key-bg);
  padding: 6px 10px;
}
& .sl-block-list .sl-list-char-name {
  font-family: var(--sl-font-display);
  font-size: 0.78em;
  letter-spacing: 0.18em;
  color: var(--sl-accent);
  margin-bottom: 6px;
  border-bottom: 1px dotted var(--sl-border-thin);
  padding-bottom: 3px;
  text-transform: uppercase;
}
& .sl-block-list .sl-list-char-items {
  padding-left: 20px;
  font-size: 0.92em;
}

/* —— 底部 colophon —— */
& .sl-news-colophon {
  display: block;
  text-align: center;
  border-top: 4px double var(--sl-border);
  margin-top: 16px;
  padding-top: 8px;
  font-family: var(--sl-font-label);
  font-size: 0.72em;
  letter-spacing: 0.26em;
  color: var(--sl-muted);
  font-variant: small-caps;
}

@media (max-width: 1100px) {
  & .sl-memory-body {
    column-count: 2;
  }
}

@media (max-width: 760px) {
  & .sl-card-title {
    font-size: 1.6em;
  }
  & .sl-memory-body {
    column-count: 1;
    column-rule: none;
  }
  & .sl-acc-body .sl-detail {
    grid-template-columns: 1fr;
    gap: 4px;
  }
  & .sl-acc-body .sl-detail .sl-key {
    display: block;
    width: 100%;
    white-space: normal;
    padding-bottom: 2px;
  }
}
`;

/* ============ 行动选项 (Optio / Branch) ============ */
export const NEWS_BRANCH_EXTRA_CSS = `
& {
  border: 2px solid var(--sl-border);
  box-shadow: var(--sl-shadow);
}
& .sl-card-inner {
  padding: 16px 20px 12px;
  border: 1px solid var(--sl-border-thin);
}

/* 标题：报纸小专栏标题 */
& .sl-card-head {
  border-bottom: 2px solid var(--sl-border);
  padding-bottom: 6px;
  margin-bottom: 12px;
  align-items: baseline;
  flex-wrap: nowrap;
}
& .sl-card-title {
  font-family: var(--sl-font-display);
  font-size: 1.2em;
  font-weight: 900;
  letter-spacing: 0.18em;
  color: var(--sl-accent);
  text-transform: uppercase;
}
& .sl-card-sub {
  font-style: italic;
  font-size: 0.85em;
  letter-spacing: 0.06em;
  color: var(--sl-muted);
}

/* 选项列表：保留按钮列表布局，不向报纸专栏靠拢 */
& .sl-branch-list {
  gap: 8px;
}
& .sl-branch-btn {
  border: 1px solid var(--sl-border-thin);
  border-left: none;
  background: transparent;
  padding: 10px 12px 10px 4px;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
}
& .sl-branch-btn:hover {
  background: var(--sl-hover);
  border-color: var(--sl-accent);
  border-left: none;
  transform: none;
}

/* A/B/C 首字下沉风格 */
& .sl-branch-key {
  width: auto;
  height: auto;
  border: none;
  background: transparent;
  padding: 0 6px 0 4px;
  font-family: var(--sl-font-display);
  font-size: 2.2em;
  font-weight: 900;
  line-height: 0.85;
  color: var(--sl-accent);
  text-transform: uppercase;
  align-self: center;
  letter-spacing: 0;
}
& .sl-branch-text {
  font-family: var(--sl-font-serif);
  font-size: 0.98em;
  line-height: 1.55;
  color: var(--sl-text);
}
& .sl-branch-arrow {
  color: var(--sl-accent);
  font-size: 0.9em;
}

/* 底部脚注 */
& .sl-card-foot {
  font-family: var(--sl-font-label);
  font-size: 0.7em;
  letter-spacing: 0.24em;
  color: var(--sl-muted);
  border-top: 1px solid var(--sl-border-thin);
  padding-top: 6px;
  margin-top: 10px;
  font-variant: small-caps;
}

@media (max-width: 760px) {
  /* 窄屏：避免 OPTION 标题与副标题在同一行挤压 */
  & .sl-card-head {
    flex-wrap: wrap;
    gap: 6px;
  }
  & .sl-card-title {
    white-space: nowrap;
    letter-spacing: 0.1em;
  }
}
`;
