<template>
  <div class="rbr-panel">
    <!-- 标题栏 -->
    <div class="rbr-header">
      <div class="rbr-title-accent"></div>
      <h1 class="rbr-title">★ CONTROL PANEL ★</h1>
      <div class="rbr-title-accent rbr-title-accent--right"></div>
    </div>

    <!-- 标签页导航 -->
    <TabBar :active-tab="activeTab" @change="activeTab = $event" />

    <!-- 内容区域（可滚动） -->
    <div class="rbr-content">
      <component :is="currentTabComponent" />
    </div>

    <!-- 系统日志指示器 -->
    <SystemLog />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import TabBar from './components/TabBar.vue';
import SceneTab from './components/SceneTab.vue';
import PursuerTab from './components/PursuerTab.vue';
import CharactersTab from './components/CharactersTab.vue';
import EventsTab from './components/EventsTab.vue';
import AtmosphereTab from './components/AtmosphereTab.vue';
import SystemLog from './components/SystemLog.vue';

type TabName = '场景' | '追击者' | '角色' | '事件' | '氛围';

const activeTab = ref<TabName>('场景');

const tabComponents = {
  场景: SceneTab,
  追击者: PursuerTab,
  角色: CharactersTab,
  事件: EventsTab,
  氛围: AtmosphereTab,
};

const currentTabComponent = computed(() => tabComponents[activeTab.value]);
</script>

<style scoped>
.rbr-panel {
  width: 100%;
  background: var(--rbr-paper);
  border: var(--rbr-border);
  font-family: var(--rbr-font);
  position: relative;
}

.rbr-header {
  background: var(--rbr-black);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  position: relative;
  overflow: hidden;
}

.rbr-title {
  font-size: 14px;
  font-weight: 900;
  color: var(--rbr-red);
  text-transform: uppercase;
  letter-spacing: 3px;
  text-align: center;
  flex: 1;
  position: relative;
  z-index: 1;
}

.rbr-title-accent {
  width: 24px;
  height: 24px;
  background: var(--rbr-red);
  transform: rotate(45deg) skewX(-5deg);
  flex-shrink: 0;
}

.rbr-title-accent--right {
  transform: rotate(45deg) skewX(5deg);
}

.rbr-content {
  max-height: 420px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px;
  scrollbar-width: thin;
  scrollbar-color: var(--rbr-red) var(--rbr-paper-dark);
}

.rbr-content::-webkit-scrollbar {
  width: 4px;
}

.rbr-content::-webkit-scrollbar-track {
  background: var(--rbr-paper-dark);
}

.rbr-content::-webkit-scrollbar-thumb {
  background: var(--rbr-red);
}

@media (max-width: 640px) {
  .rbr-header {
    padding: 7px 8px;
    gap: 6px;
  }

  .rbr-title {
    font-size: 12px;
    letter-spacing: 2px;
  }

  .rbr-title-accent {
    width: 16px;
    height: 16px;
  }

  .rbr-content {
    max-height: 62vh;
    padding: 6px;
  }
}
</style>
