<template>
  <div class="relative flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-slate-900/75 to-black/60 shadow-2xl shadow-blue-500/10 backdrop-blur-xl">
    <!-- Scene banner (Mythos-like) -->
    <div class="relative shrink-0 border-b border-blue-500/10">
      <div class="relative aspect-[21/9] w-full overflow-hidden">
        <PackageImageGallery variant="stage" />
      </div>

      <div class="absolute inset-x-0 bottom-0 p-4">
        <div class="flex items-end justify-between gap-4">
          <div class="min-w-0">
            <div class="flex items-center gap-2 text-xs text-slate-300/90">
              <span class="inline-flex items-center gap-2 rounded-full border border-slate-700/50 bg-slate-900/40 px-3 py-1">
                <span class="h-2 w-2 animate-pulse rounded-full bg-green-400"></span>
                <span>LIVE</span>
              </span>
              <span class="hidden items-center gap-1 rounded-full border border-slate-700/50 bg-slate-900/40 px-3 py-1 sm:inline-flex">
                <i class="fas fa-magic text-blue-300"></i>
                场景生成中（占位）
              </span>
            </div>
            <div class="mt-2 truncate text-base font-bold text-white">当前场景：后台系统 · 变量引擎</div>
            <div class="mt-0.5 truncate text-xs text-slate-400">在此处进行交互指令，下方日志会持续输出</div>
          </div>

          <div class="shrink-0 text-right">
            <div class="inline-flex items-center gap-2 rounded-xl border border-slate-700/50 bg-slate-900/40 px-3 py-2 text-xs text-slate-200">
              <i class="fas fa-star text-orange-400"></i>
              <span>4.9</span>
              <span class="text-slate-500">·</span>
              <span class="text-slate-300">Session</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <!-- Narrative / Log -->
      <section class="min-h-0 overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-950/60">
        <div class="flex items-center justify-between border-b border-slate-800/60 px-4 py-3">
          <div class="flex items-center gap-2 text-sm font-bold text-slate-200">
            <i class="fas fa-scroll text-blue-300"></i>
            交互日志
          </div>
          <button
            class="rounded-lg border border-slate-700/50 bg-slate-900/50 px-2 py-1 text-xs text-slate-300 hover:border-blue-500/30 hover:bg-slate-800/60"
            @click="clearLog"
            :disabled="isStreaming"
          >
            <i class="fas fa-eraser"></i>
            <span class="ml-1">清空</span>
          </button>
        </div>

        <div class="scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent h-full overflow-y-auto p-4 font-mono text-[13px] leading-relaxed text-green-300">
          <pre class="whitespace-pre-wrap">{{ streamContent }}<span v-if="isStreaming" class="animate-pulse">_</span></pre>
        </div>
      </section>

      <!-- Quick Actions -->
      <aside class="hidden min-h-0 flex-col gap-3 lg:flex">
        <div class="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-4">
          <div class="mb-3 flex items-center gap-2 text-sm font-bold text-white">
            <i class="fas fa-bolt text-yellow-300"></i>
            快捷指令
          </div>
          <div class="flex flex-col gap-2">
            <button
              v-for="item in quickActions"
              :key="item.label"
              class="group flex items-center justify-between rounded-xl border border-slate-700/50 bg-slate-800/30 px-3 py-2 text-left text-sm text-slate-200 transition-all hover:border-blue-500/30 hover:bg-slate-800/60"
              @click="pickQuickAction(item.command)"
            >
              <span class="truncate">{{ item.label }}</span>
              <i class="fas fa-chevron-right text-xs text-slate-500 transition-transform group-hover:translate-x-0.5"></i>
            </button>
          </div>
          <div class="mt-3 text-xs text-slate-500">提示：发送后会尝试调用 `triggerSlash`（如存在）。</div>
        </div>
      </aside>
    </div>

    <!-- Input Bar -->
    <div class="shrink-0 border-t border-slate-800/60 p-4">
      <div class="flex items-center gap-2">
        <div class="flex-1">
          <input
            ref="inputEl"
            v-model="userInput"
            class="w-full rounded-2xl border border-slate-700/50 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500/40 focus:outline-none"
            placeholder="输入指令…（例如：生成 / 搜索 / 首页）"
            @keydown.enter.exact.prevent="send"
          />
        </div>
        <button
          class="flex items-center justify-center rounded-2xl border border-blue-400/30 bg-gradient-to-r from-blue-500 to-violet-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:from-blue-600 hover:to-violet-700 disabled:opacity-50"
          :disabled="!userInput.trim()"
          @click="send"
        >
          <i class="fas fa-paper-plane"></i>
          <span class="ml-2 hidden sm:inline">发送</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue';
import PackageImageGallery from './PackageImageGallery.vue';

const streamContent = ref('');
const isStreaming = ref(false);
const typewriterIndex = ref(0);
const fullText = ref(''); // 完整文本缓冲区

// 模拟打字机效果
const typeInterval = ref<number | null>(null);

const inputEl = ref<HTMLInputElement | null>(null);
const userInput = ref('');

const quickActions = [
  { label: '生成：店铺 + 套餐（默认）', command: '生成' },
  { label: '打开：首页', command: '首页' },
  { label: '搜索：输入关键字', command: '搜索' },
];

function startTypewriter(text: string) {
  fullText.value = text;
  typewriterIndex.value = 0;
  streamContent.value = '';
  isStreaming.value = true;

  if (typeInterval.value) clearInterval(typeInterval.value);

  typeInterval.value = window.setInterval(() => {
    if (typewriterIndex.value < fullText.value.length) {
      streamContent.value += fullText.value.charAt(typewriterIndex.value);
      typewriterIndex.value++;
    } else {
      if (typeInterval.value) clearInterval(typeInterval.value);
      isStreaming.value = false;
    }
  }, 30); // 30ms per char
}

function clearLog() {
  streamContent.value = '';
  fullText.value = '';
  typewriterIndex.value = 0;
  isStreaming.value = false;
  if (typeInterval.value) clearInterval(typeInterval.value);
}

function pickQuickAction(command: string) {
  userInput.value = command;
  nextTick(() => inputEl.value?.focus());
}

function tryTriggerSlash(command: string) {
  const fn = (window as any)?.triggerSlash;
  if (typeof fn !== 'function') return false;
  try {
    fn(command);
    return true;
  } catch (e) {
    console.error('[Play] triggerSlash failed:', e);
    return false;
  }
}

function appendLogLine(line: string) {
  const prefix = streamContent.value ? '\n' : '';
  streamContent.value += `${prefix}${line}`;
}

function send() {
  const text = userInput.value.trim();
  if (!text) return;

  userInput.value = '';
  appendLogLine(`> ${text}`);

  // 兼容酒馆：如果存在 triggerSlash，则以 /send 的方式派发
  const ok = tryTriggerSlash(`/send ${text} | /trigger await=true`);
  if (!ok) appendLogLine('[提示] 未检测到 triggerSlash：已记录到日志（占位）');

  nextTick(() => inputEl.value?.focus());
}

// 模拟接收数据（实际应从 EventSource 或 Socket 接收）
onMounted(() => {
  // 示例数据
  const demoText =
    'System initialized.\nConnecting to neural link...\n> Connection established.\n> Subject: "Overwatch 2" session active.\n> User: ProGamer_X\n\nWaiting for further input from the server...';
  startTypewriter(demoText);
  nextTick(() => inputEl.value?.focus());
});

onUnmounted(() => {
  if (typeInterval.value) clearInterval(typeInterval.value);
});
</script>
