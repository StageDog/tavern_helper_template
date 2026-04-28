<script setup lang="ts">
import MapPanel from './MapPanel.vue';
import { useMapStore } from '../store';

const store = useMapStore();
// 自定义 CSS 的注入在 index.ts 中完成（必须注入到 iframe document.head）
</script>

<template>
  <MapPanel v-if="store.panelVisible" />
</template>
