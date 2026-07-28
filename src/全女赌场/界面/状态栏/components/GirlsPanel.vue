<template>
  <div class="girls-panel">
    <GirlDetail v-if="selectedGirl" :name="selected!" :girl="selectedGirl" @back="selected = null" />

    <template v-else>
      <div v-if="!_.isEmpty(store.data.群友)" class="card-wall">
        <GirlCard
          v-for="(girl, name) in store.data.群友"
          :key="name"
          :name="name as string"
          :girl="girl"
          @select="selected = name as string"
        />
      </div>
      <div v-else class="empty-state">赌场里还没有认识的群友…先去搭个话吧</div>
    </template>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { useDataStore } from '../store';
import GirlCard from './GirlCard.vue';
import GirlDetail from './GirlDetail.vue';

const store = useDataStore();
const selected = ref<string | null>(null);

// 群友被移除（或数据回滚）时自动退出详情页
const selectedGirl = computed(() => (selected.value ? store.data.群友[selected.value] : undefined));
</script>

<style lang="scss" scoped>
.girls-panel {
  min-height: 240px;
}

.card-wall {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

/* 窄屏两列，卡片依然够大 */
@media (max-width: 430px) {
  .card-wall {
    grid-template-columns: repeat(2, 1fr);
  }
}

.empty-state {
  text-align: center;
  color: var(--c-text-muted);
  font-style: italic;
  font-size: 12px;
  padding: 20px;
}
</style>
