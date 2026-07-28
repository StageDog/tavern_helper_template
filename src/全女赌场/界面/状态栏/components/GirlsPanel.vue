<template>
  <div class="girls-panel">
    <GirlDetail v-if="selectedGirl" :name="selected!" :girl="selectedGirl" @back="selected = null" />

    <template v-else>
      <header v-if="girlEntries.length" class="roster-head">
        <h2>场内名册</h2>
        <span>{{ girlEntries.length }} 位已登记</span>
      </header>

      <div v-if="girlEntries.length" class="card-wall">
        <GirlCard v-for="[name, girl] in girlEntries" :key="name" :name="name" :girl="girl" @select="selected = name" />
      </div>

      <div v-else class="empty-state">
        <span class="empty-mark"><i class="fa-solid fa-address-card" aria-hidden="true"></i></span>
        <strong>名册还是空的</strong>
        <span>认识新面孔后，她们会出现在这里。</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useDataStore } from '../store';
import GirlCard from './GirlCard.vue';
import GirlDetail from './GirlDetail.vue';

const store = useDataStore();
const selected = ref<string | null>(null);
const girlEntries = computed(() => Object.entries(store.data.群友));
const selectedGirl = computed(() => (selected.value ? store.data.群友[selected.value] : undefined));
</script>

<style lang="scss" scoped>
.girls-panel {
  min-height: 240px;
}

.roster-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin: 2px 1px 10px;

  h2 {
    margin: 0;
    font-family: var(--font-display);
    font-size: 16px;
    letter-spacing: 0.08em;
  }

  span {
    color: var(--c-text-muted);
    font-size: 11px;
  }
}

.card-wall {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 9px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  color: var(--c-text-muted);
  text-align: center;
  background: rgba(255, 255, 255, 0.018);
  border: 1px dashed var(--c-border);
  border-radius: 11px;

  .empty-mark {
    display: grid;
    width: 45px;
    aspect-ratio: 1;
    margin-bottom: 12px;
    place-items: center;
    color: var(--c-primary);
    border: 1px solid var(--c-border);
    border-radius: 50%;
  }

  strong {
    margin-bottom: 5px;
    color: var(--c-text);
    font-family: var(--font-display);
    font-size: 16px;
  }

  > span:last-child {
    max-width: 240px;
    font-size: 12px;
    line-height: 1.5;
  }
}

@media (max-width: 430px) {
  .card-wall {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
