<script setup lang="ts">
import { useMapStore } from '../store';
import MapRenderer from './MapRenderer.vue';
import MapManager from './MapManager.vue';
import StyleSettings from './StyleSettings.vue';
import TravelMenu from './TravelMenu.vue';

const store = useMapStore();
const currentView = ref<'map' | 'manager' | 'styles'>('map');
const showFreeTravel = ref(false);

function closePanel() {
  store.panelVisible = false;
}

function openFreeTravel() {
  showFreeTravel.value = true;
}

function closeFreeTravel() {
  showFreeTravel.value = false;
}
</script>

<template>
  <div class="imap-panel">
    <!-- 标题栏 -->
    <div class="imap-header">
      <div class="imap-header-left">
        <button
v-if="currentView !== 'map'" class="imap-btn imap-btn-ghost"
          title="返回地图" @click="currentView = 'map'">
          ← 返回
        </button>
        <!-- 面包屑导航 -->
        <div v-else class="imap-breadcrumbs">
          <template v-for="(crumb, i) in store.breadcrumbs" :key="crumb.id">
            <span v-if="i > 0" class="imap-breadcrumb-sep">›</span>
            <button
class="imap-breadcrumb" :class="{ active: i === store.breadcrumbs.length - 1 }"
              @click="store.navigateToBreadcrumb(i)">
              {{ crumb.name }}
            </button>
          </template>
        </div>
      </div>
      <div class="imap-header-right">
        <button
v-if="currentView === 'map'" class="imap-btn imap-btn-ghost"
          title="设置" @click="currentView = 'styles'">⚙️</button>
        <button
v-if="currentView === 'map'" class="imap-btn imap-btn-ghost"
          title="管理地图包" @click="currentView = 'manager'">📦</button>
        <button class="imap-btn imap-btn-ghost imap-close-btn" title="关闭" @click="closePanel">✕</button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="imap-body">
      <MapRenderer v-if="currentView === 'map'" />
      <MapManager v-else-if="currentView === 'manager'" />
      <StyleSettings v-else-if="currentView === 'styles'" />
    </div>

    <!-- 底部工具栏 -->
    <div v-if="currentView === 'map'" class="imap-footer">
      <div class="imap-footer-left">
        <button class="imap-btn" :disabled="!store.canGoBack" @click="store.goBack()">
          ← 返回上层
        </button>
        <button class="imap-btn imap-btn-accent" title="前往自定义目的地" @click="openFreeTravel">
          ✨ 自由探索
        </button>
      </div>
      <span class="imap-footer-info">
        {{ store.activePack?.name ?? '未加载地图' }}
      </span>
    </div>

    <!-- 自由探索（面板级别的 TravelMenu，不依赖 pin）-->
    <TravelMenu v-if="showFreeTravel" :destination="''" @close="closeFreeTravel" />
  </div>
</template>

<style lang="scss" scoped>
.imap-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(800px, 92vw);
  height: min(600px, 85vh);
  background: #1a1a1e;
  border: 1px solid rgba(179, 139, 89, 0.5);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 8px 48px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.04);
  z-index: 20005;
  backdrop-filter: blur(12px);
}

.imap-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  min-height: 42px;
  flex-shrink: 0;
}

.imap-header-left {
  display: flex;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
  flex: 1;
  min-width: 0;

  &::-webkit-scrollbar {
    display: none;
  }
}

.imap-header-right {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  margin-left: 8px;
}

.imap-breadcrumbs {
  display: flex;
  align-items: center;
  gap: 2px;
  white-space: nowrap;
}

.imap-breadcrumb {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.08);
  }

  &.active {
    color: #b38b59;
    font-weight: 600;
  }
}

.imap-breadcrumb-sep {
  color: rgba(255, 255, 255, 0.2);
  font-size: 14px;
  user-select: none;
}

.imap-body {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.imap-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
  flex-wrap: wrap;
}

.imap-footer-left {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.imap-footer-info {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
  max-width: 45%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.imap-btn {
  background: rgba(179, 139, 89, 0.15);
  border: 1px solid rgba(179, 139, 89, 0.3);
  color: #c9a96a;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: rgba(179, 139, 89, 0.25);
    border-color: rgba(179, 139, 89, 0.5);
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
}

.imap-btn-ghost {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  padding: 4px 8px;

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.08) !important;
    border: none !important;
  }
}

.imap-btn-accent {
  background: linear-gradient(135deg, rgba(179, 139, 89, 0.6), rgba(154, 117, 72, 0.6));
  border-color: rgba(179, 139, 89, 0.55);
  color: #fff;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(201, 158, 104, 0.8), rgba(179, 139, 89, 0.8));
    border-color: rgba(179, 139, 89, 0.75);
  }
}

.imap-close-btn {
  font-size: 16px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}
</style>
