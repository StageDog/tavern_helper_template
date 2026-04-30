<template>
  <div class="characters-tab">
    <div v-if="Object.keys(data.角色).length === 0" class="empty-tip">
      尚无角色数据
    </div>
    <CharacterCard
      v-for="(char, name) in data.角色"
      :key="name"
      :name="String(name)"
      :character="char"
      @remove-item="onRemoveItem(String(name), $event)"
      @add-item="onAddItem(String(name), $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useDataStore } from '../store';
import CharacterCard from './CharacterCard.vue';

const store = useDataStore();
const { data } = storeToRefs(store);

function onRemoveItem(charName: string, itemName: string) {
  delete data.value.角色[charName].持有物品[itemName];
  data.value.系统日志.push({
    操作: `移除了「${charName}」的物品「${itemName}」`,
    时间戳: Date.now(),
  });
}

function onAddItem(charName: string, payload: { name: string; desc: string }) {
  data.value.角色[charName].持有物品[payload.name] = payload.desc;
  data.value.系统日志.push({
    操作: `为「${charName}」添加了物品「${payload.name}」`,
    时间戳: Date.now(),
  });
}
</script>

<style scoped>
.characters-tab {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.empty-tip {
  font-size: 11px;
  color: #888;
  text-align: center;
  padding: 16px;
  font-style: italic;
}
</style>
