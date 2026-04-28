<script setup lang="ts">
import type { Pin } from '../types';
import { useMapStore } from '../store';

const props = defineProps<{ pin: Pin }>();
const emit = defineEmits<{
  close: [];
  travel: [destination: string];
}>();

const store = useMapStore();

/** 当前显示的分区索引（可以是楼层、也可以是无高度区分的并列区域），-1 表示未进入分区详情 */
const selectedFloor = ref(-1);

function goToPin() {
  emit('travel', props.pin.name);
}

function goToFloor(index: number) {
  if (!props.pin.floors?.[index]) return;
  emit('travel', props.pin.floors[index].name);
}

function enterSubMap() {
  if (props.pin.type === 'portal' && props.pin.targetMapId) {
    store.navigateToMap(props.pin.targetMapId);
    emit('close');
  }
}
</script>

<template>
  <!-- 遮罩层 -->
  <div class="imap-overlay" @click="emit('close')">
    <div class="imap-popup" @click.stop>
      <!-- 标题 -->
      <div class="imap-popup-header">
        <div class="imap-popup-color" :style="{ background: pin.color }" />
        <h3 v-if="selectedFloor < 0">{{ pin.name }}</h3>
        <h3 v-else>
          <button class="imap-popup-back" @click="selectedFloor = -1">←</button>
          {{ pin.floors![selectedFloor].name }}
        </h3>
        <button class="imap-popup-close" @click="emit('close')">✕</button>
      </div>

      <!-- 内容 -->
      <div class="imap-popup-body">
        <!-- 点位详情 -->
        <template v-if="selectedFloor < 0">
          <p class="imap-popup-desc">{{ pin.desc || '暂无描述' }}</p>

          <!-- 内部分区列表 (building 类型) -->
          <div v-if="pin.type === 'building' && pin.floors?.length" class="imap-floors">
            <h4>内部分区</h4>
            <div v-for="(floor, i) in pin.floors" :key="i" class="imap-floor-item" @click="selectedFloor = i">
              <span class="imap-floor-name">{{ floor.name }}</span>
              <span class="imap-floor-arrow">›</span>
            </div>
          </div>
        </template>

        <!-- 分区详情 -->
        <template v-else>
          <p class="imap-popup-desc">{{ pin.floors![selectedFloor].desc || '暂无描述' }}</p>
        </template>
      </div>

      <!-- 操作按钮 -->
      <div class="imap-popup-actions">
        <template v-if="pin.type === 'portal' && pin.targetMapId">
          <button class="imap-btn imap-btn-primary" @click="enterSubMap">🌀 进入该区域</button>
        </template>
        <template v-else-if="selectedFloor >= 0">
          <button class="imap-btn imap-btn-primary" @click="goToFloor(selectedFloor)">🚀 前往此分区</button>
        </template>
        <template v-else>
          <button class="imap-btn imap-btn-primary" @click="goToPin">🚀 前往此处</button>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.imap-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(2px);
}

.imap-popup {
  background: #222228;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  width: min(380px, 88vw);
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
  animation: popupIn 0.2s ease-out;
}

@keyframes popupIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(8px);
  }

  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.imap-popup-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  h3 {
    flex: 1;
    margin: 0;
    font-size: 16px;
    color: #fff;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.imap-popup-color {
  width: 4px;
  height: 24px;
  border-radius: 2px;
  flex-shrink: 0;
}

.imap-popup-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
  }
}

.imap-popup-back {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 16px;
  cursor: pointer;
  padding: 2px 4px;

  &:hover {
    color: #fff;
  }
}

.imap-popup-body {
  padding: 14px 16px;
  overflow-y: auto;
  flex: 1;
}

.imap-popup-desc {
  color: rgba(255, 255, 255, 0.65);
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 12px;
}

.imap-floors {
  h4 {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.4);
    margin: 0 0 8px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}

.imap-floor-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
  margin-bottom: 2px;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }
}

.imap-floor-name {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}

.imap-floor-arrow {
  color: rgba(255, 255, 255, 0.25);
  font-size: 16px;
}

.imap-popup-actions {
  padding: 12px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  justify-content: center;
  gap: 8px;
}

.imap-btn {
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.imap-btn-primary {
  background: linear-gradient(135deg, #b38b59, #9a7548);
  color: #fff;
  font-weight: 500;

  &:hover {
    background: linear-gradient(135deg, #c99e68, #b38b59);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(179, 139, 89, 0.3);
  }
}
</style>
