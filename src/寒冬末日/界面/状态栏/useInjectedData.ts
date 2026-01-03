type InjectedData = {
  content: string;
  options: string[];
};

// 声明全局函数类型
declare function getChatMessages(
  range: string | number,
): Array<{ data?: { extra_text?: string }; text?: string; message?: string }>;

// 要过滤的自定义标签列表（绘图提示词等）
const CUSTOM_BLOCK_TAGS = ['imgthink', 'drawprompt', 'imageprompt', 'genimage'];

function cleanCustomBlocks(raw: string): string {
  let cleaned = raw;
  for (const tag of CUSTOM_BLOCK_TAGS) {
    // 匹配 <tag>...</tag>（不区分大小写，非贪婪匹配，避免跨标签匹配）
    // 使用字符串拼接避免模板字符串在打包时的转义问题
    const openTag = '<' + tag + '>';
    const closeTag = '<' + '/' + tag + '>';
    cleaned = cleaned.replace(new RegExp(openTag + '[^<]*' + closeTag, 'gi'), '');
  }
  return cleaned;
}

function parseWithDom(raw: string): InjectedData | null {
  if (!raw.trim()) return null;
  try {
    // 先过滤自定义块
    const cleaned = cleanCustomBlocks(raw);
    const doc = new DOMParser().parseFromString(cleaned, 'text/html');
    const contentEl = doc.querySelector('content');
    const optionEl = doc.querySelector('option');
    if (!contentEl && !optionEl) return null;

    const content = contentEl?.textContent?.trim() ?? '';
    const optionsRaw = optionEl?.textContent?.trim() ?? '';
    const options = optionsRaw
      ? optionsRaw
          .split('\n')
          .map((line: string) => line.trim())
          .filter(Boolean)
      : [];

    return { content, options };
  } catch {
    return null;
  }
}

function parseInjectedText(raw: string): InjectedData {
  // 先过滤自定义块
  const cleaned = cleanCustomBlocks(raw);

  // 按原版规则：取最后一个 <content>...</content>（或以 </option> / 结尾收束）
  const contentMatch = cleaned.match(/(<content>(?!.*<content>)[\s\S]*?(?:<\/content>|<\/option>|$))/i);
  const optionMatch = cleaned.match(/(<option>(?!.*<option>)[\s\S]*?(?:<\/option>|$))/i);

  const content = contentMatch
    ? contentMatch[1]
        .replace(/<\/?content>/gi, '')
        .replace(/<\/option>/gi, '')
        .trim()
    : '';
  const optionsRaw = optionMatch ? optionMatch[1].replace(/<\/?option>/gi, '').trim() : '';

  const options = optionsRaw
    ? optionsRaw
        .split('\n')
        .map((line: string) => line.trim())
        .filter(Boolean)
    : [];

  return { content, options };
}

function fetchFromMessages(): InjectedData | null {
  try {
    // getChatMessages 需要 range 字符串参数，如 '0-{{lastMessageId}}'
    const msgs = getChatMessages('0-{{lastMessageId}}');
    // 获取最后一条消息（当前楼层的消息），而不是第一条
    const lastMsg = msgs?.[msgs.length - 1];

    // 优先读取 message 字段（AI 输出内容），其次是 data.extra_text 和 text
    const raw = lastMsg?.message ?? lastMsg?.data?.extra_text ?? lastMsg?.text ?? '';

    if (!raw) return null;

    const domResult = parseWithDom(raw);
    if (domResult) return domResult;

    return parseInjectedText(raw);
  } catch (e) {
    console.error('[InjectedData] 错误:', e);
    return null;
  }
}

function getMockData(): InjectedData {
  return {
    content: `
<p>
  <strong>【当前剧情】</strong>
  你和幸存者们正在探索一栋废弃医院的二楼，寻找可用的医疗物资。空气中弥漫着消毒水和腐朽混合的怪异气味，寂静得令人不安。
</p>
<p>
  <em>"小心点，这里可能还有"那些东西"。"</em> 浅见亚美紧握着手中的消防斧，低声提醒道。
</p>
<p>
  突然，一声刺耳的尖叫从走廊尽头传来，打破了沉寂。
</p>
`,
    options: ['前往尖叫声传来的方向查看', '立刻寻找房间躲避', '呼叫其他幸存者支援'],
  };
}

export function useInjectedData() {
  const content = ref<string>('');
  const options = ref<string[]>([]);

  // 开发模式检测 (通过 URL 查询参数)
  const isDevMode = new URLSearchParams(window.location.search).has('dev');

  const refresh = () => {
    if (isDevMode) {
      const mockData = getMockData();
      content.value = mockData.content;
      options.value = mockData.options;
      return;
    }

    const fromMsg = fetchFromMessages(); // 同步调用
    if (fromMsg) {
      content.value = fromMsg.content;
      options.value = fromMsg.options;
      return;
    }

    const el = document.getElementById('injected-data-container');
    const raw = el?.textContent ?? '';
    const parsed = parseInjectedText(raw);
    content.value = parsed.content;
    options.value = parsed.options;
  };

  let observer: MutationObserver | null = null;

  onMounted(() => {
    refresh();
    // 在生产环境中才监听 DOM 变化
    if (!isDevMode) {
      const el = document.getElementById('injected-data-container');
      if (!el) return;

      observer = new MutationObserver(() => refresh());
      observer.observe(el, { characterData: true, childList: true, subtree: true });
    }
  });

  onBeforeUnmount(() => {
    observer?.disconnect();
    observer = null;
  });

  return { content, options, refresh };
}
