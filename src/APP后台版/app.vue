<template>
  <div
    class="relative flex h-full w-full flex-col overflow-hidden bg-slate-950 text-white selection:bg-blue-500/30"
    :data-theme="currentTheme"
  >
    <!-- Background Effects -->
    <div class="absolute inset-0 -z-20 bg-gradient-to-br from-slate-950 via-slate-900 to-black"></div>
    <div class="absolute inset-0 -z-10 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-orange-600/5"></div>
    <div class="absolute top-0 left-1/4 -z-10 h-96 w-96 animate-pulse rounded-full bg-blue-500/10 blur-3xl"></div>
    <div
      class="absolute right-1/4 bottom-0 -z-10 h-96 w-96 animate-pulse rounded-full bg-purple-500/10 blur-3xl delay-1000"
    ></div>

    <div class="flex h-full min-h-0 w-full">
      <!-- Sidebar -->
      <Sidebar />

      <!-- Main Content Area -->
      <main class="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <ErrorBoundary>
          <div class="flex min-h-0 flex-1 flex-col">
            <RouterView v-slot="{ Component }">
              <transition name="fade">
                <component :is="Component" v-if="Component" class="min-h-0 flex-1" />
              </transition>
            </RouterView>
          </div>
        </ErrorBoundary>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onErrorCaptured, onMounted, onUnmounted, ref } from 'vue';
import ErrorBoundary from './components/ErrorBoundary.vue';
import Sidebar from './components/Sidebar.vue';
import { enableIframeFullHeight } from './utils';

// 当前主题
const currentTheme = ref<'light' | 'dark'>('light');

let disableIframeFullHeight: () => void = () => {};

// 初始化主题
function initTheme() {
  // 默认使用浅色模式
  const savedTheme = localStorage.getItem('app-theme') || 'light';
  const isDark = savedTheme === 'dark';

  // 设置Vue响应式数据
  currentTheme.value = savedTheme as 'light' | 'dark';

  // 同时设置到documentElement，确保CSS变量能正确应用
  document.documentElement.setAttribute('data-theme', savedTheme);

  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  console.log(`[主题初始化] 已加载${isDark ? '深色' : '浅色'}模式`);
}

// 在组件挂载时初始化主题
onMounted(() => {
  initTheme();
  window.addEventListener('theme-change', onThemeChange);
  disableIframeFullHeight = enableIframeFullHeight({ minHeightPx: 480 });
});

function onThemeChange(event: any) {
  const newTheme = event.detail.isDark ? 'dark' : 'light';
  currentTheme.value = newTheme;
  document.documentElement.setAttribute('data-theme', newTheme);

  if (newTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  console.log(`[主题切换] 已切换到${newTheme === 'dark' ? '深色' : '浅色'}模式`);
}

onUnmounted(() => {
  window.removeEventListener('theme-change', onThemeChange);
  disableIframeFullHeight();
});

// 全局错误处理
onErrorCaptured((err: Error) => {
  console.error('[全局错误] 根组件错误:', err);
  return false;
});
</script>

<style lang="scss">
/* 让应用高度跟随宿主 iframe；滚动交给子容器 */
html,
body {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 全局滚动条样式覆盖 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.5);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(71, 85, 105, 0.8);
}

// 保留原有的 CSS 变量定义，以兼容旧组件（如果需要）
:root {
  --bg-primary: #f8f9fa;
  --text-primary: #2c3e50;
  /* ... 其他变量保留 ... */
}

[data-theme='dark'] {
  --bg-primary: #020617; /* slate-950 */
  --text-primary: #ffffff;
  /* ... */
}

/* #app 作为容器占满 iframe */
#app {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}
</style>
