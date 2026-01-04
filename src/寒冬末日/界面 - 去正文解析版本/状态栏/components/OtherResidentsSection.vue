<template>
  <section class="section" id="other-residents-section">
    <h2 class="section-title">🏢 其他楼层情况 🏢</h2>
    <div class="other-residents-item">
      <div class="label">💬 楼层言语</div>
      <div class="value">{{ store.data.楼层其他住户.言语 }}</div>
    </div>
    <div class="other-residents-item">
      <div class="label">🏃 楼层行为</div>
      <div class="value">{{ store.data.楼层其他住户.行为 }}</div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useDataStore } from '../../store';

const store = useDataStore();
</script>
