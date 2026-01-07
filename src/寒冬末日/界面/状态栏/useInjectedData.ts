type InjectedData = {
  raw: string;
  options: string[];
};

const __edenInjectedDataDebugOnce = new Set<number>();
const __edenInjectedDataWarnOnce = new Set<number>();

// 要过滤/隐藏的自定义标签列表（绘图思维链等）
// 注意：避免使用 `\\b`（JSON 会将 `\\b` 反转义为 backspace），使用更稳健的“空白或 >”边界。
const HIDDEN_BLOCK_TAGS = ['imgthink', 'drawprompt', 'imageprompt', 'genimage'];

function hasTag(raw: string, tagName: string): boolean {
  return new RegExp('<' + tagName + '(?:\\s[^>]*)?>', 'i').test(raw);
}

function stripHiddenBlocks(raw: string): string {
  let cleaned = raw;
  for (const tag of HIDDEN_BLOCK_TAGS) {
    // 匹配 <tag ...>...</tag>（不区分大小写，非贪婪匹配）
    cleaned = cleaned.replace(new RegExp('<' + tag + '(?:\\s[^>]*)?>[\\s\\S]*?<\\/' + tag + '>', 'gi'), '');
  }
  return cleaned;
}

function parseInjectedText(raw: string): InjectedData {
  const cleaned = stripHiddenBlocks(raw);

  const optionMatch = cleaned.match(/(<option(?:\s[^>]*)?>(?![\s\S]*?<option(?:\s[^>]*)?>)[\s\S]*?(?:<\/option>|$))/i);

  const optionsRaw = optionMatch
    ? optionMatch[1]
        .replace(/^<option(?:\s[^>]*)?>/i, '')
        .replace(/<\/option>\s*$/i, '')
        .trim()
    : '';

  const options = optionsRaw
    ? optionsRaw
        .split(/\r?\n/)
        .map((line: string) => line.trim())
        .filter(Boolean)
    : [];

  return { raw, options };
}

function fetchFromCurrentMessage(isDebug: boolean): InjectedData | null {
  try {
    // 仅解析“当前 iframe 所在楼层”的消息文本
    const messageId = getCurrentMessageId();
    const msg = getChatMessages(messageId)[0];
    const raw = (msg as any)?.message ?? (msg as any)?.data?.extra_text ?? (msg as any)?.text ?? '';
    if (!raw.trim()) return null;

    const parsed = parseInjectedText(raw);

    const rawHasContent = hasTag(raw, 'content') || hasTag(raw, 'game');
    const rawHasOption = hasTag(raw, 'option');

    if (isDebug && !__edenInjectedDataDebugOnce.has(messageId)) {
      __edenInjectedDataDebugOnce.add(messageId);
      console.debug('[状态栏][InjectedData] 当前楼层解析', {
        messageId,
        rawLen: raw.length,
        rawHasContent,
        rawHasOption,
        optionsCount: parsed.options.length,
        optionsPreview: parsed.options.slice(0, 3),
      });
    }

    // 常见误用：只输出了 <option> 没有 <content>，正文可能为空或显示不完整
    if (!rawHasContent && rawHasOption && !__edenInjectedDataWarnOnce.has(messageId)) {
      __edenInjectedDataWarnOnce.add(messageId);
      console.warn(
        '[状态栏][InjectedData] 未检测到 <content>/<game>，仅检测到 <option>；建议将正文包在 <content>/<game> 以确保正文显示稳定。',
        {
          messageId,
          optionsCount: parsed.options.length,
        },
      );
    }

    if (!parsed.raw.trim() && parsed.options.length === 0) return null;
    return parsed;
  } catch (e) {
    console.error('[InjectedData] 错误:', e);
    return null;
  }
}

function getMockData(): InjectedData {
  return {
    raw: `
<content>
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
</content>
`,
    options: ['前往尖叫声传来的方向查看', '立刻寻找房间躲避', '呼叫其他幸存者支援'],
  };
}

export function useInjectedData() {
  const raw = ref<string>('');
  const options = ref<string[]>([]);

  // 开发模式检测 (通过 URL 查询参数)
  const search = new URLSearchParams(window.location.search);
  const isDevMode = search.has('dev');
  const isDebug = isDevMode || search.has('debug');

  const refresh = () => {
    if (isDevMode) {
      const mockData = getMockData();
      raw.value = mockData.raw;
      options.value = mockData.options;
      return;
    }

    const fromMsg = fetchFromCurrentMessage(isDebug); // 同步调用
    if (fromMsg) {
      raw.value = fromMsg.raw;
      options.value = fromMsg.options;
      return;
    }
  };

  onMounted(() => {
    refresh();
  });

  return { raw, options, refresh };
}
