<template>
  <div class="events-tab">
    <!-- 当前阶段 -->
    <div class="phase-block">
      <div class="phase-num">PHASE {{ data.事件.阶段 }}</div>
      <div class="phase-desc">{{ data.事件.阶段描述 }}</div>
    </div>

    <!-- 关键事件（倒序） -->
    <div class="section" v-if="sortedEvents.length > 0">
      <div class="section-title">KEY EVENTS</div>
      <div
        v-for="([name, evt]) in sortedEvents"
        :key="name"
        class="event-item"
      >
        <div class="event-name">{{ name }}</div>
        <div class="event-desc">{{ evt.描述 }}</div>
      </div>
    </div>

    <!-- 死亡记录 -->
    <div class="section death-section" v-if="Object.keys(data.事件.死亡记录).length > 0">
      <div class="section-title">DEATH TOLL</div>
      <div
        v-for="(record, name) in data.事件.死亡记录"
        :key="name"
        class="death-item"
      >
        <span class="death-name">{{ name }}</span>
        <span class="death-cause">{{ record.死因 }}</span>
        <span class="death-scene">@ {{ record.场景 }}</span>
      </div>
    </div>

    <div class="empty-tip" v-if="sortedEvents.length === 0 && Object.keys(data.事件.死亡记录).length === 0">
      尚无事件记录
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useDataStore } from '../store';

const store = useDataStore();
const { data } = storeToRefs(store);

const sortedEvents = computed(() =>
  Object.entries(data.value.事件.关键事件)
    .sort(([, a], [, b]) => b.$time - a.$time),
);
</script>

<style scoped>
.events-tab {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 阶段块 */
.phase-block {
  background: var(--rbr-black);
  padding: 8px 12px;
  position: relative;
  overflow: hidden;
}

.phase-block::before {
  content: '';
  position: absolute;
  top: -10px;
  right: -10px;
  width: 40px;
  height: 40px;
  background: var(--rbr-red);
  transform: rotate(45deg);
}

.phase-num {
  font-size: 22px;
  font-weight: 900;
  color: var(--rbr-red);
  letter-spacing: 4px;
  text-transform: uppercase;
}

.phase-desc {
  font-size: 11px;
  font-weight: 700;
  color: var(--rbr-paper);
  margin-top: 2px;
  line-height: 1.4;
}

/* 通用区块 */
.section {
  border: var(--rbr-border);
  padding: 6px 8px;
  background: var(--rbr-paper);
}

.section-title {
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 3px;
  color: var(--rbr-paper);
  background: var(--rbr-black);
  margin: -6px -8px 6px;
  padding: 3px 8px;
  text-transform: uppercase;
}

/* 关键事件 */
.event-item {
  padding: 4px 0;
  border-bottom: 1px solid var(--rbr-paper-dark);
}

.event-item:last-child { border-bottom: none; }

.event-name {
  font-size: 11px;
  font-weight: 900;
  margin-bottom: 2px;
}

.event-desc {
  font-size: 10px;
  color: #555;
  line-height: 1.4;
}

/* 死亡记录 */
.death-section {
  border-color: var(--rbr-red);
}

.death-section .section-title {
  background: var(--rbr-red);
}

.death-item {
  display: flex;
  gap: 8px;
  align-items: baseline;
  padding: 3px 0;
  border-bottom: 1px solid var(--rbr-paper-dark);
}

.death-item:last-child { border-bottom: none; }

.death-name {
  font-size: 11px;
  font-weight: 900;
  min-width: 50px;
  flex-shrink: 0;
}

.death-cause {
  font-size: 10px;
  font-weight: 700;
  color: var(--rbr-red);
  flex: 1;
}

.death-scene {
  font-size: 10px;
  color: #888;
  flex-shrink: 0;
}

.empty-tip {
  font-size: 11px;
  color: #888;
  text-align: center;
  padding: 16px;
  font-style: italic;
}

@media (max-width: 640px) {
  .phase-num {
    font-size: 18px;
    letter-spacing: 2px;
  }

  .death-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }

  .death-name {
    min-width: 0;
  }
}
</style>
