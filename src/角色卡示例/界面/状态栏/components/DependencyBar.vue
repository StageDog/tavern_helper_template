<template>
  <div class="dependency-strip">
    <span class="dependency-label">依存度</span>
    <div class="dependency-track">
      <div class="dependency-fill" :style="{ width: store.data.白娅.依存度 + '%' }"></div>
    </div>
    <span class="dependency-value">{{ store.data.白娅.依存度 }}%</span>
    <div class="dependency-controls">
      <button
        class="dependency-button"
        :disabled="store.data.白娅.依存度 <= 0"
        type="button"
        @click="adjustDependency(-1)"
      >
        -
      </button>
      <button
        class="dependency-button"
        :disabled="store.data.白娅.依存度 >= 100"
        type="button"
        @click="adjustDependency(1)"
      >
        +
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDataStore } from '../store';

const store = useDataStore();

function adjustDependency(delta: number) {
  store.data.白娅.依存度 = store.data.白娅.依存度 + delta;
}
</script>

<style lang="scss" scoped>
.dependency-strip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 6px 10px;
  background: #fff;
  border-bottom: 2px dashed var(--c-granite);
}

.dependency-label,
.dependency-value {
  font-weight: bold;
  font-size: 0.9rem;
}

.dependency-track {
  flex: 1;
  max-width: 360px;
  height: 10px;
  border: 1.5px solid var(--c-granite);
  background: var(--c-mint-cream);
  position: relative;
  overflow: hidden;
}

.dependency-fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: var(--c-celadon);
  border-right: 1.5px solid var(--c-granite);
  transition: width 0.25s ease;
}

.dependency-controls {
  display: flex;
  gap: 4px;
}

.dependency-button {
  width: 24px;
  height: 22px;
  padding: 0;
  border: 1.5px solid var(--c-granite);
  background: var(--c-mint-cream);
  color: var(--c-granite);
  font-family: inherit;
  font-weight: bold;
  line-height: 1;
  cursor: pointer;
  box-shadow: 2px 2px 0px rgba(60, 73, 63, 0.16);
}

.dependency-button:active:not(:disabled) {
  transform: translate(1px, 1px);
  box-shadow: 1px 1px 0px rgba(60, 73, 63, 0.16);
}

.dependency-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.dependency-button:focus-visible {
  outline: 2px dashed var(--c-granite);
  outline-offset: 2px;
}
</style>
