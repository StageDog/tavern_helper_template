<template>
  <div class="atmosphere-tab">
    <!-- 恐怖等级 -->
    <div class="horror-block">
      <div class="horror-header">
        <span class="horror-label">HORROR LEVEL</span>
        <span class="horror-num" :class="horrorNumClass">{{ data.氛围.恐怖等级 }}</span>
        <span class="horror-max">/10</span>
      </div>
      <!-- 10格刻度条 -->
      <div class="horror-track">
        <div
          v-for="i in 10"
          :key="i"
          class="horror-cell"
          :class="{ filled: i <= data.氛围.恐怖等级, critical: i >= 8 }"
        ></div>
      </div>
    </div>

    <!-- 异常现象 -->
    <div class="anomaly-block" v-if="data.氛围.异常现象">
      <div class="anomaly-title">⚠ ANOMALY</div>
      <div class="anomaly-text">{{ data.氛围.异常现象 }}</div>
    </div>

    <!-- 线索碎片 -->
    <div class="section" v-if="Object.keys(data.氛围.线索碎片).length > 0">
      <div class="section-title">CLUES</div>
      <div
        v-for="(clue, name) in data.氛围.线索碎片"
        :key="name"
        class="clue-item"
      >
        <div class="clue-header">
          <span class="clue-name">{{ name }}</span>
          <span class="clue-finder">by {{ clue.发现者 }}</span>
        </div>
        <div class="clue-content">{{ clue.内容 }}</div>
      </div>
    </div>

    <div class="empty-tip" v-if="Object.keys(data.氛围.线索碎片).length === 0">
      尚无线索
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useDataStore } from '../store';

const store = useDataStore();
const { data } = storeToRefs(store);

const horrorNumClass = computed(() => {
  const lv = data.value.氛围.恐怖等级;
  if (lv >= 8) return 'horror-critical';
  if (lv >= 5) return 'horror-high';
  return 'horror-normal';
});
</script>

<style scoped>
.atmosphere-tab {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 恐怖等级 */
.horror-block {
  background: var(--rbr-black);
  padding: 8px 12px;
}

.horror-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 6px;
}

.horror-label {
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 3px;
  color: var(--rbr-paper-dark);
}

.horror-num {
  font-size: 36px;
  font-weight: 900;
  line-height: 1;
}

.horror-normal { color: var(--rbr-paper); }
.horror-high { color: #ff8800; }
.horror-critical { color: var(--rbr-red); }

.horror-max {
  font-size: 14px;
  font-weight: 900;
  color: #666;
}

.horror-track {
  display: flex;
  gap: 3px;
}

.horror-cell {
  flex: 1;
  height: 14px;
  background: #333;
  border: 1px solid #555;
}

.horror-cell.filled {
  background: var(--rbr-paper-dark);
}

.horror-cell.filled.critical {
  background: var(--rbr-red);
}

/* 异常现象 */
.anomaly-block {
  background: var(--rbr-red);
  padding: 6px 10px;
  border: var(--rbr-border);
  border-color: var(--rbr-red-dark);
  position: relative;
  overflow: hidden;
}

.anomaly-block::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: -8px;
  width: 30px;
  height: 30px;
  background: var(--rbr-red-dark);
  transform: rotate(45deg);
}

.anomaly-title {
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 3px;
  color: #fff;
  margin-bottom: 3px;
}

.anomaly-text {
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  line-height: 1.4;
  position: relative;
  z-index: 1;
}

/* 线索 */
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

.clue-item {
  padding: 4px 0;
  border-bottom: 1px solid var(--rbr-paper-dark);
}

.clue-item:last-child { border-bottom: none; }

.clue-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}

.clue-name {
  font-size: 11px;
  font-weight: 900;
  flex: 1;
}

.clue-finder {
  font-size: 9px;
  font-weight: 700;
  color: #888;
}

.clue-content {
  font-size: 10px;
  color: #555;
  line-height: 1.4;
}

.empty-tip {
  font-size: 11px;
  color: #888;
  text-align: center;
  padding: 16px;
  font-style: italic;
}

@media (max-width: 640px) {
  .horror-header {
    flex-wrap: wrap;
    gap: 4px 8px;
  }

  .horror-label {
    width: 100%;
    letter-spacing: 2px;
  }

  .horror-num {
    font-size: 30px;
  }

  .clue-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }
}
</style>
