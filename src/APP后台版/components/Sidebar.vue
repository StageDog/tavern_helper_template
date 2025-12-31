<template>
  <div
    class="z-50 flex h-full w-20 shrink-0 flex-col items-center space-y-6 border-r border-blue-500/20 bg-gradient-to-b from-slate-900/80 to-black/80 py-6 backdrop-blur-xl"
  >
    <!-- Logo -->
    <div
      class="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/25 transition-transform hover:scale-105"
      @click="navigate('/play')"
      title="Go to Play"
    >
      <div class="h-6 w-6 rounded-sm bg-white"></div>
    </div>

    <!-- Menu Items -->
    <div class="flex flex-1 flex-col space-y-4">
      <button
        v-for="item in menuItems"
        :key="item.path"
        @click="navigate(item.path)"
        :title="item.label"
        :class="[
          'group relative flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300',
          isActive(item.path)
            ? 'border border-blue-400/30 bg-gradient-to-br from-blue-500/20 to-violet-600/20 shadow-lg shadow-blue-500/20'
            : 'border border-slate-700/50 bg-slate-800/50 hover:border-blue-500/30 hover:bg-slate-700/50',
        ]"
      >
        <i
          :class="[
            item.icon,
            'text-lg transition-colors duration-300',
            isActive(item.path) ? 'text-blue-400' : 'text-slate-400 group-hover:text-blue-400',
          ]"
        ></i>
        <div
          v-if="isActive(item.path)"
          class="absolute top-1/2 -right-1 h-6 w-1 -translate-y-1/2 transform rounded-full bg-gradient-to-b from-blue-400 to-violet-500"
        ></div>
      </button>
    </div>

    <!-- Bottom Actions (Theme Toggle) -->
    <div class="mt-auto flex flex-col space-y-4 pb-4">
      <button
        @click="toggleTheme"
        class="group relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-700/50 bg-slate-800/50 transition-all duration-300 hover:border-blue-500/30 hover:bg-slate-700/50"
        :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
      >
        <i :class="['fas', isDark ? 'fa-sun text-yellow-400' : 'fa-moon text-blue-400', 'text-lg transition-colors duration-300']"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();
const isDark = ref(false);

const menuItems = [
  { icon: 'fas fa-gamepad', label: 'Play', path: '/play' },
  { icon: 'fas fa-home', label: 'Home', path: '/home' },
  { icon: 'fas fa-concierge-bell', label: 'Service', path: '/service' },
  { icon: 'fas fa-compass', label: 'Discover', path: '/discover' },
];

function navigate(path: string) {
  router.push(path);
}

function isActive(path: string) {
  return route.path === path;
}

function toggleTheme() {
  isDark.value = !isDark.value;
  // Trigger global theme change event
  window.dispatchEvent(
    new CustomEvent('theme-change', {
      detail: { isDark: isDark.value },
    }),
  );
  // Persist theme
  localStorage.setItem('app-theme', isDark.value ? 'dark' : 'light');
}

function onThemeChange(event: any) {
  isDark.value = event.detail.isDark;
}

onMounted(() => {
  // Sync initial state
  const savedTheme = localStorage.getItem('app-theme');
  isDark.value = savedTheme === 'dark';

  // Listen for external theme changes
  window.addEventListener('theme-change', onThemeChange);
});

onUnmounted(() => {
  window.removeEventListener('theme-change', onThemeChange);
});
</script>
