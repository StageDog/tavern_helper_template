<template>
  <div class="char-card" :class="'status-' + character.状态">
    <!-- 折叠头部 -->
    <div class="card-header" @click="expanded = !expanded">
      <div class="header-left">
        <span class="char-name">{{ name }}</span>
        <span class="status-badge" :class="'badge-' + character.状态">{{ character.状态 }}</span>
        <span class="char-pos">@ {{ character.当前位置 }}</span>
      </div>
      <span class="expand-icon">{{ expanded ? '▲' : '▼' }}</span>
    </div>

    <!-- 展开内容 -->
    <div class="card-body" v-if="expanded">
      <!-- 只读标签字段 -->
      <div class="tags-row">
        <span class="tag">{{ character._性别 }}</span>
        <span class="tag">{{ character._来源 }}</span>
        <span class="tag" v-if="character._特殊能力 !== '普通人'">{{ character._特殊能力 }}</span>
      </div>

      <div class="field-row">
        <span class="fl">外貌</span>
        <span class="fv">{{ character._外貌 }}</span>
      </div>
      <div class="field-row">
        <span class="fl">性格</span>
        <span class="fv">{{ character._性格核心 }}·{{ character._性格标签 }}</span>
      </div>
      <div class="field-row" v-if="character._弱点">
        <span class="fl">弱点</span>
        <span class="fv fv-red">{{ character._弱点 }}</span>
      </div>

      <!-- 数值条 -->
      <div class="stats-section">
        <StatBar label="恐惧" :value="character.恐惧" :max="100" :invert="true" />
        <StatBar label="理智" :value="character.理智" :max="100" :invert="false" />
        <StatBar label="体力" :value="character.体力" :max="100" :invert="false" />
        <StatBar label="信任" :value="character.对user的信任" :max="100" :min="-100" :invert="false" :signed="true" />
      </div>

      <!-- 文本字段 -->
      <div class="field-row" v-if="character.着装">
        <span class="fl">着装</span>
        <span class="fv">{{ character.着装 }}</span>
      </div>
      <div class="field-row" v-if="character.当前行为">
        <span class="fl">行为</span>
        <span class="fv">{{ character.当前行为 }}</span>
      </div>
      <div class="field-row" v-if="character.内心状态">
        <span class="fl">内心</span>
        <span class="fv">{{ character.内心状态 }}</span>
      </div>
      <div class="field-row" v-if="character.伤势 && character.伤势 !== ''">
        <span class="fl fv-red">伤势</span>
        <span class="fv fv-red">{{ character.伤势 }}</span>
      </div>

      <!-- 物品管理 -->
      <div class="items-section">
        <div class="items-title">INVENTORY</div>
        <div
          v-for="(desc, itemName) in character.持有物品"
          :key="itemName"
          class="item-row"
        >
          <span class="item-name">{{ itemName }}</span>
          <span class="item-desc">{{ desc }}</span>
          <button class="remove-btn" @click="removeItem(String(itemName))">✕</button>
        </div>
        <div class="empty-items" v-if="Object.keys(character.持有物品).length === 0">
          无持有物品
        </div>
        <!-- 添加物品 -->
        <div class="add-item-row">
          <input
            v-model="newItemName"
            class="item-input"
            placeholder="物品名"
            @keydown.enter="addItem"
          />
          <input
            v-model="newItemDesc"
            class="item-input item-input--desc"
            placeholder="描述"
            @keydown.enter="addItem"
          />
          <button class="add-btn" @click="addItem">+</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Schema } from '../../../../../角色卡/Run Baby Run/schema';
import StatBar from './StatBar.vue';

type Character = Schema['角色'][string];

const props = defineProps<{
  name: string;
  character: Character;
}>();

const emit = defineEmits<{
  removeItem: [itemName: string];
  addItem: [payload: { name: string; desc: string }];
}>();

const expanded = ref(false);
const newItemName = ref('');
const newItemDesc = ref('');

function removeItem(itemName: string) {
  emit('removeItem', itemName);
}

function addItem() {
  if (!newItemName.value.trim()) return;
  emit('addItem', { name: newItemName.value.trim(), desc: newItemDesc.value.trim() });
  newItemName.value = '';
  newItemDesc.value = '';
}
</script>

<style scoped>
.char-card {
  border: var(--rbr-border);
  background: var(--rbr-paper);
  margin-bottom: 2px;
}

.char-card.status-死亡 {
  opacity: 0.55;
  border-color: #999;
}

.char-card.status-濒死 {
  border-color: var(--rbr-red);
  border-width: 3px;
}

/* 头部 */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  cursor: pointer;
  background: var(--rbr-paper-dark);
  user-select: none;
}

.card-header:hover {
  background: #d8c9aa;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.char-name {
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 1px;
  white-space: nowrap;
}

.status-badge {
  font-size: 9px;
  font-weight: 900;
  padding: 1px 5px;
  letter-spacing: 1px;
  flex-shrink: 0;
}

.badge-存活 { background: var(--rbr-black); color: var(--rbr-paper); }
.badge-重伤 { background: var(--rbr-red-dark); color: #fff; }
.badge-濒死 { background: var(--rbr-red); color: #fff; }
.badge-死亡 { background: #555; color: var(--rbr-paper); text-decoration: line-through; }
.badge-失踪 { background: #888; color: var(--rbr-paper); }

.char-pos {
  font-size: 10px;
  color: #666;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.expand-icon {
  font-size: 10px;
  color: var(--rbr-black);
  font-weight: 900;
  flex-shrink: 0;
  margin-left: 4px;
}

/* 展开内容 */
.card-body {
  padding: 6px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tags-row {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-bottom: 2px;
}

.tag {
  font-size: 9px;
  font-weight: 900;
  padding: 1px 6px;
  background: var(--rbr-black);
  color: var(--rbr-paper);
  letter-spacing: 1px;
}

.field-row {
  display: flex;
  gap: 6px;
  align-items: baseline;
  border-bottom: 1px solid var(--rbr-paper-dark);
  padding: 2px 0;
}

.fl {
  font-size: 9px;
  font-weight: 900;
  color: var(--rbr-red);
  text-transform: uppercase;
  letter-spacing: 1px;
  min-width: 36px;
  flex-shrink: 0;
}

.fv {
  font-size: 10px;
  font-weight: 700;
  color: var(--rbr-black);
  line-height: 1.4;
}

.fv-red {
  color: var(--rbr-red) !important;
}

/* 数值条 */
.stats-section {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 4px 0;
  border-top: 2px solid var(--rbr-paper-dark);
  border-bottom: 2px solid var(--rbr-paper-dark);
  margin: 2px 0;
}

/* 物品 */
.items-section {
  border: 2px solid var(--rbr-black);
  padding: 4px 6px;
  margin-top: 4px;
}

.items-title {
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 3px;
  color: var(--rbr-paper);
  background: var(--rbr-black);
  margin: -4px -6px 4px;
  padding: 2px 6px;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 0;
  border-bottom: 1px solid var(--rbr-paper-dark);
}

.item-name {
  font-size: 10px;
  font-weight: 900;
  min-width: 50px;
  flex-shrink: 0;
}

.item-desc {
  font-size: 10px;
  color: #666;
  flex: 1;
}

.remove-btn {
  font-family: var(--rbr-font);
  font-size: 10px;
  font-weight: 900;
  width: 18px;
  height: 18px;
  border: 2px solid var(--rbr-red);
  border-radius: 0;
  background: transparent;
  color: var(--rbr-red);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 0;
}

.remove-btn:hover {
  background: var(--rbr-red);
  color: #fff;
}

.empty-items {
  font-size: 10px;
  color: #aaa;
  padding: 4px 0;
  font-style: italic;
}

.add-item-row {
  display: flex;
  gap: 4px;
  margin-top: 4px;
  align-items: center;
}

.item-input {
  font-family: var(--rbr-font);
  font-size: 10px;
  font-weight: 700;
  padding: 2px 4px;
  border: 2px solid var(--rbr-black);
  border-radius: 0;
  background: var(--rbr-paper);
  color: var(--rbr-black);
  width: 70px;
  flex-shrink: 0;
}

.item-input--desc {
  flex: 1;
  width: auto;
}

.item-input:focus {
  outline: none;
  border-color: var(--rbr-red);
}

.add-btn {
  font-family: var(--rbr-font);
  font-size: 14px;
  font-weight: 900;
  width: 24px;
  height: 24px;
  border: 2px solid var(--rbr-black);
  border-radius: 0;
  background: var(--rbr-black);
  color: var(--rbr-paper);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  flex-shrink: 0;
}

.add-btn:hover {
  background: var(--rbr-red);
  border-color: var(--rbr-red);
}

@media (max-width: 640px) {
  .card-header {
    align-items: flex-start;
    gap: 6px;
  }

  .header-left {
    flex-wrap: wrap;
    row-gap: 4px;
  }

  .char-name {
    width: 100%;
    white-space: normal;
    line-height: 1.3;
  }

  .char-pos {
    width: 100%;
    white-space: normal;
    overflow: visible;
    text-overflow: clip;
  }

  .field-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }

  .fl {
    min-width: 0;
  }

  .item-row {
    flex-wrap: wrap;
    align-items: flex-start;
  }

  .item-name {
    min-width: 0;
    width: 100%;
  }

  .item-desc {
    width: calc(100% - 24px);
  }

  .remove-btn {
    margin-left: auto;
  }

  .add-item-row {
    flex-wrap: wrap;
    align-items: stretch;
  }

  .item-input {
    width: 100%;
    flex: 1 1 100%;
  }

  .add-btn {
    width: 100%;
    height: 28px;
  }
}
</style>
