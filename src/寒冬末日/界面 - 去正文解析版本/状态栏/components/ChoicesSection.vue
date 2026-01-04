<template>
  <section class="section">
    <button ref="palette_button" class="palette-button" type="button" @click.stop="togglePalette">🎨</button>
    <h2 class="section-title choices-title">⚜️ 快速剧情 ⚜️</h2>

    <div>
      <template v-if="props.options.length > 0">
        <button
          v-for="(opt, idx) in props.options"
          :key="idx"
          class="choice-item"
          type="button"
          @click="handleChoiceClick(opt)"
        >
          {{ opt }}
        </button>
      </template>
      <template v-else>
        <button class="choice-item" type="button" disabled>当前无选项，请自由行动...</button>
      </template>
    </div>

    <div ref="palette_modal" class="palette-modal" :class="{ show: palette_open }">
      <h3>显示设置</h3>
      <div class="palette-option">
        <label>🎨 主题</label>
        <select v-model="theme">
          <option value="apocalypse_tech">末日科技 (默认)</option>
          <option value="jade_green">淡翡翠绿</option>
          <option value="parchment">复古羊皮纸</option>
          <option value="milky">清新奶白</option>
        </select>
      </div>
      <div class="palette-option">
        <label>🖋️ 字体</label>
        <select v-model="font_key">
          <option value="yahei">微软雅黑 (默认)</option>
          <option value="simsun">宋体</option>
          <option value="kaiti">楷体</option>
        </select>
      </div>
      <div class="palette-option">
        <label>↔️ 字体大小</label>
        <select v-model="font_size">
          <option value="12">12px (最小)</option>
          <option value="14">14px (较小)</option>
          <option value="15">15px (稍小)</option>
          <option value="16">16px (默认)</option>
          <option value="18">18px (稍大)</option>
          <option value="20">20px (较大)</option>
          <option value="22">22px (很大)</option>
          <option value="24">24px (最大)</option>
        </select>
      </div>
      <div class="palette-buttons">
        <button class="palette-close" type="button" @click="palette_open = false">关闭</button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  options: string[];
}>();

const palette_open = ref(false);
const theme = useLocalStorage<string>('eden_theme', 'apocalypse_tech');
const font_key = useLocalStorage<string>('eden_font_key', 'yahei');
const font_size = useLocalStorage<string>('eden_font_size_key', '16');

const palette_button = ref<HTMLElement | null>(null);
const palette_modal = ref<HTMLElement | null>(null);

function togglePalette() {
  palette_open.value = !palette_open.value;
}

watch(
  theme,
  value => {
    if (value === 'apocalypse_tech') {
      delete document.documentElement.dataset.theme;
      return;
    }
    document.documentElement.dataset.theme = value;
  },
  { immediate: true },
);

watch(
  font_key,
  value => {
    const main = document.getElementById('eden-main-container');
    if (!main) return;

    const fontMap: Record<string, string> = {
      yahei: '"Microsoft YaHei", sans-serif',
      simsun: 'SimSun, serif',
      kaiti: 'KaiTi, serif',
    };

    main.style.fontFamily = fontMap[value] || fontMap.yahei;
  },
  { immediate: true },
);

watch(
  font_size,
  value => {
    const main = document.getElementById('eden-main-container');
    if (!main) return;
    main.style.setProperty('--font-size-main', `${value}px`);
  },
  { immediate: true },
);

function handleChoiceClick(text: string) {
  const trigger = (window as any).triggerSlash;
  if (typeof trigger === 'function') {
    try {
      trigger(`/send ${text} | /trigger await=true`);
      return;
    } catch {
      alert(`指令发送失败: ${text}`);
      return;
    }
  }

  alert(`无法自动发送: ${text}`);
}

function onDocumentClick(ev: MouseEvent) {
  if (!palette_open.value) return;
  const target = ev.target as Node | null;
  if (!target) return;

  if (palette_modal.value?.contains(target)) return;
  if (palette_button.value?.contains(target)) return;
  palette_open.value = false;
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick);
});
</script>
