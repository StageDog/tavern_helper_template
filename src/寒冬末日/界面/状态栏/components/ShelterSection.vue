<template>
  <section id="shelter-section" class="section">
    <h2 class="section-title">🏰 庇护所信息 🏰</h2>
    <div class="shelter-grid">
      <div class="shelter-item">
        <div class="label">⚜️ 庇护所等级</div>
        <div class="value">{{ store.data.庇护所.庇护所等级 }}</div>
      </div>
      <div class="shelter-item">
        <div class="label">🎲 今日投掷点数</div>
        <div class="value">{{ store.data.庇护所.今日投掷点数 }}</div>
      </div>
      <div class="shelter-item">
        <div class="label">⏳ 距离下次保底升级</div>
        <div class="value">{{ store.data.庇护所.距离上次升级 }}</div>
      </div>
      <div class="shelter-item">
        <div class="label">🔒 可扩展区域状态</div>
        <div class="expansion-list">
          <div class="expansion-card" :class="{ unlocked: store.data.庇护所.可扩展区域.医疗翼 !== '未解锁' }">
            <div class="name">⚕️ 医疗翼</div>
            <div class="status">{{ store.data.庇护所.可扩展区域.医疗翼 }}</div>
          </div>
          <div class="expansion-card" :class="{ unlocked: store.data.庇护所.可扩展区域.制造工坊 !== '未解锁' }">
            <div class="name">🔧 制造工坊</div>
            <div class="status">{{ store.data.庇护所.可扩展区域.制造工坊 }}</div>
          </div>
          <div class="expansion-card" :class="{ unlocked: store.data.庇护所.可扩展区域.载具格纳库 !== '未解锁' }">
            <div class="name">🚜 载具格纳库</div>
            <div class="status">{{ store.data.庇护所.可扩展区域.载具格纳库 }}</div>
          </div>
        </div>
      </div>

      <!-- 伊甸空间地图 -->
      <div class="shelter-item">
        <div class="label">🗺️ 伊甸空间地图</div>
        <button class="map-toggle-btn" @click="isMapExpanded = !isMapExpanded">
          <span class="toggle-icon">{{ isMapExpanded ? '▼' : '▶' }}</span>
          <span class="toggle-text">{{ isMapExpanded ? '收起地图' : '展开地图' }}</span>
        </button>
        <div v-show="isMapExpanded" class="map-container">
          <!-- 玄关区域 -->
          <div class="map-zone">
            <div class="zone-label">🚪 玄关 - 净化区</div>
            <div class="room-grid entrance-grid">
              <div class="room-cell highlight">
                <div class="room-number">玄关</div>
                <div class="room-value">{{ getEntranceStatus() }}</div>
                <div class="room-resident">净化/隔离区</div>
              </div>
              <div class="room-cell" :class="{ occupied: hasTempGuestA }">
                <div class="room-number">临时客房 A</div>
                <div class="room-value">{{ hasTempGuestA ? '已入住' : '空置' }}</div>
                <div class="room-resident">{{ getTempGuestNames('A') }}</div>
              </div>
              <div class="room-cell" :class="{ occupied: hasTempGuestB }">
                <div class="room-number">临时客房 B</div>
                <div class="room-value">{{ hasTempGuestB ? '已入住' : '空置' }}</div>
                <div class="room-resident">{{ getTempGuestNames('B') }}</div>
              </div>
            </div>
          </div>

          <!-- 核心区 -->
          <div class="map-zone">
            <div class="zone-label">💎 核心生活区</div>
            <div class="room-grid core-grid">
              <div class="room-cell highlight">
                <div class="room-number">客厅</div>
                <div class="room-value">公共区域</div>
                <div class="room-resident">-</div>
              </div>
              <div class="room-cell highlight">
                <div class="room-number">餐厅/厨房</div>
                <div class="room-value">万象合成终端</div>
                <div class="room-resident">-</div>
              </div>
              <div class="room-cell" :class="{ occupied: hasBedroomUser }">
                <div class="room-number">主卧室</div>
                <div class="room-value">{{ hasBedroomUser ? '使用中' : '空闲' }}</div>
                <div class="room-resident">{{ getBedroomUserNames() }}</div>
              </div>
              <div class="room-cell" :class="{ occupied: hasBathroomUser }">
                <div class="room-number">主浴室</div>
                <div class="room-value">{{ hasBathroomUser ? '使用中' : '空闲' }}</div>
                <div class="room-resident">{{ getBathroomUserNames() }}</div>
              </div>
            </div>
          </div>

          <!-- 20层走廊 -->
          <div class="map-zone">
            <div class="zone-label">🏢 20层 - 公寓走廊</div>
            <div class="floor-indicator">↓ 通往外部楼梯</div>
            <div class="room-grid floor-grid">
              <div
                v-for="room in floor20Rooms"
                :key="room.number"
                class="room-cell"
                :class="{ 'user-room': room.number === '2001', occupied: hasFloorResident('20', room.number) }"
              >
                <div class="room-number">{{ room.number }}</div>
                <div class="room-value">{{ getFloorRoomStatus('20', room.number) }}</div>
                <div class="room-resident">{{ getFloorRoomNames('20', room.number) }}</div>
              </div>
            </div>
          </div>

          <!-- 19层走廊 -->
          <div class="map-zone">
            <div class="zone-label">🏢 19层 - 公寓走廊</div>
            <div class="room-grid floor-grid">
              <div
                v-for="room in floor19Rooms"
                :key="room.number"
                class="room-cell"
                :class="{ occupied: hasFloorResident('19', room.number) }"
              >
                <div class="room-number">{{ room.number }}</div>
                <div class="room-value">{{ getFloorRoomStatus('19', room.number) }}</div>
                <div class="room-resident">{{ getFloorRoomNames('19', room.number) }}</div>
              </div>
            </div>
            <div class="floor-indicator">↓ 通往18层</div>
          </div>
        </div>
      </div>

      <!-- 庇护所能力列表（可折叠） -->
      <div class="shelter-item">
        <button class="collapse-toggle-btn" @click="isAbilityExpanded = !isAbilityExpanded">
          <span class="toggle-icon">{{ isAbilityExpanded ? '▼' : '▶' }}</span>
          <span class="toggle-text">💡 庇护所能力列表</span>
        </button>
        <div v-show="isAbilityExpanded" class="ability-list">
          <template v-if="store.data.庇护所.庇护所能力.length > 0">
            <div v-for="(ab, idx) in store.data.庇护所.庇护所能力" :key="idx" class="ability-card">
              <div class="name">{{ ab.name }}</div>
              <div class="desc">{{ ab.desc }}</div>
            </div>
          </template>
          <template v-else>(暂无能力)</template>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDataStore } from '../../store';

const store = useDataStore();
const isMapExpanded = ref(false);
const isAbilityExpanded = ref(false);

// 20层房间数据
const floor20Rooms = [
  { number: '2001' },
  { number: '2002' },
  { number: '2003' },
  { number: '2004' },
  { number: '2005' },
  { number: '2006' },
  { number: '2007' },
  { number: '2008' },
  { number: '2009' },
  { number: '2010' },
  { number: '2011' },
  { number: '2012' },
];

// 19层房间数据
const floor19Rooms = [
  { number: '1901' },
  { number: '1902' },
  { number: '1903' },
  { number: '1904' },
  { number: '1905' },
  { number: '1906' },
  { number: '1907' },
  { number: '1908' },
  { number: '1909' },
  { number: '1910' },
  { number: '1911' },
  { number: '1912' },
];

// 玄关区域计算属性
const hasTempGuestA = computed(() => store.data.房间.玄关.临时客房A入住者.length > 0);

const hasTempGuestB = computed(() => store.data.房间.玄关.临时客房B入住者.length > 0);

function getTempGuestNames(room: 'A' | 'B'): string {
  const names = room === 'A' ? store.data.房间.玄关.临时客房A入住者 : store.data.房间.玄关.临时客房B入住者;
  return names.length > 0 ? names.join('、') : '-';
}

function getEntranceStatus(): string {
  // 玄关总是显示"就绪"
  return '就绪';
}

// 核心区计算属性
const hasBedroomUser = computed(() => store.data.房间.核心区.主卧室使用者.length > 0);

const hasBathroomUser = computed(() => store.data.房间.核心区.主浴室使用者.length > 0);

function getBedroomUserNames(): string {
  const names = store.data.房间.核心区.主卧室使用者;
  return names.length > 0 ? names.join('、') : '-';
}

function getBathroomUserNames(): string {
  const names = store.data.房间.核心区.主浴室使用者;
  return names.length > 0 ? names.join('、') : '-';
}

// 楼层房间辅助函数
function getFloorRoomData(floor: string, room: string) {
  const floorKey = floor === '20' ? '楼层20房间' : '楼层19房间';
  const rooms = store.data.房间.楼层房间[floorKey as keyof typeof store.data.房间.楼层房间];
  return rooms?.[room] || { 入住者: [] };
}

function hasFloorResident(floor: string, room: string): boolean {
  return getFloorRoomData(floor, room).入住者.length > 0;
}

function getFloorRoomStatus(floor: string, room: string): string {
  const data = getFloorRoomData(floor, room);
  return data.入住者.length > 0 ? '已入住' : '空置';
}

function getFloorRoomNames(floor: string, room: string): string {
  const data = getFloorRoomData(floor, room);
  if (data.入住者.length === 0) return '-';

  // 特殊房间显示固定名称
  if (room === '2001') return '{{user}} (你)';
  if (room === '1901') return '爱宫铃 & 爱宫心爱';

  return data.入住者.join('、');
}
</script>
