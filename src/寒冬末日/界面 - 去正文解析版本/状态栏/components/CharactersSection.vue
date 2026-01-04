<template>
  <section id="characters-section" class="section">
    <h2 class="section-title">👤 登场角色 👤</h2>
    <div class="status-tabs-container">
      <template v-if="active_character_keys.length > 0">
        <div class="tab-buttons">
          <button
            v-for="key in active_character_keys"
            :key="key"
            class="tab-button"
            :class="{ active: active_character_key === key }"
            type="button"
            @click="setActiveCharacter(key)"
          >
            {{ getCharacterDisplayName(key) }}
          </button>
        </div>

        <div
          v-for="key in active_character_keys"
          v-show="active_character_key === key"
          :key="`${key}:tab`"
          class="tab-content"
          :class="{ active: active_character_key === key }"
        >
          <div class="status-grid">
            <div class="status-item health-section">
              <div class="health-section-header">
                <div class="label">❤️ 健康</div>
                <div class="value">{{ getCharacter(key)?.健康 ?? '--' }}</div>
              </div>
              <div class="health-status-subtext">{{ getCharacter(key)?.健康状况 ?? '--' }}</div>
              <div class="progress-bar-container">
                <div class="progress-bar-value" :style="{ width: `${healthPercent(key)}%` }"></div>
              </div>
              <div class="value-subtext">{{ getCharacterChange(key) }}</div>
            </div>

            <div class="details-grid">
              <div class="status-item">
                <div class="label">👚 衣着</div>
                <div class="value">{{ getCharacter(key)?.衣着 ?? '--' }}</div>
              </div>
              <div class="status-item">
                <div class="label">👅 舌唇</div>
                <div class="value">{{ getCharacter(key)?.舌唇 ?? '--' }}</div>
              </div>
              <div class="status-item">
                <div class="label">🍈 胸乳</div>
                <div class="value">{{ getCharacter(key)?.胸乳 ?? '--' }}</div>
              </div>
              <div class="status-item">
                <div class="label">🌸 私穴</div>
                <div class="value">{{ getCharacter(key)?.私穴 ?? '--' }}</div>
              </div>
              <div class="status-item">
                <div class="label">😊 神态样貌</div>
                <div class="value">{{ getCharacter(key)?.神态样貌 ?? '--' }}</div>
              </div>
              <div class="status-item">
                <div class="label">💃 动作姿势</div>
                <div class="value">{{ getCharacter(key)?.动作姿势 ?? '--' }}</div>
              </div>
            </div>

            <div class="status-item">
              <div class="label">💭 内心想法</div>
              <div class="value thought-text">{{ getCharacter(key)?.内心想法 ?? '--' }}</div>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="content-text">暂无登场角色</div>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import _ from 'lodash';
import type { Schema as SchemaType } from '../../../schema';
import { useDataStore } from '../../store';

// 扩展 CharacterKey 以包含临时 NPC 的 key (格式: "临时NPC:姓名")
type CharacterKey =
  | Exclude<keyof SchemaType, '世界' | '庇护所' | '楼层其他住户' | '房间' | '主线任务' | '临时NPC'>
  | string;

const CHARACTER_ORDER = [
  '浅见亚美',
  '相田哲也',
  '星野琉璃',
  '早川遥',
  '早川舞',
  '藤井雪乃',
  '中村惠子',
  '爱宫心爱',
  '爱宫铃',
  '桃乐丝・泽巴哈',
  '何铃',
  '王静',
  '康绮月',
  '薛萍',
  '小泽花',
] as const;

const store = useDataStore();

const active_character_keys = computed<CharacterKey[]>(() => {
  const keys: CharacterKey[] = [];

  // 1. 先添加预设角色（按固定顺序）
  CHARACTER_ORDER.forEach(key => {
    const char = store.data[key] as any;
    if (char && char.登场状态 === '登场') keys.push(key);
  });

  // 2. 添加临时 NPC
  const tempNPCs = store.data.临时NPC;
  if (tempNPCs) {
    Object.keys(tempNPCs).forEach(npcName => {
      const char = tempNPCs[npcName];
      if (char && char.登场状态 === '登场') {
        keys.push(`临时NPC:${npcName}`);
      }
    });
  }

  return keys;
});

const active_character_key = ref<CharacterKey | null>(null);

watch(
  active_character_keys,
  keys => {
    if (keys.length === 0) {
      active_character_key.value = null;
      return;
    }

    if (!active_character_key.value || !keys.includes(active_character_key.value)) {
      active_character_key.value = keys[0];
    }
  },
  { immediate: true },
);

function getCharacter(key: CharacterKey) {
  if (typeof key === 'string' && key.startsWith('临时NPC:')) {
    const realName = key.split(':')[1];
    return store.data.临时NPC[realName];
  }
  return store.data[key as keyof typeof store.data] as any;
}

function getCharacterChange(key: CharacterKey) {
  const char = getCharacter(key);
  if (!char || !char.健康更新原因) return '';
  return char.健康更新原因;
}

function getCharacterDisplayName(key: CharacterKey) {
  const char = getCharacter(key);
  const name = typeof char?.姓名 === 'string' ? char.姓名.trim() : '';
  // 如果是临时NPC，去掉前缀显示
  if (typeof key === 'string' && key.startsWith('临时NPC:')) {
    return key.split(':')[1];
  }
  return name ? name : key;
}

function setActiveCharacter(key: CharacterKey) {
  active_character_key.value = key;
}

function healthPercent(key: CharacterKey) {
  const char = getCharacter(key);
  const health = char?.健康;
  if (typeof health !== 'number') return 0;
  return _.clamp(health, 0, 100);
}
</script>
