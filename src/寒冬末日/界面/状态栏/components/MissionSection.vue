<template>
  <section id="mission-section" class="section">
    <h2 class="section-title">📜 主线任务 📜</h2>
    <div class="mission-content">
      <!-- 当前阶段 -->
      <div class="mission-phase">
        <div class="phase-label">📍 当前阶段</div>
        <div class="phase-name">{{ store.data.主线任务.当前阶段 }}</div>
      </div>

      <!-- 阶段目标进度条 -->
      <div class="goals-progress-bar">
        <div class="progress-header">
          <span>🎯 阶段目标进度</span>
          <span class="progress-text">{{ completedGoals }}/{{ store.data.主线任务.阶段目标.length }}</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
      </div>

      <!-- 阶段目标 -->
      <div class="mission-goals">
        <button class="collapse-toggle-btn" @click="isGoalsExpanded = !isGoalsExpanded">
          <span class="toggle-icon">{{ isGoalsExpanded ? '▼' : '▶' }}</span>
          <span class="toggle-text">📋 目标清单</span>
          <span class="goals-count">({{ completedGoals }}/{{ store.data.主线任务.阶段目标.length }})</span>
        </button>
        <div v-show="isGoalsExpanded" class="goals-list">
          <template v-if="store.data.主线任务.阶段目标.length > 0">
            <div
              v-for="(goal, idx) in store.data.主线任务.阶段目标"
              :key="idx"
              class="goal-item"
              :class="{ completed: isGoalCompleted(idx) }"
            >
              <div class="goal-checkbox">
                <svg v-if="isGoalCompleted(idx)" viewBox="0 0 24 24" class="check-icon">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                <svg v-else viewBox="0 0 24 24" class="check-icon empty">
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </div>
              <div class="goal-content">
                <span class="goal-text" :class="{ completed: isGoalCompleted(idx) }">{{ goal }}</span>
                <span v-if="isGoalCompleted(idx)" class="goal-status-tag">已完成</span>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="goal-item empty">(暂无目标)</div>
          </template>
        </div>
      </div>

      <!-- 情报碎片 -->
      <div class="mission-intel">
        <button class="collapse-toggle-btn" @click="isIntelExpanded = !isIntelExpanded">
          <span class="toggle-icon">{{ isIntelExpanded ? '▼' : '▶' }}</span>
          <span class="toggle-text">🔍 情报碎片</span>
          <span class="intel-count">({{ intelCompleted }}/{{ intelTotal }})</span>
        </button>
        <div v-show="isIntelExpanded" class="intel-list">
          <template v-if="intelTotal > 0">
            <div v-for="(intel, key) in store.data.主线任务.情报碎片" :key="key" class="intel-item" :class="intel.状态">
              <div class="intel-status-ring" :class="intel.状态">
                <svg viewBox="0 0 36 36" class="progress-ring">
                  <circle cx="18" cy="18" r="16" class="ring-bg" />
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    class="ring-progress"
                    :stroke-dasharray="getRingProgress(intel.状态)"
                    :class="intel.状态"
                  />
                </svg>
                <span class="ring-icon">{{ getStatusIcon(intel.状态) }}</span>
              </div>
              <div class="intel-content">
                <div class="intel-header">
                  <span class="intel-id">{{ intel.编号 }}</span>
                  <span class="intel-status-badge" :class="intel.状态">{{ intel.状态 }}</span>
                </div>
                <div class="intel-desc">{{ intel.描述 }}</div>
                <div class="intel-meta">
                  <span class="intel-value">💰 {{ intel.价值 }}</span>
                  <span class="intel-risk">⚠️ {{ intel.风险 }}</span>
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="intel-item empty">(暂无情报碎片)</div>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDataStore } from '../../store';

const store = useDataStore();
const isGoalsExpanded = ref(false);
const isIntelExpanded = ref(false);

// 阶段目标完成状态存储
const completedGoals = computed(() => store.data.主线任务.阶段目标.filter((_, idx) => isGoalCompleted(idx)).length);

const progressPercent = computed(() => {
  const total = store.data.主线任务.阶段目标.length;
  if (total === 0) return 0;
  return Math.round((completedGoals.value / total) * 100);
});

// 从 store 读取目标完成状态
function isGoalCompleted(idx: number): boolean {
  const key = String(idx);
  return store.data.主线任务.目标完成状态[key] === true;
}

// 情报碎片统计
const intelTotal = computed(() => Object.keys(store.data.主线任务.情报碎片).length);
const intelCompleted = computed(
  () => Object.values(store.data.主线任务.情报碎片).filter(i => i.状态 === '已完成').length,
);

function getStatusIcon(status: string): string {
  switch (status) {
    case '已完成':
      return '✓';
    case '已探索':
      return '◐';
    case '未探索':
      return '○';
    default:
      return '○';
  }
}

function getRingProgress(status: string): string {
  let progress = 33;
  switch (status) {
    case '已完成':
      progress = 100;
      break;
    case '已探索':
      progress = 66;
      break;
    case '未探索':
      progress = 33;
      break;
  }
  const circumference = 2 * Math.PI * 16;
  const offset = circumference - (progress / 100) * circumference;
  return `${progress} ${circumference} ${offset}`;
}
</script>

<style scoped>
.mission-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mission-phase {
  background-color: var(--bg-medium);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.phase-label {
  font-size: 0.85em;
  color: var(--text-color);
  opacity: 0.8;
  margin-bottom: 6px;
}

.phase-name {
  font-size: 1em;
  font-weight: bold;
  color: var(--accent-gold);
}

/* 进度条 */
.goals-progress-bar {
  background-color: var(--bg-medium);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.9em;
  color: var(--text-color);
}

.progress-text {
  color: var(--accent-gold);
  font-weight: bold;
}

.progress-track {
  height: 8px;
  background-color: var(--bg-dark);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--dialog-color), var(--accent-gold));
  border-radius: 4px;
  transition: width 0.3s ease;
}

.mission-goals,
.mission-intel {
  margin-top: 4px;
}

.goals-count,
.intel-count {
  font-size: 0.85em;
  opacity: 0.7;
}

.goals-list,
.intel-list {
  margin-top: 8px;
  padding: 8px;
  background-color: var(--bg-dark);
  border-radius: 8px;
}

/* 目标清单 */
.goal-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;
}

.goal-item:last-child {
  border-bottom: none;
}

.goal-item.empty {
  color: var(--text-color);
  opacity: 0.6;
  justify-content: center;
}

.goal-item.completed {
  background-color: rgba(80, 250, 123, 0.1);
}

.goal-checkbox {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  margin-top: 1px;
}

.check-icon {
  width: 100%;
  height: 100%;
  fill: var(--dialog-color);
}

.check-icon.empty {
  fill: var(--bg-light);
  stroke: var(--text-color);
  opacity: 0.5;
}

.goal-content {
  flex: 1;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  flex-wrap: wrap;
}

.goal-text {
  font-size: 0.9em;
  color: var(--text-color);
  line-height: 1.4;
  flex: 1;
  transition: all 0.2s ease;
}

.goal-text.completed {
  opacity: 0.6;
  text-decoration: line-through;
}

.goal-status-tag {
  font-size: 0.7em;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: var(--dialog-color);
  color: var(--bg-dark);
  font-weight: bold;
}

/* 情报碎片 */
.intel-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background-color: var(--bg-medium);
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  border-left: 3px solid transparent;
  transition: all 0.2s ease;
}

.intel-item:last-child {
  margin-bottom: 0;
}

.intel-item.empty {
  text-align: center;
  color: var(--text-color);
  opacity: 0.6;
  padding: 16px;
  justify-content: center;
  border-left: none;
}

.intel-item.已完成 {
  border-left-color: var(--dialog-color);
  background-color: rgba(80, 250, 123, 0.08);
}

.intel-item.已探索 {
  border-left-color: var(--accent-blue);
  background-color: rgba(189, 147, 249, 0.08);
}

.intel-item.未探索 {
  border-left-color: var(--text-color);
  opacity: 0.7;
}

/* 进度环 */
.intel-status-ring {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  position: relative;
}

.progress-ring {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.ring-bg {
  fill: none;
  stroke: var(--bg-dark);
  stroke-width: 2;
}

.ring-progress {
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  transition: stroke-dasharray 0.3s ease;
}

.ring-progress.已完成 {
  stroke: var(--dialog-color);
}

.ring-progress.已探索 {
  stroke: var(--accent-blue);
}

.ring-progress.未探索 {
  stroke: var(--text-color);
  opacity: 0.5;
}

.ring-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.75em;
  font-weight: bold;
}

.intel-content {
  flex: 1;
  min-width: 0;
}

.intel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.intel-id {
  font-weight: bold;
  color: var(--accent-gold);
  font-size: 0.9em;
}

.intel-status-badge {
  font-size: 0.7em;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: bold;
}

.intel-status-badge.未探索 {
  color: var(--text-color);
  background-color: var(--bg-dark);
}

.intel-status-badge.已探索 {
  color: var(--bg-dark);
  background-color: var(--accent-blue);
}

.intel-status-badge.已完成 {
  color: var(--bg-dark);
  background-color: var(--dialog-color);
}

.intel-desc {
  font-size: 0.85em;
  color: var(--text-color);
  margin-bottom: 8px;
  line-height: 1.4;
}

.intel-meta {
  display: flex;
  gap: 12px;
  font-size: 0.75em;
}

.intel-value {
  color: var(--accent-gold);
}

.intel-risk {
  color: var(--accent-red);
}
</style>
