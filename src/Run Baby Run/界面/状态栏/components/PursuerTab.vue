<template>
  <div class="pursuer-tab">
    <div class="section">
      <div class="section-title">PURSUER STATUS</div>

      <div class="info-row">
        <span class="label">位置</span>
        <span class="value">{{ data.追击者.当前位置 }}</span>
      </div>

      <div class="info-row">
        <span class="label">身份</span>
        <span class="value" v-if="data.追击者.伪装身份">{{ data.追击者.伪装身份 }}</span>
        <span class="value exposed" v-else>■ 已暴露</span>
      </div>

      <div class="info-row">
        <span class="label">已造成效果</span>
        <span class="value">{{ data.追击者.已造成的效果 }}</span>
      </div>
    </div>

    <!-- 暴露程度 -->
    <div class="section">
      <div class="section-title">EXPOSURE</div>
      <div class="exposure-row">
        <span class="exposure-label">暴露程度</span>
        <span class="exposure-num" :class="{ danger: data.追击者.暴露程度 >= 70 }">
          {{ data.追击者.暴露程度 }}<span class="unit">/100</span>
        </span>
      </div>
      <div class="bar-track">
        <div
          class="bar-fill"
          :class="getExposureClass(data.追击者.暴露程度)"
          :style="{ width: data.追击者.暴露程度 + '%' }"
        ></div>
      </div>
    </div>

    <!-- 威胁手段 -->
    <div class="section" v-if="Object.keys(data.追击者.威胁手段).length > 0">
      <div class="section-title">THREAT METHODS</div>
      <div
        v-for="(method, name) in data.追击者.威胁手段"
        :key="name"
        class="method-item"
      >
        <div class="method-header">
          <span class="method-name">{{ name }}</span>
          <span class="method-type" :class="'type-' + method.类型">{{ method.类型 }}</span>
        </div>
        <div class="method-desc">{{ method.描述 }}</div>
      </div>
    </div>

    <div class="empty-tip" v-if="Object.keys(data.追击者.威胁手段).length === 0">
      威胁手段未知
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useDataStore } from '../store';

const store = useDataStore();
const { data } = storeToRefs(store);

function getExposureClass(val: number) {
  if (val >= 80) return 'bar-critical';
  if (val >= 50) return 'bar-high';
  return 'bar-low';
}
</script>

<style scoped>
.pursuer-tab {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

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

.info-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 3px 0;
  border-bottom: 1px solid var(--rbr-paper-dark);
}

.info-row:last-child { border-bottom: none; }

.label {
  font-size: 10px;
  font-weight: 900;
  color: var(--rbr-red);
  text-transform: uppercase;
  letter-spacing: 1px;
  min-width: 60px;
  flex-shrink: 0;
}

.value {
  font-size: 11px;
  font-weight: 700;
  color: var(--rbr-black);
}

.value.exposed {
  color: var(--rbr-red);
  font-weight: 900;
  letter-spacing: 2px;
}

/* 暴露条 */
.exposure-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 4px;
}

.exposure-label {
  font-size: 10px;
  font-weight: 900;
  color: var(--rbr-red);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.exposure-num {
  font-size: 20px;
  font-weight: 900;
  color: var(--rbr-black);
  line-height: 1;
}

.exposure-num.danger {
  color: var(--rbr-red);
}

.unit {
  font-size: 11px;
  font-weight: 700;
  color: #888;
}

.bar-track {
  background: var(--rbr-black);
  height: 12px;
  width: 100%;
  position: relative;
}

.bar-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  transition: width 0.3s;
}

.bar-low { background: var(--rbr-black); }
.bar-high { background: var(--rbr-red-dark); }
.bar-critical { background: var(--rbr-red); }

/* 威胁手段 */
.method-item {
  padding: 4px 0;
  border-bottom: 1px solid var(--rbr-paper-dark);
}

.method-item:last-child { border-bottom: none; }

.method-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}

.method-name {
  font-size: 11px;
  font-weight: 900;
  flex: 1;
}

.method-type {
  font-size: 9px;
  font-weight: 900;
  padding: 1px 5px;
  letter-spacing: 1px;
}

.type-物理 { background: var(--rbr-black); color: var(--rbr-paper); }
.type-心理 { background: var(--rbr-red); color: #fff; }
.type-环境 { background: #555; color: var(--rbr-paper); }
.type-超自然 { background: var(--rbr-red-dark); color: #fff; border: 1px solid var(--rbr-red); }

.method-desc {
  font-size: 10px;
  color: #555;
  line-height: 1.4;
}

.empty-tip {
  font-size: 11px;
  color: #888;
  text-align: center;
  padding: 12px;
  font-style: italic;
}

@media (max-width: 640px) {
  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }

  .label {
    min-width: 0;
  }

  .exposure-row {
    flex-wrap: wrap;
    gap: 4px;
  }

  .exposure-num {
    font-size: 18px;
  }

  .method-header {
    flex-wrap: wrap;
    align-items: flex-start;
  }

  .method-name {
    width: 100%;
  }
}
</style>
