<template>
  <div class="scene-tab">
    <!-- 基础信息 -->
    <div class="section">
      <div class="section-title">SCENE</div>
      <div class="info-row">
        <span class="label">区域</span>
        <span class="value">{{ data.场景.当前区域 }}</span>
      </div>
      <div class="info-row">
        <span class="label">时间</span>
        <span class="value">{{ data.场景.时间 }}</span>
      </div>
      <div class="info-row">
        <span class="label">环境</span>
        <span class="value">{{ data.场景.天气与环境 }}</span>
      </div>
    </div>

    <!-- 逃生进度 -->
    <div class="section" v-if="Object.keys(data.场景.逃生进度).length > 0">
      <div class="section-title">ESCAPE</div>
      <div
        v-for="(cond, name) in data.场景.逃生进度"
        :key="name"
        class="escape-row"
        :class="{ achieved: cond.是否达成 }"
      >
        <span class="escape-icon">{{ cond.是否达成 ? '■' : '□' }}</span>
        <span class="escape-name">{{ name }}</span>
        <span class="escape-desc">{{ cond.描述 }}</span>
      </div>
    </div>

    <!-- 区域状态（可操控） -->
    <div class="section" v-if="Object.keys(data.场景.区域状态).length > 0">
      <div class="section-title">AREA CONTROL</div>
      <div
        v-for="(area, name) in data.场景.区域状态"
        :key="name"
        class="area-item"
      >
        <div class="area-main">
          <span class="area-name">{{ name }}</span>
          <span class="area-danger">危险 Lv.{{ area.危险等级 }}</span>
          <span class="area-explored" v-if="area.已探索">已探索</span>
        </div>
        <div class="area-controls">
          <button
            class="toggle-btn"
            :class="{ blocked: !area.可通行 }"
            @click="toggleAreaAccess(String(name))"
          >
            {{ area.可通行 ? '✓ 通行' : '✕ 封锁' }}
          </button>
        </div>
        <div class="area-desc">{{ area.描述 }}</div>
      </div>
    </div>

    <div class="empty-tip" v-if="Object.keys(data.场景.区域状态).length === 0 && Object.keys(data.场景.逃生进度).length === 0">
      场景尚未初始化
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useDataStore } from '../store';

const store = useDataStore();
const { data } = storeToRefs(store);

function toggleAreaAccess(name: string) {
  const area = data.value.场景.区域状态[name];
  if (!area) return;
  area.可通行 = !area.可通行;
  const newState = area.可通行;
  data.value.系统日志.push({
    操作: `将区域「${name}」设为${newState ? '可通行' : '不可通行'}`,
    时间戳: Date.now(),
  });
}
</script>

<style scoped>
.scene-tab {
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

.info-row:last-child {
  border-bottom: none;
}

.label {
  font-size: 10px;
  font-weight: 900;
  color: var(--rbr-red);
  text-transform: uppercase;
  letter-spacing: 1px;
  min-width: 36px;
  flex-shrink: 0;
}

.value {
  font-size: 11px;
  color: var(--rbr-black);
  font-weight: 700;
}

/* 逃生进度 */
.escape-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 0;
  border-bottom: 1px solid var(--rbr-paper-dark);
}

.escape-row:last-child { border-bottom: none; }

.escape-row.achieved .escape-name {
  color: var(--rbr-red);
  text-decoration: line-through;
}

.escape-icon {
  font-size: 12px;
  color: var(--rbr-red);
  font-weight: 900;
  flex-shrink: 0;
}

.escape-name {
  font-size: 11px;
  font-weight: 900;
  min-width: 60px;
}

.escape-desc {
  font-size: 10px;
  color: #555;
}

/* 区域 */
.area-item {
  padding: 4px 0;
  border-bottom: 2px solid var(--rbr-paper-dark);
}

.area-item:last-child { border-bottom: none; }

.area-main {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 3px;
}

.area-name {
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 1px;
  flex: 1;
}

.area-danger {
  font-size: 10px;
  font-weight: 900;
  color: var(--rbr-red);
  border: 2px solid var(--rbr-red);
  padding: 1px 4px;
}

.area-explored {
  font-size: 9px;
  font-weight: 900;
  background: var(--rbr-black);
  color: var(--rbr-paper);
  padding: 1px 4px;
}

.area-controls {
  margin-bottom: 3px;
}

.toggle-btn {
  font-family: var(--rbr-font);
  font-size: 10px;
  font-weight: 900;
  padding: 3px 10px;
  border: 2px solid var(--rbr-black);
  border-radius: 0;
  cursor: pointer;
  background: var(--rbr-paper);
  color: var(--rbr-black);
  letter-spacing: 1px;
  transition: background 0.1s, color 0.1s;
}

.toggle-btn.blocked {
  background: var(--rbr-red);
  color: #fff;
  border-color: var(--rbr-red-dark);
}

.area-desc {
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
  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }

  .label {
    min-width: 0;
  }

  .escape-row {
    flex-wrap: wrap;
    align-items: flex-start;
  }

  .escape-name {
    min-width: 0;
  }

  .escape-desc {
    width: 100%;
  }

  .area-main {
    flex-wrap: wrap;
    align-items: flex-start;
  }

  .area-name {
    width: 100%;
  }

  .toggle-btn {
    width: 100%;
  }
}
</style>
