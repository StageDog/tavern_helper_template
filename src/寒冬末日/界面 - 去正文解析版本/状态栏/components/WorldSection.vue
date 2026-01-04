<template>
  <section class="section">
    <h2 class="section-title">🌐 基础信息 🌐</h2>
    <div class="global-info-bar">
      <div class="info-item info-item--location">🗺️ {{ store.data.世界.地址 }}</div>
      <div class="info-item info-item--date">
        📅 {{ store.data.世界.日期 }}（末日第 {{ store.data.世界.末日天数 }} 天）
      </div>
      <div class="info-item info-item--time">⏳ {{ store.data.世界.时间 }}</div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useDataStore } from '../../store';

const store = useDataStore();
</script>
