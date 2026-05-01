<template>
  <div class="syslog-bar" v-if="logs.length > 0">
    <div class="syslog-indicator" @click="expanded = !expanded">
      <span class="syslog-dot"></span>
      <span class="syslog-count">{{ logs.length }} 条待处理日志</span>
      <span class="syslog-arrow">{{ expanded ? '▲' : '▼' }}</span>
    </div>
    <div class="syslog-list" v-if="expanded">
      <div
        v-for="(entry, i) in logs"
        :key="i"
        class="syslog-entry"
      >
        <span class="syslog-bullet">►</span>
        <span class="syslog-text">{{ entry.操作 }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useDataStore } from '../store';

const store = useDataStore();
const { data } = storeToRefs(store);
const logs = computed(() => data.value.系统日志);
const expanded = ref(false);
</script>

<style scoped>
.syslog-bar {
  border-top: var(--rbr-border-red);
  background: var(--rbr-black);
}

.syslog-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  cursor: pointer;
  user-select: none;
}

.syslog-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  background: var(--rbr-red);
  animation: pulse 1s infinite;
  flex-shrink: 0;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.syslog-count {
  font-size: 10px;
  font-weight: 900;
  color: var(--rbr-red);
  letter-spacing: 1px;
  flex: 1;
}

.syslog-arrow {
  font-size: 9px;
  color: var(--rbr-paper-dark);
  flex-shrink: 0;
}

.syslog-list {
  padding: 4px 8px 6px;
  border-top: 1px solid #333;
  display: flex;
  flex-direction: column;
  gap: 3px;
  max-height: 100px;
  overflow-y: auto;
}

.syslog-entry {
  display: flex;
  gap: 6px;
  align-items: baseline;
}

.syslog-bullet {
  font-size: 8px;
  color: var(--rbr-red);
  flex-shrink: 0;
}

.syslog-text {
  font-size: 10px;
  font-weight: 700;
  color: var(--rbr-paper);
  line-height: 1.3;
}

@media (max-width: 640px) {
  .syslog-count {
    font-size: 9px;
    letter-spacing: 0.5px;
  }
}
</style>
