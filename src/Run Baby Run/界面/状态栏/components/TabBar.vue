<template>
  <nav class="tab-bar">
    <button
      v-for="tab in tabs"
      :key="tab"
      class="tab-btn"
      :class="{ active: activeTab === tab }"
      @click="$emit('change', tab)"
    >
      {{ tab }}
    </button>
  </nav>
</template>

<script setup lang="ts">
defineProps<{ activeTab: string }>();
defineEmits<{ change: [tab: string] }>();

const tabs = ['场景', '追击者', '角色', '事件', '氛围'];
</script>

<style scoped>
.tab-bar {
  display: flex;
  border-bottom: var(--rbr-border);
  background: var(--rbr-paper-dark);
  gap: 0;
  flex-wrap: wrap;
}

.tab-btn {
  display: inline-block;
  padding: 6px 12px;
  font-family: var(--rbr-font);
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 1px;
  background: var(--rbr-paper-dark);
  color: var(--rbr-black);
  border: none;
  border-right: 2px solid var(--rbr-black);
  border-radius: 0;
  cursor: pointer;
  transition: background 0.1s;
  position: relative;
}

.tab-btn:hover {
  background: var(--rbr-paper);
}

.tab-btn.active {
  background: var(--rbr-red);
  color: #fff;
  transform: rotate(-1deg) skewX(-2deg);
  z-index: 1;
  border-right-color: var(--rbr-red-dark);
}

.tab-btn:last-child {
  border-right: none;
}
</style>
