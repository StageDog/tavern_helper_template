// ============================================================================
// 互动地图 —— Pinia Store (状态管理 + 持久化)
// ============================================================================
import { defaultMapPack } from './defaultPack';
import { type CSSPreset, type InstalledPack, type MapLayer, type Pin, MapPackSchema, StoreStateSchema } from './types';

/** 示例 CSS —— 首次打开样式设置时展示 */
export const SAMPLE_CSS = `/* ─── 互动地图自定义样式（示例）──────────────────
 * 这里的 CSS 只作用于地图面板 iframe，不会影响酒馆主界面
 * 由于组件内置样式带有 Vue scoped 权重，自定义时建议加 !important
 * 或使用更高特异性选择器（如 .imap-panel .imap-btn）
 * ─────────────────────────────────────────────── */

/* 面板背景 —— 改为偏冷的深蓝灰 */
.imap-panel {
  background: #141820 !important;
  border-color: rgba(120, 150, 200, 0.45) !important;
}

/* 标题栏半透明化 */
.imap-header {
  background: rgba(120, 150, 200, 0.06) !important;
}

/* 主按钮换成冷色调 */
.imap-btn {
  background: rgba(120, 150, 200, 0.15) !important;
  border-color: rgba(120, 150, 200, 0.35) !important;
  color: #8fb3d9 !important;
}
.imap-btn:hover:not(:disabled) {
  background: rgba(120, 150, 200, 0.25) !important;
}

/* Pin 标签字体加大 */
.imap-pin-label {
  font-size: 12px !important;
}
`;

export const useMapStore = defineStore('interactiveMap', () => {
  // ── 状态 ────────────────────────────────────────────
  const installedPacks = ref<InstalledPack[]>([]);
  const activePackIndex = ref(0);
  const currentMapId = ref('');
  const mapHistory = ref<string[]>([]);
  const panelVisible = ref(false);

  // 出行设置：开启则直接 /send；关闭则写入输入框由用户确认
  const shouldSendDirectly = ref(false);

  // 自定义样式
  const customCSS = ref('');
  const cssPresets = ref<CSSPreset[]>([]);
  const activePresetIndex = ref(-1);

  // ── Getters ─────────────────────────────────────────
  const activePack = computed(() => installedPacks.value[activePackIndex.value] ?? null);

  const currentMap = computed<MapLayer | null>(() => {
    if (!activePack.value) return null;
    return activePack.value.data.maps[currentMapId.value] ?? null;
  });

  const currentPins = computed<Pin[]>(() => currentMap.value?.pins ?? []);

  const canGoBack = computed(() => mapHistory.value.length > 0);

  /** 面包屑路径: [overview, central_stem, ...] → 用于导航 */
  const breadcrumbs = computed(() => {
    if (!activePack.value) return [];
    const crumbs: { id: string; name: string }[] = [];
    // 从 history 构建
    for (const id of mapHistory.value) {
      const map = activePack.value.data.maps[id];
      if (map) crumbs.push({ id, name: map.name });
    }
    // 当前
    const cur = activePack.value.data.maps[currentMapId.value];
    if (cur) crumbs.push({ id: currentMapId.value, name: cur.name });
    return crumbs;
  });

  /** 当前地图背景图完整 URL */
  const currentImageUrl = computed(() => {
    if (!activePack.value || !currentMap.value) return '';
    const img = currentMap.value.image;
    // 已是完整外链（图床等）直接使用，不拼 baseUrl
    if (/^https?:\/\//i.test(img)) return img;
    const base = activePack.value.data.baseUrl.replace(/\/$/, '');
    return `${base}/${encodeURIComponent(img)}`;
  });

  // ── Actions ─────────────────────────────────────────

  /** 从脚本变量加载状态；若无数据则注入默认地图包 */
  function init() {
    const raw = getVariables({ type: 'script' });
    const parsed = StoreStateSchema.parse(raw);

    if (parsed.installed_packs.length === 0) {
      // 注入默认地图包
      parsed.installed_packs.push({
        name: defaultMapPack.name,
        version: defaultMapPack.version,
        sourceUrl: '(built-in)',
        data: defaultMapPack,
      });
      parsed.active_pack_index = 0;
      parsed.current_map_id = defaultMapPack.defaultMapId;
    }

    installedPacks.value = parsed.installed_packs;
    activePackIndex.value = parsed.active_pack_index;
    currentMapId.value = parsed.current_map_id || activePack.value?.data.defaultMapId || '';
    mapHistory.value = parsed.map_history;
    customCSS.value = parsed.custom_css;
    cssPresets.value = parsed.css_presets;
    activePresetIndex.value = parsed.active_preset_index;
    shouldSendDirectly.value = parsed.should_send_directly;
  }

  /** 持久化到脚本变量 */
  function persist() {
    replaceVariables(
      klona({
        installed_packs: installedPacks.value,
        active_pack_index: activePackIndex.value,
        current_map_id: currentMapId.value,
        map_history: mapHistory.value,
        custom_css: customCSS.value,
        css_presets: cssPresets.value,
        active_preset_index: activePresetIndex.value,
        should_send_directly: shouldSendDirectly.value,
      }),
      { type: 'script' },
    );
  }

  /** 导航到子地图 */
  function navigateToMap(mapId: string) {
    if (!activePack.value?.data.maps[mapId]) {
      console.warn(`[互动地图] 地图 ID "${mapId}" 不存在`);
      return;
    }
    mapHistory.value.push(currentMapId.value);
    currentMapId.value = mapId;
    persist();
  }

  /** 返回上一层 */
  function goBack() {
    if (mapHistory.value.length === 0) return;
    currentMapId.value = mapHistory.value.pop()!;
    persist();
  }

  /** 跳转到面包屑中某一层 */
  function navigateToBreadcrumb(index: number) {
    const target = breadcrumbs.value[index];
    if (!target) return;
    // 截断 history 到 index
    mapHistory.value = mapHistory.value.slice(0, index);
    currentMapId.value = target.id;
    persist();
  }

  /** 安装新地图包 */
  function installPack(jsonData: unknown, sourceUrl: string = '') {
    const result = MapPackSchema.safeParse(jsonData);
    if (!result.success) {
      const errMsg = z.prettifyError(result.error);
      throw new Error(`地图包格式无效:\n${errMsg}`);
    }
    const pack = result.data;
    // 若 JSON 没填 baseUrl，而又是从远程 URL 导入的，自动用 URL 所在目录作为 baseUrl
    // 让作者把 json+图片 一起丢进同一个文件夹上传就能开箱即用
    if (!pack.baseUrl && /^https?:\/\//i.test(sourceUrl)) {
      pack.baseUrl = sourceUrl.replace(/\/[^/]*(?:\?.*)?$/, '/');
    }
    installedPacks.value.push({
      name: pack.name,
      version: pack.version,
      sourceUrl,
      data: pack,
    });
    persist();
    return pack;
  }

  /** 切换活跃地图包 */
  function switchPack(index: number) {
    if (index < 0 || index >= installedPacks.value.length) return;
    activePackIndex.value = index;
    mapHistory.value = [];
    currentMapId.value = installedPacks.value[index].data.defaultMapId;
    persist();
  }

  /** 删除地图包 */
  function removePack(index: number) {
    if (installedPacks.value.length <= 1) return; // 至少保留一个
    installedPacks.value.splice(index, 1);
    if (activePackIndex.value >= installedPacks.value.length) {
      activePackIndex.value = installedPacks.value.length - 1;
    }
    mapHistory.value = [];
    currentMapId.value = activePack.value?.data.defaultMapId ?? '';
    persist();
  }

  /** 切换面板显隐 */
  function togglePanel() {
    panelVisible.value = !panelVisible.value;
  }

  // ── 出行指令 ────────────────────────────────────────

  /** 切换"是否直接发送"模式并持久化 */
  function setShouldSendDirectly(value: boolean) {
    shouldSendDirectly.value = value;
    persist();
  }

  /** 生成出行指令：开启则直接发送 + 触发生成，关闭则填入输入框 */
  function sendTravelCommand(command: string) {
    if (shouldSendDirectly.value) {
      triggerSlash(`/send ${command} || /trigger`);
    } else {
      triggerSlash(`/setinput ${command}`);
    }
    panelVisible.value = false;
  }

  // ── 自定义样式 ───────────────────────────────────────

  /** 更新当前 CSS（不立即持久化，由调用方决定） */
  function setCustomCSS(css: string) {
    customCSS.value = css;
    activePresetIndex.value = -1; // 手动编辑后脱离任何预设
    persist();
  }

  /** 保存当前 CSS 为新预设 */
  function savePreset(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    cssPresets.value.push({ name: trimmed, content: customCSS.value });
    activePresetIndex.value = cssPresets.value.length - 1;
    persist();
  }

  /** 应用预设 */
  function applyPreset(index: number) {
    const preset = cssPresets.value[index];
    if (!preset) return;
    customCSS.value = preset.content;
    activePresetIndex.value = index;
    persist();
  }

  /** 删除预设 */
  function removePreset(index: number) {
    if (!cssPresets.value[index]) return;
    cssPresets.value.splice(index, 1);
    if (activePresetIndex.value === index) {
      activePresetIndex.value = -1;
    } else if (activePresetIndex.value > index) {
      activePresetIndex.value -= 1;
    }
    persist();
  }

  /** 覆盖已有预设的内容（用当前 CSS） */
  function overwritePreset(index: number) {
    const preset = cssPresets.value[index];
    if (!preset) return;
    preset.content = customCSS.value;
    activePresetIndex.value = index;
    persist();
  }

  /** 重命名预设 */
  function renamePreset(index: number, newName: string) {
    const preset = cssPresets.value[index];
    const trimmed = newName.trim();
    if (!preset || !trimmed) return;
    preset.name = trimmed;
    persist();
  }

  return {
    // state
    installedPacks,
    activePackIndex,
    currentMapId,
    mapHistory,
    panelVisible,
    shouldSendDirectly,
    customCSS,
    cssPresets,
    activePresetIndex,
    // getters
    activePack,
    currentMap,
    currentPins,
    canGoBack,
    breadcrumbs,
    currentImageUrl,
    // actions
    init,
    persist,
    navigateToMap,
    goBack,
    navigateToBreadcrumb,
    installPack,
    switchPack,
    removePack,
    togglePanel,
    setShouldSendDirectly,
    sendTravelCommand,
    setCustomCSS,
    savePreset,
    applyPreset,
    removePreset,
    overwritePreset,
    renamePreset,
  };
});
