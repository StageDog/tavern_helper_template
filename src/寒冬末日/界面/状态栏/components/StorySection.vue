<template>
  <section class="section">
    <h2 class="section-title">📖 正文剧情 📖</h2>
    <div class="content-text">
      <template v-for="seg in segments" :key="seg.key">
        <img
          v-if="seg.isImage"
          :src="seg.imageUrl"
          :alt="seg.altText"
          class="story-image"
          @load="scheduleResize"
          @error="scheduleResize"
        />
        <table v-else-if="seg.isTable" class="markdown-table">
          <thead>
            <tr>
              <th v-for="(header, idx) in seg.tableHeaders" :key="idx">{{ header }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rowIdx) in seg.tableRows" :key="rowIdx">
              <!-- eslint-disable-next-line vue/no-v-html -->
              <td v-for="(cell, cellIdx) in row" :key="cellIdx" v-html="formatTableCell(cell)"></td>
            </tr>
          </tbody>
        </table>
        <div v-else-if="seg.isSystem" class="system-message">
          <pre>{{ seg.text }}</pre>
        </div>
        <pre v-else-if="seg.className === 'image-prompt'" class="image-prompt">{{ seg.text }}</pre>
        <span v-else :class="seg.className">{{ seg.text }}</span>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
type Segment = {
  key: string;
  text?: string;
  className?: string;
  isImage?: boolean;
  imageUrl?: string;
  altText?: string;
  isTable?: boolean;
  tableHeaders?: string[];
  tableRows?: string[][];
  isSystem?: boolean;
};

const props = defineProps<{
  content: string;
}>();

const segments = computed<Segment[]>(() => {
  const rawText = props.content ?? '';
  const text = normalizeStoryText(rawText);
  if (!text.trim()) {
    return [{ key: 'empty', text: '(暂无正文)' }];
  }

  return buildSegments(text);
});

let __resizeScheduled = false;
function scheduleResize() {
  if (__resizeScheduled) return;
  __resizeScheduled = true;
  requestAnimationFrame(() => {
    __resizeScheduled = false;
    window.dispatchEvent(new Event('resize'));
  });
}

function normalizeStoryText(raw: string): string {
  // 1) 隐藏绘图思维链
  // 2) 隐藏 <image> 包裹标签，但保留其中的 image###...### 供生图插件提取
  // 3) 归一化空白行，减少图片/提示词前后的“被动拉高”
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/<imgthink>[\s\S]*?<\/imgthink>/gi, '')
    .replace(/<\/?image(?:\s[^>]*)?>/gi, '')
    .replace(/\n{3,}/g, '\n\n');
}

type TableBlock = {
  start: number;
  end: number;
  headers: string[];
  rows: string[][];
};

function buildSegments(text: string): Segment[] {
  // 系统消息块：>>> content <<<（可带 **）
  const systemBlockRe = /\*{0,2}>>>([\s\S]*?)<<<\*{0,2}/g;
  // 图片提示词块：image###prompt###（保留供插件提取）
  const imagePromptRe = /image###([\s\S]*?)###/g;
  // markdown 图片：![](url)
  const mdImageRe = /!\[(.*?)\]\((.*?)\)/g;
  // 单行系统提示：伊甸：... / 系统：... / System: ...
  const systemLineRe = /^(?:伊甸|系统|System)[：:].*$/gm;

  const out: Segment[] = [];
  let cursor = 0;
  let segId = 0;

  const pushInline = (chunk: string) => {
    const normalized = normalizeInlineChunk(chunk);
    if (!normalized) return;
    for (const seg of splitInline(normalized, () => `t${segId++}`)) out.push(seg);
  };

  while (cursor < text.length) {
    const nextTable = findNextTable(text, cursor);
    const nextSystemBlock = execFrom(systemBlockRe, text, cursor);
    const nextImagePrompt = execFrom(imagePromptRe, text, cursor);
    const nextMdImage = execFrom(mdImageRe, text, cursor);
    const nextSystemLine = execFrom(systemLineRe, text, cursor);

    const candidates: Array<
      | { kind: 'table'; start: number; end: number; table: TableBlock }
      | { kind: 'systemBlock'; start: number; end: number; content: string }
      | { kind: 'imagePrompt'; start: number; end: number; raw: string }
      | { kind: 'mdImage'; start: number; end: number; alt: string; url: string }
      | { kind: 'systemLine'; start: number; end: number; content: string }
    > = [];

    if (nextTable) candidates.push({ kind: 'table', start: nextTable.start, end: nextTable.end, table: nextTable });
    if (nextSystemBlock)
      candidates.push({
        kind: 'systemBlock',
        start: nextSystemBlock.index ?? 0,
        end: (nextSystemBlock.index ?? 0) + nextSystemBlock[0].length,
        content: nextSystemBlock[1] ?? '',
      });
    if (nextImagePrompt)
      candidates.push({
        kind: 'imagePrompt',
        start: nextImagePrompt.index ?? 0,
        end: (nextImagePrompt.index ?? 0) + nextImagePrompt[0].length,
        raw: nextImagePrompt[0],
      });
    if (nextMdImage)
      candidates.push({
        kind: 'mdImage',
        start: nextMdImage.index ?? 0,
        end: (nextMdImage.index ?? 0) + nextMdImage[0].length,
        alt: nextMdImage[1] ?? '',
        url: nextMdImage[2] ?? '',
      });
    if (nextSystemLine)
      candidates.push({
        kind: 'systemLine',
        start: nextSystemLine.index ?? 0,
        end: (nextSystemLine.index ?? 0) + nextSystemLine[0].length,
        content: nextSystemLine[0] ?? '',
      });

    if (candidates.length === 0) {
      pushInline(text.slice(cursor));
      break;
    }

    // 选择最靠前的块；同位置时按优先级：table > systemBlock > imagePrompt > mdImage > systemLine
    const priority: Record<string, number> = { table: 1, systemBlock: 2, imagePrompt: 3, mdImage: 4, systemLine: 5 };
    candidates.sort((a, b) => (a.start !== b.start ? a.start - b.start : priority[a.kind] - priority[b.kind]));
    const pick = candidates[0];

    if (pick.start > cursor) {
      pushInline(text.slice(cursor, pick.start));
    }

    if (pick.kind === 'table') {
      out.push({
        key: `table${segId++}`,
        isTable: true,
        tableHeaders: pick.table.headers,
        tableRows: pick.table.rows,
      });
    } else if (pick.kind === 'systemBlock') {
      out.push({
        key: `system${segId++}`,
        isSystem: true,
        className: 'system-message',
        text: pick.content.trim(),
      });
    } else if (pick.kind === 'imagePrompt') {
      out.push({
        key: `imgprompt${segId++}`,
        className: 'image-prompt',
        text: pick.raw,
      });
    } else if (pick.kind === 'mdImage') {
      out.push({
        key: `img${segId++}`,
        isImage: true,
        imageUrl: pick.url,
        altText: pick.alt,
        text: pick.url,
      });
    } else if (pick.kind === 'systemLine') {
      out.push({
        key: `system${segId++}`,
        isSystem: true,
        className: 'system-message',
        text: pick.content.trim(),
      });
    }

    cursor = Math.max(cursor, pick.end);
  }

  return out.length ? out : [{ key: 'empty', text: '(暂无正文)' }];
}

function normalizeInlineChunk(chunk: string): string {
  // 收敛块与块之间的空白（尤其是生图结果插入后常出现的多余空行）
  const normalized = chunk.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n');
  if (!normalized.trim()) return '';
  return normalized;
}

function execFrom(re: RegExp, text: string, from: number): RegExpExecArray | null {
  re.lastIndex = from;
  return re.exec(text);
}

function splitInline(chunk: string, nextKey: () => string): Segment[] {
  if (!chunk) return [];

  // 需求：仅保留【】高亮；所有中英文引号/单引号都作为对话高亮
  const inlineRe = /【[^】\n]+】|“[^”\n]+”|‘[^’\n]+’|"[^"\n]+"|'[^'\n]+'/g;
  const parts: Segment[] = [];
  let cursor = 0;

  for (const m of chunk.matchAll(inlineRe)) {
    const start = m.index ?? 0;
    const raw = m[0] ?? '';
    if (start > cursor) {
      parts.push({ key: nextKey(), text: chunk.slice(cursor, start) });
    }

    const isBracket = raw.startsWith('【');
    parts.push({ key: nextKey(), text: raw, className: isBracket ? 'inline-bracket' : 'dialog-text' });
    cursor = start + raw.length;
  }

  if (cursor < chunk.length) {
    parts.push({ key: nextKey(), text: chunk.slice(cursor) });
  }

  return parts;
}

function findNextTable(text: string, from: number): TableBlock | null {
  // 从 from 之后的下一行开始找，避免从行中间误判
  let i = text.lastIndexOf('\n', Math.max(0, from - 1)) + 1;
  if (i < from) {
    const nl = text.indexOf('\n', from);
    if (nl === -1) return null;
    i = nl + 1;
  }

  while (i < text.length) {
    const lineEnd = text.indexOf('\n', i);
    const end = lineEnd === -1 ? text.length : lineEnd;
    const line = text.slice(i, end);
    const trimmed = line.trim();

    if (trimmed.startsWith('|')) {
      const headerLine = trimmed;

      // 下一行必须是分隔行
      const nextLineStart = end + 1;
      if (nextLineStart >= text.length) return null;
      const nextLineEnd = text.indexOf('\n', nextLineStart);
      const nextEnd = nextLineEnd === -1 ? text.length : nextLineEnd;
      const delimiterLine = text.slice(nextLineStart, nextEnd).trim();

      if (isMarkdownTableDelimiter(delimiterLine)) {
        const headers = splitMarkdownTableRow(headerLine);
        const rows: string[][] = [];

        let rowStart = nextEnd + 1;
        let tableEnd = nextEnd;
        while (rowStart < text.length) {
          const rowLineEnd = text.indexOf('\n', rowStart);
          const rowEnd = rowLineEnd === -1 ? text.length : rowLineEnd;
          const rowLine = text.slice(rowStart, rowEnd);
          const rowTrimmed = rowLine.trim();

          if (!rowTrimmed.startsWith('|')) break;

          const cells = splitMarkdownTableRow(rowTrimmed);
          rows.push(normalizeRowCells(cells, headers.length));
          tableEnd = rowEnd;
          rowStart = rowEnd + 1;
        }

        if (headers.length >= 2) {
          return {
            start: i,
            end: tableEnd,
            headers,
            rows: rows.length ? rows : [normalizeRowCells([], headers.length)],
          };
        }
      }
    }

    i = end + 1;
  }

  return null;
}

function isMarkdownTableDelimiter(line: string): boolean {
  // | --- | :---: | ---: | 等
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function splitMarkdownTableRow(row: string): string[] {
  let s = row.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|')) s = s.slice(0, -1);

  const cells: string[] = [];
  let buf = '';
  let escaped = false;

  for (let idx = 0; idx < s.length; idx++) {
    const ch = s[idx];
    if (escaped) {
      buf += ch;
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      escaped = true;
      continue;
    }
    if (ch === '|') {
      cells.push(buf.trim());
      buf = '';
      continue;
    }
    buf += ch;
  }

  cells.push(buf.trim());
  return cells;
}

function normalizeRowCells(cells: string[], width: number): string[] {
  const out = cells.slice(0, width);
  while (out.length < width) out.push('');
  return out;
}

// 格式化表格单元格（支持粗体、斜体等）- 安全处理防止 XSS
function formatTableCell(cell: string): string {
  // 先转义 HTML 特殊字符
  const safe = cell.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // 再处理支持的格式
  return safe
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/【([^】\n]+)】/g, '<span class="inline-bracket">【$1】</span>')
    .replace(/“([^”\n]+)”/g, '<span class="dialog-text">“$1”</span>')
    .replace(/‘([^’\n]+)’/g, '<span class="dialog-text">‘$1’</span>')
    .replace(/"([^"\n]+)"/g, '<span class="dialog-text">"$1"</span>')
    .replace(/'([^'\n]+)'/g, '<span class="dialog-text">\'$1\'</span>');
}
</script>

<style scoped>
.markdown-table {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
  font-size: 0.9em;
  background-color: var(--bg-medium);
  border-radius: 8px;
  overflow: hidden;
}

.markdown-table th,
.markdown-table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.markdown-table th {
  background-color: var(--bg-dark);
  color: var(--accent-gold);
  font-weight: bold;
  font-size: 0.85em;
}

.markdown-table td {
  color: var(--text-color);
  line-height: 1.5;
}

.markdown-table td :deep(strong) {
  color: var(--text-strong);
}

.markdown-table td :deep(em) {
  color: var(--accent-blue);
}

.markdown-table td :deep(.inline-bracket) {
  color: var(--accent-blue);
  font-weight: 600;
}

.markdown-table tr:last-child td {
  border-bottom: none;
}

.markdown-table tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.03);
}

/* 系统消息样式（伊甸：消息、>>> 消息 <<<） */
.system-message {
  background-color: rgba(0, 180, 216, 0.1);
  border: 1px solid rgba(0, 180, 216, 0.4);
  border-radius: 8px;
  padding: 12px 16px;
  margin: 12px 0;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
  line-height: 1.6;
  color: var(--accent-cyan, #00b4d8);
  overflow-x: auto;
}

.system-message pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* 【系统】消息样式 - 黄色 */
.system-hint {
  color: var(--accent-gold, #f1fa8c);
  font-weight: 500;
}

/* 【角色名】样式 - 蓝色高亮 */
.character-name {
  color: var(--accent-blue, #bd93f9);
  font-weight: 600;
}

/* 图片提示词样式 - 代码块形式保留供插件提取 */
.image-prompt {
  display: block;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 8px 12px;
  margin: 8px 0;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.85em;
  color: var(--accent-gold);
  overflow-x: auto;
}

.inline-bracket {
  color: var(--accent-blue, #bd93f9);
  font-weight: 600;
}
</style>
