<template>
  <section class="section">
    <h2 class="section-title">📖 正文剧情 📖</h2>
    <div class="content-text">
      <template v-for="seg in segments" :key="seg.key">
        <img v-if="seg.isImage" :src="seg.imageUrl" :alt="seg.altText" class="story-image" />
        <table v-else-if="seg.isTable" class="markdown-table">
          <thead>
            <tr>
              <th v-for="(header, idx) in seg.tableHeaders" :key="idx">{{ header }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rowIdx) in seg.tableRows" :key="rowIdx">
              // eslint-disable-next-line vue/no-v-html
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
  const text = props.content ?? '';
  if (!text.trim()) {
    return [{ key: 'empty', text: '(暂无正文)' }];
  }

  // 表格正则：匹配完整的 markdown 表格
  const tablePattern = /(?:^|\n)(\|[\s\S]*?\|)(?:\n\|[\s\S]*?\|)*/g;

  // 系统消息正则：>>> content <<< 格式（可带可选的 ** 标记）
  const systemPattern = /(\*{0,2}>>>(?:[\s\S]*?)<<<\*{0,2})/g;

  // 图片提示词正则：image###prompt### - 保留格式供生图插件提取
  const imagePromptPattern = /image###([\s\S]*?)###/g;

  // 绘图思考标签：<imgthink>...</imgthink> - 隐藏不显示
  const imageThinkPattern = /<imgthink>[\s\S]*?<\/imgthink>/g;

  // 通用正则：匹配图片、对话、思考、系统提示、伊甸/系统发言
  const pattern = /!\[(.*?)\]\((.*?)\)|"([^"]+)"|\*([^*]+)\*|【(.*?)】|(?:^|\n)((?:伊甸|系统|System)[：:].*?)(?=$|\n)/g;
  const result: Segment[] = [];

  let lastIndex = 0;

  // 先处理表格
  for (const tableMatch of text.matchAll(tablePattern)) {
    const index = tableMatch.index ?? 0;

    // 处理表格之前的普通文本
    if (index > lastIndex) {
      result.push({ key: `t${result.length}`, text: text.slice(lastIndex, index) });
    }

    // 解析表格
    const tableContent = tableMatch[0];
    const rows = tableContent
      .trim()
      .split('\n')
      .filter(row => row.trim().startsWith('|'));

    if (rows.length >= 2) {
      // 去掉分隔行（|---|---）
      const dataRows = rows.filter(row => !row.includes('---') && !row.includes('---'));

      if (dataRows.length >= 1) {
        const headers = parseTableRow(dataRows[0]);
        const tableRows = dataRows.slice(1).map(parseTableRow);

        result.push({
          key: `table${result.length}`,
          isTable: true,
          tableHeaders: headers,
          tableRows: tableRows,
        });
      }
    }

    lastIndex = index + tableMatch[0].length;
  }

  // 处理绘图思考标签 <imgthink> - 隐藏不显示
  for (const thinkMatch of text.matchAll(imageThinkPattern)) {
    const index = thinkMatch.index ?? 0;

    // 处理之前的内容
    if (index > lastIndex) {
      result.push({ key: `t${result.length}`, text: text.slice(lastIndex, index) });
    }

    // 跳过，不添加到结果中（隐藏）
    lastIndex = index + thinkMatch[0].length;
  }

  // 处理图片提示词 image###prompt### - 保留格式作为代码块显示
  for (const imgMatch of text.matchAll(imagePromptPattern)) {
    const index = imgMatch.index ?? 0;

    // 处理之前的内容
    if (index > lastIndex) {
      result.push({ key: `t${result.length}`, text: text.slice(lastIndex, index) });
    }

    // 作为代码块保留，供生图插件提取
    result.push({
      key: `imgprompt${result.length}`,
      text: imgMatch[0],
      className: 'image-prompt',
    });

    lastIndex = index + imgMatch[0].length;
  }

  // 处理系统消息（>>> content <<<）
  for (const systemMatch of text.matchAll(systemPattern)) {
    const index = systemMatch.index ?? 0;

    // 处理公告之前的普通文本
    if (index > lastIndex) {
      result.push({ key: `t${result.length}`, text: text.slice(lastIndex, index) });
    }

    // 清理内容：移除周围的 >>> 和 <<<，以及可选的 **
    let content = systemMatch[1];
    content = content.replace(/^\*{0,2}>>>\s*/, '').replace(/\s*<<<\*{0,2}$/, '');

    result.push({
      key: `system${result.length}`,
      text: content,
      isSystem: true,
      className: 'system-message',
    });

    lastIndex = index + systemMatch[0].length;
  }

  // 处理剩余的非表格、非系统消息内容
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex);
    for (const match of remainingText.matchAll(pattern)) {
      const index = (match.index ?? 0) + lastIndex;

      // 处理匹配项之前的普通文本
      if (index > lastIndex) {
        result.push({ key: `t${result.length}`, text: remainingText.slice(lastIndex - lastIndex, match.index) });
      }

      if (match[2] != null) {
        // 图片 ![]() - match[1]可能是alt text（可空），match[2]是URL
        result.push({
          key: `img${result.length}`,
          text: match[0],
          isImage: true,
          altText: match[1] ?? '',
          imageUrl: match[2],
        });
      } else if (match[6] != null) {
        // 伊甸：消息 或 系统：消息（统一为系统消息样式）
        result.push({
          key: `system${result.length}`,
          text: match[6],
          isSystem: true,
          className: 'system-message',
        });
      } else if (match[5] === '系统') {
        // 【系统】消息 - 黄色单独样式
        result.push({
          key: `t${result.length}`,
          text: '【系统】消息',
          className: 'system-hint',
        });
      } else if (match[5] != null) {
        // 【角色名】- 蓝色高亮样式
        result.push({
          key: `t${result.length}`,
          text: `【${match[5]}】`,
          className: 'character-name',
        });
      } else if (match[3] != null) {
        // "中文对话"
        result.push({
          key: `t${result.length}`,
          text: `“${match[3]}"`,
          className: 'dialog-text',
        });
      } else if (match[4] != null) {
        // "英文对话"
        result.push({
          key: `t${result.length}`,
          text: `"${match[4]}"`,
          className: 'dialog-text',
        });
      }

      lastIndex = index + match[0].length;
    }

    if (lastIndex < text.length) {
      result.push({ key: `t${result.length}`, text: text.slice(lastIndex) });
    }
  }

  return result;
});

// 解析表格行
function parseTableRow(row: string): string[] {
  return row
    .trim()
    .split('|')
    .slice(1, -1) // 去掉首尾的空字符串
    .map(cell => cell.trim());
}

// 格式化表格单元格（支持粗体、斜体等）- 安全处理防止 XSS
function formatTableCell(cell: string): string {
  // 先转义 HTML 特殊字符
  const safe = cell
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  // 再处理支持的格式
  return safe
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/【(.*?)】/g, '【$1】');
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
</style>
