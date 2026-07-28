<template>
  <button type="button" class="girl-card" :aria-label="`查看${name}的详情`" @click="emit('select')">
    <img v-if="portrait" class="portrait" :src="portrait" :alt="name" />
    <span v-else class="portrait placeholder" :style="{ background: placeholderGradient(name) }" aria-hidden="true">
      <i class="fa-solid fa-user-large"></i>
    </span>

    <span class="overlay">
      <span class="identity-line">
        <strong>{{ name }}</strong>
        <span class="badge" :class="{ bunny: isBunny }">{{ girl.身份 }}</span>
      </span>
      <span class="where"><i class="fa-solid fa-location-dot" aria-hidden="true"></i> {{ girl.所在位置 }}</span>
    </span>
  </button>
</template>

<script setup lang="ts">
import type { Schema } from '../../../schema';
import { placeholderGradient, portraitList } from '../portraits';

const props = defineProps<{
  name: string;
  girl: Schema['群友'][string];
}>();

const emit = defineEmits<{ select: [] }>();
const portrait = computed(() => portraitList(props.name, props.girl.身份)[0]);
const isBunny = computed(() => props.girl.身份.includes('兔女郎'));
</script>

<style lang="scss" scoped>
.girl-card {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 4 / 5;
  padding: 0;
  overflow: hidden;
  color: var(--c-text);
  text-align: left;
  background: var(--c-surface-alt);
  border: 1px solid var(--c-border);
  border-radius: 10px;
  cursor: pointer;
  transition:
    transform 150ms ease,
    border-color 150ms ease,
    box-shadow 150ms ease;

  &:hover {
    border-color: var(--c-primary);
    box-shadow: 0 8px 20px rgba(5, 3, 7, 0.35);
    transform: translateY(-2px);
  }
}

.portrait {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;

  &.placeholder {
    display: grid;
    place-items: center;

    i {
      color: rgba(255, 255, 255, 0.35);
      font-size: 34px;
    }
  }
}

.overlay {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 34px 10px 9px;
  background: linear-gradient(transparent, rgba(12, 7, 14, 0.94) 60%);
}

.identity-line {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;

  strong {
    flex: 1;
    overflow: hidden;
    font-family: var(--font-display);
    font-size: 15px;
    letter-spacing: 0.04em;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.badge {
  flex: none;
  padding: 2px 6px;
  color: var(--c-text-muted);
  font-size: 9px;
  line-height: 1.3;
  background: rgba(22, 15, 27, 0.78);
  border: 1px solid var(--c-border);
  border-radius: 999px;

  &.bunny {
    color: #fff;
    background: var(--c-danger);
    border-color: var(--c-danger);
  }
}

.where {
  overflow: hidden;
  color: var(--c-text-muted);
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;

  i {
    margin-right: 3px;
    color: var(--c-primary);
  }
}
</style>
