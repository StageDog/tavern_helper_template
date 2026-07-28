<template>
  <div class="girl-card" @click="emit('select')">
    <img v-if="portrait" class="portrait" :src="portrait" :alt="name" />
    <div v-else class="portrait placeholder" :style="{ background: placeholderGradient(name) }">
      <i class="fa-solid fa-user-large"></i>
    </div>
    <div class="overlay">
      <span class="name">{{ name }}</span>
      <span class="badge" :class="{ bunny: isBunny }">{{ girl.身份 }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Schema } from '../../../schema';
import { placeholderGradient, portraitList } from '../portraits';

const props = defineProps<{
  name: string;
  girl: Schema['群友'][string];
}>();

const emit = defineEmits<{ select: [] }>();

// 卡片墙上固定显示当前状态的第一张立绘
const portrait = computed(() => portraitList(props.name, props.girl.身份)[0]);
const isBunny = computed(() => props.girl.身份.includes('兔女郎'));
</script>

<style lang="scss" scoped>
.girl-card {
  position: relative;
  aspect-ratio: 2 / 3;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--c-border);
  cursor: pointer;
  transition:
    transform 0.15s,
    border-color 0.15s;

  &:hover {
    transform: translateY(-2px);
    border-color: var(--c-primary);
  }
}

.portrait {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;

  &.placeholder {
    display: flex;
    align-items: center;
    justify-content: center;

    i {
      font-size: 34px;
      color: rgba(255, 255, 255, 0.35);
    }
  }
}

.overlay {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  padding: 26px 10px 8px;
  background: linear-gradient(transparent, rgba(10, 6, 16, 0.88));
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.name {
  font-weight: bold;
  font-size: 15px;
  color: var(--c-text);
}

.badge {
  align-self: flex-start;
  font-size: 11px;
  padding: 1px 9px;
  border-radius: 8px;
  border: 1px solid var(--c-border);
  color: var(--c-text-muted);
  background: rgba(26, 18, 36, 0.7);

  &.bunny {
    color: #fff;
    border-color: var(--c-danger);
    background: var(--c-danger);
  }
}
</style>
