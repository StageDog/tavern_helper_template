<template>
  <div v-if="variant === 'panel'" class="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-slate-900/80 to-black/60 p-4 shadow-2xl shadow-purple-500/10 backdrop-blur-xl">
    <div class="mb-4 flex items-center gap-2">
      <i class="fas fa-images text-purple-400"></i>
      <h3 class="text-white">套餐写真</h3>
      <div class="ml-auto text-xs text-slate-500">{{ subtitle }}</div>
    </div>

    <div class="grid grid-cols-3 gap-2">
      <button
        v-for="(slot, idx) in slots"
        :key="slot.key"
        class="group relative aspect-square overflow-hidden rounded-xl border border-slate-700/50 bg-slate-950/40 text-left transition-all hover:border-purple-500/40 hover:bg-slate-900/60"
        @click="open(idx)"
      >
        <img
          v-if="slot.kind === 'image'"
          :src="slot.src"
          :alt="slot.label"
          class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          @error="onImgError(slot.key)"
        />
        <div v-else class="flex h-full w-full flex-col items-center justify-center gap-2 p-2 text-center">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700/50 bg-slate-900/40 text-purple-300">
          <i :class="slot.kind === 'text' ? 'fas fa-file-alt' : 'fas fa-image'"></i>
          </div>
          <div class="text-xs font-bold text-slate-200">{{ slot.label }}</div>
          <div class="line-clamp-2 text-[11px] text-slate-500">
            {{ slot.kind === 'text' ? slot.text : '暂未提供' }}
          </div>
        </div>

        <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
        <div class="pointer-events-none absolute bottom-2 left-2 flex items-center gap-1 text-xs text-white/90 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <i class="fas fa-search-plus"></i>
          查看
        </div>
      </button>
    </div>

    <button
      class="mt-4 w-full rounded-xl border border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-pink-500/10 py-2 text-sm text-purple-300 transition-all duration-300 hover:from-purple-500/20 hover:to-pink-500/20"
      @click="open(0)"
    >
      查看大图
    </button>
  </div>

  <!-- Stage variant: full-bleed image area -->
  <div v-else class="relative h-full w-full overflow-hidden">
    <!-- Background ambience -->
    <div class="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-orange-600/10"></div>
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.22),transparent_55%),radial-gradient(circle_at_80%_30%,rgba(168,85,247,0.16),transparent_55%),radial-gradient(circle_at_50%_90%,rgba(249,115,22,0.10),transparent_60%)]"></div>
    <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

    <!-- 3-slot previews (leave bottom space for PLAY HUD overlay) -->
    <div class="relative grid h-full grid-cols-3 gap-3 p-3 pb-16">
      <button
        v-for="(slot, idx) in slots"
        :key="slot.key"
        class="group relative min-h-0 overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-950/40 transition-all hover:border-blue-500/30 hover:bg-slate-900/60"
        @click="open(idx)"
      >
        <img
          v-if="slot.kind === 'image'"
          :src="slot.src"
          :alt="slot.label"
          class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          @error="onImgError(slot.key)"
        />
        <div v-else class="flex h-full w-full flex-col items-center justify-center gap-2 p-3 text-center">
          <div class="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-700/50 bg-slate-900/40 text-blue-200">
            <i :class="slot.kind === 'text' ? 'fas fa-file-alt' : 'fas fa-image'"></i>
          </div>
          <div class="text-xs font-bold text-slate-200">{{ slot.label }}</div>
          <div class="line-clamp-3 text-[11px] text-slate-500">
            {{ slot.kind === 'text' ? slot.text : '暂未提供' }}
          </div>
        </div>

        <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
        <div class="pointer-events-none absolute bottom-2 left-2 flex items-center gap-1 text-xs text-white/90 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <i class="fas fa-search-plus"></i>
          查看大图
        </div>
        <div class="pointer-events-none absolute bottom-2 right-2 rounded-full border border-white/10 bg-black/30 px-2 py-0.5 text-[11px] text-white/80 backdrop-blur-sm">
          {{ slot.label }}
        </div>
      </button>
    </div>
  </div>

  <!-- Lightbox -->
  <div v-if="lightboxOpen" class="fixed inset-0 z-[4800] flex items-center justify-center bg-black/75 p-4" @click.self="close">
    <div class="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-950/80 shadow-2xl backdrop-blur-xl">
      <div class="flex items-center justify-between gap-3 border-b border-slate-800/60 px-4 py-3">
        <div class="min-w-0">
          <div class="truncate text-sm font-bold text-white">{{ title }}</div>
          <div class="truncate text-xs text-slate-500">{{ subtitle }}</div>
        </div>
        <div class="flex items-center gap-2">
          <button
            class="rounded-xl border border-slate-700/50 bg-slate-900/50 px-3 py-2 text-sm text-slate-200 hover:border-blue-500/30 hover:bg-slate-800/60"
            @click="copyActive"
          >
            <i class="fas fa-copy"></i>
            <span class="ml-2">复制</span>
          </button>
          <button
            class="rounded-xl border border-slate-700/50 bg-slate-900/50 px-3 py-2 text-sm text-slate-200 hover:border-blue-500/30 hover:bg-slate-800/60"
            @click="close"
          >
            <i class="fas fa-times"></i>
            <span class="ml-2">关闭</span>
          </button>
        </div>
      </div>

      <div class="flex items-center justify-center p-4">
        <img
          v-if="active.kind === 'image'"
          :src="active.src"
          alt="Full Image"
          class="max-h-[82vh] w-auto max-w-[92vw] object-contain"
          @error="onImgError(active.key)"
        />
        <div v-else class="w-full p-4">
          <div class="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4 font-mono text-xs text-slate-200">
            <div class="mb-2 text-[11px] text-slate-500">（此字段不是图片 URL，已作为提示词/文本展示）</div>
            <pre class="whitespace-pre-wrap">{{ active.kind === 'text' ? active.text : '暂未提供' }}</pre>
          </div>
          <div v-if="copiedHint" class="mt-3 text-sm text-green-300">{{ copiedHint }}</div>
        </div>
      </div>

      <div class="flex items-center gap-2 border-t border-slate-800/60 px-4 py-3">
        <button
          v-for="(slot, idx) in slots"
          :key="slot.key"
          class="group relative h-14 w-14 overflow-hidden rounded-xl border bg-slate-950/40 transition-all"
          :class="idx === activeIndex ? 'border-blue-500/60 shadow-lg shadow-blue-500/20' : 'border-slate-700/50 hover:border-blue-500/30'"
          @click="setActive(idx)"
          :title="slot.label"
        >
          <img v-if="slot.kind === 'image'" :src="slot.src" :alt="slot.label" class="h-full w-full object-cover" @error="onImgError(slot.key)" />
          <div v-else class="flex h-full w-full items-center justify-center text-slate-200">
            <i :class="slot.kind === 'text' ? 'fas fa-file-alt text-purple-300' : 'fas fa-image text-slate-500'"></i>
          </div>
          <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
        </button>

        <div class="ml-auto text-xs text-slate-500">{{ active.label }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { ensureSelectedPackageFromMvu, refreshSelectedPackageFromMvu, selectedPackage } from '../shared/selectedPackage';

type SlotKey = 'image1' | 'image2' | 'image3';
type SlotKind = 'image' | 'text' | 'empty';

type Slot = {
  key: SlotKey;
  label: string;
  raw: string;
  kind: SlotKind;
  src?: string;
  text?: string;
};

const props = defineProps<{
  variant?: 'stage' | 'panel';
}>();

const variant = computed(() => props.variant ?? 'panel');
const activeIndex = ref(0);
const lightboxOpen = ref(false);
const copiedHint = ref('');
const broken = ref<Record<string, boolean>>({});

function isLikelyImageUrl(raw: string) {
  const v = (raw || '').trim();
  if (!v) return false;
  if (v.startsWith('blob:')) return true;
  if (v.startsWith('data:image/')) return true;
  if (v.startsWith('http://') || v.startsWith('https://')) return true;
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(v);
}

function stripWrapper(raw: string) {
  const v = (raw || '').trim();
  // 常见：###...###（提示词包装）
  if (v.startsWith('###') && v.endsWith('###') && v.length >= 6) return v.slice(3, -3).trim();
  return v;
}

function toSlot(key: SlotKey, label: string, rawValue: unknown): Slot {
  const raw = typeof rawValue === 'string' ? rawValue : '';
  const cleaned = stripWrapper(raw);
  if (!cleaned) return { key, label, raw: '', kind: 'empty' };

  if (!broken.value[key] && isLikelyImageUrl(cleaned)) {
    return { key, label, raw: cleaned, kind: 'image', src: cleaned };
  }
  return { key, label, raw: cleaned, kind: 'text', text: cleaned };
}

const slots = computed<Slot[]>(() => {
  const pkg = selectedPackage.value;
  return [
    toSlot('image1', '露脸图', pkg?.image1),
    toSlot('image2', '时装秀', pkg?.image2),
    toSlot('image3', '私密拍', pkg?.image3),
  ];
});

const active = computed(() => slots.value[Math.min(activeIndex.value, slots.value.length - 1)] || slots.value[0]);

const title = computed(() => {
  const pkg = selectedPackage.value;
  const pkgName = pkg?.name || '未命名套餐';
  const shopName = pkg?.shop_name ? ` · ${pkg.shop_name}` : '';
  return `${pkgName}${shopName}`;
});

const subtitle = computed(() => {
  const slot = active.value;
  return slot.kind === 'image' ? '点击缩略图可切换，图片自适应显示' : '当前为提示词/文本（非图片 URL）';
});

function setActive(idx: number) {
  activeIndex.value = Math.max(0, Math.min(idx, slots.value.length - 1));
  copiedHint.value = '';
}

function open(idx: number) {
  setActive(idx);
  lightboxOpen.value = true;
}

function close() {
  lightboxOpen.value = false;
  copiedHint.value = '';
}

function onImgError(key: SlotKey) {
  broken.value = { ...broken.value, [key]: true };
}

async function copyActive() {
  copiedHint.value = '';
  const text = active.value?.kind === 'image' ? active.value.src || '' : active.value?.text || '';
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    copiedHint.value = '已复制到剪贴板';
    return;
  } catch {
    // fallback
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      copiedHint.value = ok ? '已复制到剪贴板' : '复制失败';
    } catch {
      copiedHint.value = '复制失败';
    }
  }
}

function refreshFromMvu() {
  refreshSelectedPackageFromMvu();
  setActive(0);
}

onMounted(() => {
  ensureSelectedPackageFromMvu();
  window.addEventListener('shop:cache:updated', refreshFromMvu as any);
});

onUnmounted(() => {
  window.removeEventListener('shop:cache:updated', refreshFromMvu as any);
});
</script>
