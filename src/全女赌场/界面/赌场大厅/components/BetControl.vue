<template>
  <div class="bet-control">
    <span class="bet-label">下注</span>
    <div class="bet-input-wrap">
      <button class="adj" :disabled="disabled" @click="adjust(-step)">−</button>
      <input v-model.number="amount" type="number" :disabled="disabled" min="1" />
      <button class="adj" :disabled="disabled" @click="adjust(step)">＋</button>
    </div>
    <div class="quick-btns">
      <button v-for="q in quicks" :key="q.label" :disabled="disabled" @click="setQuick(q)">
        {{ q.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWallet } from '../wallet';

const amount = defineModel<number>({ required: true });
defineProps<{ disabled?: boolean }>();

const wallet = useWallet();
const step = 50;

const quicks = [
  { label: '100', value: () => 100 },
  { label: '500', value: () => 500 },
  { label: '半仓', value: () => Math.floor(wallet.chips.value / 2) },
  { label: '梭哈', value: () => wallet.chips.value },
];

function adjust(delta: number) {
  amount.value = _.clamp((amount.value || 0) + delta, 1, Math.max(1, wallet.chips.value));
}

function setQuick(q: (typeof quicks)[number]) {
  amount.value = Math.max(1, q.value());
}
</script>

<style lang="scss" scoped>
.bet-control {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.bet-label {
  font-size: 12px;
  color: var(--c-text-muted);
}

.bet-input-wrap {
  display: flex;
  align-items: stretch;

  input {
    width: 72px;
    text-align: center;
    background: var(--c-surface);
    border: 1px solid var(--c-border);
    border-left: none;
    border-right: none;
    color: var(--c-text);
    font-family: inherit;
    font-size: 13px;
    appearance: textfield;

    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
      appearance: none;
    }
  }

  .adj {
    width: 26px;
    background: var(--c-surface);
    border: 1px solid var(--c-border);
    color: var(--c-text);
    cursor: pointer;

    &:first-child {
      border-radius: 6px 0 0 6px;
    }

    &:last-child {
      border-radius: 0 6px 6px 0;
    }
  }
}

.quick-btns {
  display: flex;
  gap: 4px;

  button {
    background: var(--c-surface);
    border: 1px solid var(--c-border);
    border-radius: 6px;
    color: var(--c-text-muted);
    padding: 3px 8px;
    font-size: 11px;
    cursor: pointer;
    font-family: inherit;

    &:hover:not(:disabled) {
      color: var(--c-primary);
      border-color: var(--c-primary);
    }
  }
}

button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
