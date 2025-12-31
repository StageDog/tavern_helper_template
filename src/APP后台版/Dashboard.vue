<template>
  <div class="relative flex h-full min-h-0 w-full flex-col gap-4 overflow-hidden p-4 lg:p-6">
    <!-- Header / HUD -->
    <div class="flex items-center justify-between gap-3">
      <div class="min-w-0">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-500/20 bg-slate-900/60 shadow-lg shadow-blue-500/10">
            <i class="fas fa-gamepad text-blue-300"></i>
          </div>
          <div class="min-w-0">
            <div class="truncate text-lg font-bold text-white">PLAY</div>
            <div class="truncate text-xs text-slate-400">场景 · 交互 · 订单 / 变量联动</div>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="hidden rounded-xl border border-slate-700/50 bg-slate-800/50 px-3 py-2 text-sm text-slate-200 hover:border-blue-500/30 hover:bg-slate-700/50 lg:inline-flex"
          @click="openHistory"
        >
          <i class="fas fa-history text-blue-300"></i>
          <span class="ml-2">历史订单</span>
        </button>

        <button
          class="rounded-xl border border-slate-700/50 bg-slate-800/50 px-3 py-2 text-sm text-slate-200 hover:border-blue-500/30 hover:bg-slate-700/50 lg:hidden"
          @click="leftDrawerOpen = true"
        >
          <i class="fas fa-user-shield text-slate-200"></i>
          <span class="ml-2">角色</span>
        </button>
        <button
          class="rounded-xl border border-slate-700/50 bg-slate-800/50 px-3 py-2 text-sm text-slate-200 hover:border-blue-500/30 hover:bg-slate-700/50 xl:hidden"
          @click="rightDrawerOpen = true"
        >
          <i class="fas fa-store text-slate-200"></i>
          <span class="ml-2">商城</span>
        </button>
      </div>
    </div>

    <!-- Mythos-like 3-column layout -->
    <div
      class="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[20rem_minmax(0,1fr)] xl:grid-cols-[20rem_minmax(0,1fr)_22rem]"
    >
      <!-- Left: Character Sheet -->
      <aside class="scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent hidden min-h-0 flex-col gap-4 overflow-y-auto pr-1 lg:flex">
        <ServiceStatus />
        <ServiceStats />
      </aside>

      <!-- Center: Scene / Play -->
      <main class="min-h-0 min-w-0">
        <Play />
      </main>

      <!-- Right: Marketplace / Details -->
      <aside class="scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent hidden min-h-0 flex-col gap-4 overflow-y-auto pl-1 xl:flex">
        <ShopList />
        <PackageDetail />
        <PackageImages />
      </aside>
    </div>
  </div>

  <!-- Mobile Drawers -->
  <div v-if="leftDrawerOpen" class="fixed inset-0 z-[4500] flex items-center justify-center bg-black/60 p-4 lg:hidden" @click.self="leftDrawerOpen = false">
    <div class="scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent flex h-full w-full max-w-md flex-col gap-4 overflow-y-auto rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900/90 to-black/80 p-4 shadow-2xl shadow-blue-500/10 backdrop-blur-xl">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
            <i class="fas fa-user-shield"></i>
          </div>
          <div class="text-sm font-bold text-white">角色面板</div>
        </div>
        <button class="rounded-xl border border-slate-700/50 bg-slate-800/50 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700/50" @click="leftDrawerOpen = false">
          <i class="fas fa-times"></i>
          <span class="ml-2">关闭</span>
        </button>
      </div>
      <ServiceStatus />
      <ServiceStats />
    </div>
  </div>

  <div v-if="rightDrawerOpen" class="fixed inset-0 z-[4500] flex items-center justify-center bg-black/60 p-4 xl:hidden" @click.self="rightDrawerOpen = false">
    <div class="scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent flex h-full w-full max-w-md flex-col gap-4 overflow-y-auto rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900/90 to-black/80 p-4 shadow-2xl shadow-blue-500/10 backdrop-blur-xl">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500/10 text-green-300">
            <i class="fas fa-store"></i>
          </div>
          <div class="text-sm font-bold text-white">商城与详情</div>
        </div>
        <div class="flex items-center gap-2">
          <button
            class="rounded-xl border border-slate-700/50 bg-slate-800/50 px-3 py-2 text-sm text-slate-200 hover:border-blue-500/30 hover:bg-slate-700/50"
            @click="openHistory"
          >
            <i class="fas fa-history text-blue-300"></i>
            <span class="ml-2">历史订单</span>
          </button>
          <button class="rounded-xl border border-slate-700/50 bg-slate-800/50 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700/50" @click="rightDrawerOpen = false">
            <i class="fas fa-times"></i>
            <span class="ml-2">关闭</span>
          </button>
        </div>
      </div>
      <ShopList />
      <PackageDetail />
      <PackageImages />
    </div>
  </div>

  <HistoryOverlay />
</template>

<script setup lang="ts">
import Play from './components/Play.vue';
import ServiceStats from './components/ServiceStats.vue';
import ServiceStatus from './components/ServiceStatus.vue';
import ShopList from './components/ShopList.vue';
import PackageDetail from './components/PackageDetail.vue';
import PackageImages from './components/PackageImages.vue';
import HistoryOverlay from './components/HistoryOverlay.vue';
import { ref } from 'vue';
import { historyOverlayOpen } from './shared/uiState';

const leftDrawerOpen = ref(false);
const rightDrawerOpen = ref(false);

function openHistory() {
  historyOverlayOpen.value = true;
}
</script>
