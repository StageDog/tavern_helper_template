<template>
  <div class="lobby-card" :class="{ 'service-mode': active_id === 'workscore' }">
    <div class="header">
      <span class="title"><i class="fa-solid fa-spade"></i> 赌场大厅</span>
      <span class="led-mini" :class="chipsRoll.cls.value">
        <span class="led-mini-ghost">888888</span>
        <span class="led-mini-value">{{ chipsRoll.text.value.replace(/,/g, '') }}</span>
      </span>
    </div>

    <div class="tab-nav">
    <button
        v-for="entry in visibleEntries"
        :key="entry.id"
        class="tab-btn"
        :class="{ active: active_id === entry.id, 'service-tab': entry.id === 'workscore' }"
        @click="active_id = active_id === entry.id ? null : entry.id"
      >
        <i :class="entry.icon"></i>
        <span>{{ entry.label }}</span>
      </button>
    </div>

    <div v-if="active_entry" class="game-area" :class="{ 'service-area': active_entry.id === 'workscore' }">
      <component :is="active_entry.component" />
    </div>
    <div v-else class="game-area placeholder">选择一张赌桌入座……</div>
  </div>
</template>

<script setup lang="ts">
import { useCountUp } from '../../countup';
import { lobby_entries } from './games';
import { REDEMPTION_UNIT, useWallet } from './wallet';

const wallet = useWallet();
const chipsRoll = useCountUp(() => wallet.chips.value);
const isBunny = computed(() => wallet.store.data.主角.身份状态 === '兔女郎');

const visibleEntries = computed(() =>
  lobby_entries.filter(e => !e.bunnyOnly || isBunny.value),
);

const active_id = useLocalStorage<string | null>('casino_lobby:active', null);
const active_entry = computed(() => visibleEntries.value.find(entry => entry.id === active_id.value) ?? null);

// ── 破产判定（状态驱动，覆盖 AI 剧情扣筹码等所有变动来源） ──
watch(
  () => [wallet.store.data.主角.筹码, wallet.store.data.主角.欠债],
  () => wallet.checkBankruptcy(),
);

// ── 抵债环（全局单实例，不放 Loan.vue 以免 tab 未打开时失效） ──
// 工作进度满 100 → 自动清偿一档欠债、进度归零
watch(
  () => wallet.store.data.主角.兔女郎工作进度,
  progress => {
    if (wallet.isBunny.value && progress >= 100) {
      const cleared = Math.min(REDEMPTION_UNIT, wallet.store.data.主角.欠债);
      wallet.store.data.主角.欠债 -= cleared;
      wallet.store.data.主角.兔女郎工作进度 = 0;
      wallet.pushEvent(`抵债：兔女郎工作抵满一档，清偿欠债${cleared}，剩余欠债${wallet.store.data.主角.欠债}`);
    }
  },
);

// 兔女郎身份下欠债归零 → 自动赎身恢复赌客
watch(
  () => wallet.store.data.主角.欠债,
  debt => {
    if (wallet.isBunny.value && debt <= 0) {
      wallet.store.data.主角.身份状态 = '赌客';
      wallet.store.data.主角.兔女郎工作进度 = 0;
      wallet.pushEvent('赎身：欠债全部还清，脱下兔女郎制服恢复赌客身份');
    }
  },
);
</script>

<style lang="scss" scoped>
.lobby-card {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  overflow: hidden;
  max-width: 640px;
  margin: 0 auto;
  background: var(--card-bg);
  border: 1px solid var(--c-border);
  border-radius: 12px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 4px 24px rgba(0, 0, 0, 0.4);
  padding: 12px 14px;
  color: var(--c-text);
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 13px;

  &.service-mode {
    background:
      radial-gradient(circle at 86% 2%, rgba(244, 95, 152, 0.16), transparent 29%),
      linear-gradient(155deg, rgba(50, 18, 40, 0.98), rgba(24, 12, 27, 0.98));
    border-color: rgba(255, 181, 207, 0.42);
    box-shadow:
      inset 0 1px 0 rgba(255, 231, 240, 0.08),
      0 10px 34px rgba(54, 8, 33, 0.48);

    .header .title {
      color: #ffb5cf;
    }
  }
}

.header {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .title {
    font-weight: bold;
    color: var(--c-text-muted);
    font-size: 13px;
    letter-spacing: 0.04em;
  }

  .led-mini {
    position: relative;
    font-family: var(--font-led);
    font-size: 15px;
    line-height: 1;
    background: var(--led-bg);
    border: 1px solid var(--c-border);
    border-radius: 6px;
    box-shadow: var(--led-inset);
    padding: 5px 8px;

    .led-mini-ghost {
      color: rgba(232, 176, 79, 0.07);
      user-select: none;
    }

    .led-mini-value {
      position: absolute;
      right: 8px;
      top: 5px;
      color: var(--c-primary);
      text-shadow: var(--glow-gold);
    }

    &.win .led-mini-value {
      color: var(--c-success);
      text-shadow: var(--glow-green);
    }

    &.lose {
      animation: lose-shake 0.5s;

      .led-mini-value {
        color: var(--c-danger);
        text-shadow: var(--glow-pink);
      }
    }
  }
}

.tab-nav {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tab-btn {
  flex: 1;
  min-width: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: var(--c-surface-alt);
  border: 1px solid var(--c-border);
  border-radius: 8px;
  color: var(--c-text-muted);
  padding: 8px 4px;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  transition:
    color 0.2s,
    border-color 0.2s;

  &:hover {
    color: var(--c-text);
  }

  &.active {
    color: var(--c-primary);
    border-color: var(--c-primary);
    box-shadow: var(--glow-gold);
  }

  &.service-tab {
    i {
      color: #f683ad;
    }

    &.active {
      color: #fff2f7;
      background: linear-gradient(135deg, rgba(244, 95, 152, 0.34), rgba(90, 23, 55, 0.7));
      border-color: #f683ad;
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.09),
        0 0 18px rgba(244, 95, 152, 0.18);
    }
  }
}

.game-area {
  position: relative;
  border: 1px solid var(--c-border);
  border-radius: 8px;
  padding: 12px;
  background: rgba(34, 22, 49, 0.75);

  &.placeholder {
    text-align: center;
    color: var(--c-text-muted);
    font-style: italic;
    padding: 24px;
  }

  &.service-area {
    overflow: hidden;
    padding: 0;
    background: #210f1d;
    border-color: rgba(255, 181, 207, 0.42);
  }
}
</style>
