<template>
  <div class="flex h-80 flex-col rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900/80 to-black/60 p-4 shadow-2xl shadow-blue-500/10 backdrop-blur-xl">
    <div class="mb-4 flex items-center space-x-2">
      <i class="fas fa-info-circle text-blue-400"></i>
      <h3 class="text-white">Package Details</h3>
      <div class="ml-auto flex items-center space-x-1">
        <button
          class="mr-2 rounded-lg border border-slate-700/50 bg-slate-800/50 px-2 py-1 text-xs text-slate-200 hover:border-blue-500/30 hover:bg-slate-700/50"
          @click="openHistory"
        >
          <i class="fas fa-history text-blue-300"></i>
          <span class="ml-1">历史订单</span>
        </button>
        <div class="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
        <span class="text-xs text-green-400">Active</span>
      </div>
    </div>

    <div class="scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent flex-1 space-y-3 overflow-y-auto">
      <div v-if="!pkg" class="rounded-xl border border-slate-700/50 bg-slate-950/40 p-4 text-sm text-slate-400">
        暂无选中套餐（请在右侧列表点击一个套餐）
      </div>

      <div v-else class="space-y-3">
        <div class="rounded-xl border border-slate-700/50 bg-slate-950/40 p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="truncate text-base font-bold text-white">{{ pkg.name || '未命名套餐' }}</div>
              <div class="mt-1 truncate text-xs text-slate-500">{{ pkg.shop_name || '未命名店铺' }}</div>
            </div>
            <div class="shrink-0 text-right">
              <div class="text-lg font-bold text-yellow-300">￥{{ priceText }}</div>
              <div class="text-xs text-slate-500">{{ starsText }}</div>
            </div>
          </div>
          <div v-if="tags.length" class="mt-3 flex flex-wrap gap-2">
            <span
              v-for="t in tags.slice(0, 8)"
              :key="t"
              class="rounded-full border border-blue-500/20 bg-blue-500/5 px-2 py-0.5 text-xs text-blue-200"
            >
              {{ t }}
            </span>
          </div>
        </div>

        <div class="rounded-xl border border-slate-700/50 bg-slate-950/40 p-4">
          <div class="mb-2 flex items-center gap-2 text-sm font-bold text-slate-200">
            <i class="fas fa-align-left text-blue-300"></i>
            简介
          </div>
          <div class="text-sm leading-relaxed text-slate-300">
            {{ descriptionText }}
          </div>
        </div>

        <div v-if="features.length" class="rounded-xl border border-slate-700/50 bg-slate-950/40 p-4">
          <div class="mb-2 flex items-center gap-2 text-sm font-bold text-slate-200">
            <i class="fas fa-bolt text-yellow-300"></i>
            玩法特色
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="f in features.slice(0, 12)"
              :key="f"
              class="rounded-full border border-slate-700/50 bg-slate-900/40 px-2 py-1 text-xs text-slate-200 hover:border-blue-500/30 hover:bg-slate-800/60"
              @click="quickOrder(f)"
            >
              {{ f }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-4 flex items-center space-x-2 border-t border-slate-700/50 pt-4">
      <input
        v-model="remark"
        placeholder="下单备注（可选）"
        class="flex-1 rounded-xl border border-slate-700/50 bg-slate-800/50 px-3 py-2 text-white placeholder-slate-400 focus:border-blue-500/50 focus:outline-none"
      />
      <button
        class="flex items-center justify-center rounded-xl border border-blue-400/30 bg-gradient-to-r from-blue-500 to-violet-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:from-blue-600 hover:to-violet-700 disabled:opacity-50"
        :disabled="!pkg"
        @click="placeOrder()"
      >
        <i class="fas fa-paper-plane text-white"></i>
        <span class="ml-2 hidden sm:inline">下单</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { historyOverlayOpen } from '../shared/uiState';
import { selectedPackage } from '../shared/selectedPackage';

function openHistory() {
  historyOverlayOpen.value = true;
}

const remark = ref('');

const pkg = computed(() => selectedPackage.value);
const tags = computed<string[]>(() => {
  const raw = (pkg.value as any)?.tags;
  if (Array.isArray(raw)) return raw.map(x => String(x)).filter(Boolean);
  if (typeof raw === 'string') return raw.split(/\s*,\s*|\s+/).filter(Boolean);
  return [];
});
const features = computed<string[]>(() => {
  const raw = (pkg.value as any)?.content;
  if (Array.isArray(raw)) return raw.map(x => String(x)).filter(Boolean);
  if (typeof raw === 'string') return raw.split(/\s*,\s*|\s+/).filter(Boolean);
  return [];
});
const priceText = computed(() => {
  const v = (pkg.value as any)?.price;
  if (typeof v === 'number') return String(v);
  if (typeof v === 'string') return v;
  return '0';
});
const starsText = computed(() => {
  const v = (pkg.value as any)?.stars;
  const n = typeof v === 'number' ? v : Number.parseFloat(String(v ?? ''));
  if (!Number.isFinite(n)) return '—';
  return `${n.toFixed(1)}★`;
});
const descriptionText = computed(() => {
  const v = (pkg.value as any)?.description;
  const s = typeof v === 'string' ? v.trim() : '';
  return s || '暂无描述';
});

function tryTriggerSlash(command: string) {
  const fn = (window as any)?.triggerSlash;
  if (typeof fn !== 'function') return false;
  try {
    fn(command);
    return true;
  } catch (e) {
    console.error('[PackageDetail] triggerSlash failed:', e);
    return false;
  }
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

async function placeOrder(extra?: string) {
  if (!pkg.value) return;
  const pkgName = pkg.value.name || '未命名套餐';
  const shopName = pkg.value.shop_name || '未命名店铺';
  const note = [extra, remark.value.trim()].filter(Boolean).join(' ');
  const text = `下单：${shopName} / ${pkgName}${note ? `，备注：${note}` : ''}`;
  const cmd = `/send ${text} | /trigger await=true`;

  const ok = tryTriggerSlash(cmd);
  if (!ok) await copyToClipboard(cmd);
}

function quickOrder(feature: string) {
  void placeOrder(`玩法：${feature}`);
}
</script>
