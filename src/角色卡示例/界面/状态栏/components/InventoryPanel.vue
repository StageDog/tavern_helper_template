<template>
  <div>
    <div class="section-head">物品清单</div>
    <div v-if="!_.isEmpty(store.data.主角.物品栏)" class="inventory-grid">
      <div v-for="(item, name) in store.data.主角.物品栏" :key="name" class="item-row">
        <div class="item-icon">{{ getItemIcon(name as string) }}</div>
        <div class="item-detail">
          <span class="item-name">{{ name }}</span>
          <span class="item-desc">{{ item.描述 }}</span>
        </div>
        <span class="item-count">x{{ item.数量 }}</span>
      </div>
    </div>
    <div v-else class="empty-state">背包空空如也...</div>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { useDataStore } from '../store';

const store = useDataStore();

function getItemIcon(name: string): string {
  // 根据物品名生成简短图标
  if (name.includes('手机') || name.includes('电话')) return 'PH';
  if (name.includes('钥匙')) return 'KY';
  if (name.includes('钱') || name.includes('币')) return '$$';
  if (name.includes('证') || name.includes('卡')) return 'ID';
  if (name.includes('糖') || name.includes('药')) return 'RX';
  if (name.includes('创可贴') || name.includes('绷带')) return '+';
  // 默认取前两个字符
  return name.substring(0, 2).toUpperCase();
}
</script>

<style lang="scss" scoped>
.inventory-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-row {
  display: flex;
  align-items: center;
  border: 1.5px solid var(--c-granite);
  padding: 8px;
  background: #fff;
  transition: transform 0.2s;
}

.item-row:hover {
  transform: translateX(5px);
  background: var(--c-mint-cream);
}

.item-icon {
  width: 28px;
  height: 28px;
  background: var(--c-celadon);
  border: 1.5px solid var(--c-granite);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  font-weight: bold;
  font-size: 0.7rem;
}

.item-detail {
  flex: 1;
}

.item-name {
  font-weight: bold;
  display: block;
}

.item-desc {
  font-size: 0.76rem;
  color: var(--c-grey-olive);
}

.item-count {
  background: var(--c-granite);
  color: #fff;
  padding: 2px 5px;
  font-size: 0.72rem;
  border-radius: 3px;
}

.empty-state {
  text-align: center;
  color: var(--c-grey-olive);
  padding: 18px;
  font-style: italic;
  font-size: 0.85rem;
}
</style>
