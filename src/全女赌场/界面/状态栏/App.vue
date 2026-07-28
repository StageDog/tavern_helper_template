<template>
  <div class="status-card">
    <div class="header">
      <span class="title"><i class="fa-solid fa-spade"></i> 兔窟赌场</span>
      <div class="tab-nav">
        <button class="tab-btn" :class="{ active: activeTab === 'economy' }" @click="activeTab = 'economy'">
          <i class="fa-solid fa-coins"></i> 经济
        </button>
        <button class="tab-btn" :class="{ active: activeTab === 'girls' }" @click="activeTab = 'girls'">
          <i class="fa-solid fa-heart"></i> 群友
        </button>
      </div>
      <span class="location"><i class="fa-solid fa-location-dot"></i> {{ store.data.赌场.当前位置 }}</span>
    </div>

    <Transition name="tab-slide" mode="out-in">
      <EconomyCard v-if="activeTab === 'economy'" />
      <GirlsPanel v-else />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useDataStore } from './store';
import EconomyCard from './components/EconomyCard.vue';
import GirlsPanel from './components/GirlsPanel.vue';

const store = useDataStore();
const activeTab = useLocalStorage<'economy' | 'girls'>('casino_status:tab', 'economy');
</script>

<style lang="scss" scoped>
.status-card {
  position: relative;
  overflow: hidden;
  max-width: 640px;
  margin: 0 auto;
  background: var(--card-bg);
  border: 1px solid var(--c-border);
  border-radius: 12px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 4px 24px rgba(0, 0, 0, 0.4);
  padding: 12px 14px;
  color: var(--c-text);
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 13px;
}

.header {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;

  .title {
    font-weight: bold;
    color: var(--c-text-muted);
    font-size: 13px;
    white-space: nowrap;
    letter-spacing: 0.04em;
  }

  .location {
    margin-left: auto;
    color: var(--c-text-muted);
    font-size: 12px;
    white-space: nowrap;
  }
}

.tab-nav {
  display: flex;
  gap: 4px;
}

.tab-btn {
  background: var(--c-surface-alt);
  border: 1px solid var(--c-border);
  border-radius: 14px;
  color: var(--c-text-muted);
  padding: 3px 12px;
  font-size: 12px;
  cursor: pointer;
  font-family: inherit;
  transition:
    color 0.2s,
    border-color 0.2s;

  &:hover {
    color: var(--c-text);
  }

  &.active {
    color: var(--c-primary);
    border-color: var(--c-primary);
    box-shadow: var(--glow-gold);
  }
}

.tab-slide-enter-active,
.tab-slide-leave-active {
  transition:
    opacity 0.18s,
    transform 0.18s;
}

.tab-slide-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.tab-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
