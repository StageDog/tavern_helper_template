<template>
  <div class="bet-control">
    <div class="rail-heading">
      <span class="bet-label"><i class="fa-solid fa-coins"></i> 本局筹码</span>
      <span class="rail-rule"></span>
    </div>
    <div class="bet-rail">
      <div class="bet-input-wrap">
        <button class="adj" aria-label="减少下注" :disabled="disabled" @click="adjust(-step)">−</button>
        <label>
          <span class="sr-only">下注金额</span>
          <input v-model.number="amount" type="number" :disabled="disabled" min="1" />
        </label>
        <button class="adj" aria-label="增加下注" :disabled="disabled" @click="adjust(step)">＋</button>
      </div>
      <div class="quick-btns" aria-label="快捷下注">
        <button v-for="q in quicks" :key="q.label" :disabled="disabled" @click="setQuick(q)">
          {{ q.label }}
        </button>
      </div>
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
  flex-direction: column;
  gap: 12px;
  padding: 11px 11px 13px;
  background: linear-gradient(180deg, rgba(114, 41, 74, 0.22), rgba(9, 5, 13, 0.24)), var(--game-felt);
  border: 1px solid rgba(214, 166, 74, 0.34);
  border-radius: 10px;
  box-shadow:
    inset 0 1px 0 rgba(242, 229, 210, 0.05),
    inset 0 -3px 10px rgba(5, 2, 9, 0.28);
}

.rail-heading {
  display: flex;
  align-items: center;
  gap: 9px;
}

.bet-label {
  color: var(--game-ivory);
  font-family: var(--font-main);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.06em;
  white-space: nowrap;

  i {
    color: var(--game-gold);
    margin-right: 3px;
  }
}

.rail-rule {
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, rgba(214, 166, 74, 0.52), transparent);
}

.bet-rail {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.bet-input-wrap {
  display: flex;
  align-items: stretch;
  height: 44px;
  border-radius: 8px;
  box-shadow: 0 3px 9px rgba(5, 2, 9, 0.28);

  input {
    box-sizing: border-box;
    width: 82px;
    height: 44px;
    text-align: center;
    background: repeating-linear-gradient(0deg, transparent 0 4px, rgba(41, 24, 49, 0.025) 4px 5px), var(--game-ivory);
    border: 1px solid rgba(214, 166, 74, 0.72);
    border-left: none;
    border-right: none;
    color: #2b1931;
    font-family: var(--font-led);
    font-size: 17px;
    font-weight: 700;
    appearance: textfield;

    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
      appearance: none;
    }
  }

  .adj {
    width: 40px;
    background: linear-gradient(180deg, #3a2543, #24152c);
    border: 1px solid rgba(214, 166, 74, 0.62);
    color: var(--game-ivory);
    cursor: pointer;
    font-family: inherit;
    font-size: 20px;
    line-height: 1;

    &:first-child {
      border-radius: 8px 0 0 8px;
    }

    &:last-child {
      border-radius: 0 8px 8px 0;
    }

    &:hover:not(:disabled) {
      color: var(--game-gold);
      background: #432a4b;
    }
  }
}

.quick-btns {
  display: flex;
  gap: 8px;
  flex: 1;
  flex-wrap: wrap;

  button {
    position: relative;
    width: 48px;
    min-width: 48px;
    height: 48px;
    background:
      radial-gradient(circle, #4d3156 0 47%, transparent 48%),
      repeating-conic-gradient(from -8deg, var(--game-machine-edge) 0 11deg, var(--game-machine-shadow) 11deg 45deg);
    border: 2px solid rgba(222, 213, 237, 0.82);
    border-radius: 50%;
    color: var(--game-ivory);
    padding: 0;
    font-size: 13px;
    font-weight: 700;
    text-shadow: 0 1px 2px #120918;
    cursor: pointer;
    font-family: inherit;
    box-shadow:
      inset 0 0 0 2px rgba(20, 10, 25, 0.62),
      inset 0 0 0 5px rgba(185, 167, 220, 0.22),
      0 2px 5px rgba(5, 2, 9, 0.3);
    transition:
      transform 0.12s,
      filter 0.12s;

    &:hover:not(:disabled) {
      filter: brightness(1.14);
      transform: translateY(-1px);
    }
  }
}

button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 480px) {
  .bet-rail {
    align-items: stretch;
  }

  .bet-input-wrap {
    width: 100%;

    label {
      flex: 1;
    }

    input {
      width: 100%;
    }
  }

  .quick-btns {
    justify-content: space-between;
  }
}

@media (max-width: 350px) {
  .quick-btns {
    gap: 6px;

    button {
      width: 44px;
      min-width: 44px;
      height: 44px;
    }
  }
}
</style>
