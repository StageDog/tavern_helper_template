<template>
  <div class="char-layout">
    <div class="section-head">{{ store.data.白娅.$依存度阶段 }}</div>
    <div class="title-grid">
      <div v-for="(title, name) in store.data.白娅.称号" :key="name" class="title-box">
        <span class="title-name">{{ name }}</span>
        <div class="title-effect">{{ title.效果 }}</div>
        <div class="title-quote">"{{ title.自我评价 }}"</div>
      </div>
      <div v-if="_.isEmpty(store.data.白娅.称号)" class="title-box">
        <span class="title-name">无称号</span>
        <div class="title-effect">当前没有生效的称号</div>
        <div class="title-quote">"..."</div>
      </div>
    </div>

    <div class="section-head">着装记录</div>
    <div class="attire-list">
      <div v-for="(description, slot) in store.data.白娅.着装" :key="slot" class="attire-item">
        <span class="attire-slot">【{{ slot }}】</span>
        {{ description }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { useDataStore } from '../store';

const store = useDataStore();
</script>

<style lang="scss" scoped>
.char-layout {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-head {
  font-size: 0.95rem;
  border-bottom: 3px solid var(--c-celadon);
  display: inline-block;
  margin-bottom: 8px;
  font-weight: bold;
}

.title-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
  margin-bottom: 12px;
}

.title-box {
  border: 1.5px solid var(--c-granite);
  padding: 7px;
  background: #fff;
  box-shadow: 2px 2px 0 var(--c-ash-grey);
}

.title-name {
  background: var(--c-granite);
  color: var(--c-celadon);
  display: inline-block;
  padding: 2px 4px;
  font-size: 0.72rem;
  font-weight: bold;
  margin-bottom: 3px;
}

.title-effect {
  font-size: 0.78rem;
  margin-bottom: 3px;
}

.title-quote {
  font-size: 0.7rem;
  color: var(--c-grey-olive);
  font-style: italic;
}

.attire-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 7px;
}

.attire-item {
  border: 1px solid var(--c-grey-olive);
  padding: 6px;
  font-size: 0.82rem;
  background: #fff;
}

.attire-slot {
  color: var(--c-grey-olive);
  font-size: 0.72rem;
  display: block;
}

@media (max-width: 600px) {
  .title-grid,
  .attire-list {
    grid-template-columns: 1fr;
  }
}
</style>
