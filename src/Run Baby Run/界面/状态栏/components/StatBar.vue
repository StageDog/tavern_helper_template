<template>
  <div class="stat-bar-row">
    <span class="stat-label">{{ label }}</span>
    <div class="bar-track">
      <div class="bar-fill" :class="barClass" :style="{ width: fillWidth + '%' }"></div>
    </div>
    <span class="stat-num" :class="numClass">{{ value }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  label: string;
  value: number;
  max: number;
  min?: number;
  invert?: boolean;   // true=高值=红色（如恐惧），false=低值=红色
  signed?: boolean;   // 有负值（如信任 -100~100）
}>(), {
  min: 0,
  invert: false,
  signed: false,
});

const range = computed(() => props.max - props.min);

const fillWidth = computed(() => {
  if (props.signed) {
    // -100~100 → 中线在50%
    return ((props.value - props.min) / range.value) * 100;
  }
  return (props.value / props.max) * 100;
});

const isHigh = computed(() => props.value / props.max >= 0.7);
const isLow = computed(() => props.value / props.max <= 0.3);

const barClass = computed(() => {
  if (props.signed) {
    return props.value < 0 ? 'bar-red' : 'bar-black';
  }
  if (props.invert) {
    // 高值=危险=红色
    return isHigh.value ? 'bar-red' : 'bar-black';
  } else {
    // 低值=危险=红色
    return isLow.value ? 'bar-red' : 'bar-black';
  }
});

const numClass = computed(() => {
  if (props.signed) return props.value < 0 ? 'num-red' : 'num-black';
  if (props.invert) return isHigh.value ? 'num-red' : 'num-black';
  return isLow.value ? 'num-red' : 'num-black';
});
</script>

<style scoped>
.stat-bar-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat-label {
  font-size: 9px;
  font-weight: 900;
  color: var(--rbr-red);
  text-transform: uppercase;
  letter-spacing: 1px;
  min-width: 28px;
  flex-shrink: 0;
}

.bar-track {
  flex: 1;
  height: 8px;
  background: var(--rbr-paper-dark);
  border: 1px solid var(--rbr-black);
  position: relative;
  overflow: hidden;
}

.bar-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  transition: width 0.3s;
}

.bar-black { background: var(--rbr-black); }
.bar-red { background: var(--rbr-red); }

.stat-num {
  font-size: 10px;
  font-weight: 900;
  min-width: 24px;
  text-align: right;
  flex-shrink: 0;
}

.num-black { color: var(--rbr-black); }
.num-red { color: var(--rbr-red); }

@media (max-width: 640px) {
  .stat-label {
    min-width: 34px;
  }

  .bar-track {
    min-width: 0;
  }
}
</style>
