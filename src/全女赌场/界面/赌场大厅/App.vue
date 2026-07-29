<template>
  <div class="lobby-card" :class="{ 'service-mode': active_id === 'workscore' }">
    <div class="header">
      <div class="title-block">
        <span class="table-kicker">兔窟 · 私人赌桌</span>
        <span class="title"><i class="fa-solid fa-spade"></i> 赌场大厅</span>
      </div>
      <div class="bankroll">
        <span class="bankroll-label">桌面筹码</span>
        <span class="led-mini" :class="chipsRoll.cls.value">
          <span class="led-mini-ghost">888888888</span>
          <span class="led-mini-value">{{ chipsRoll.text.value.replace(/,/g, '') }}</span>
        </span>
      </div>
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
    <div v-else class="game-area placeholder">
      <i class="fa-solid fa-chair"></i>
      <span>选择一张赌桌入座</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCountUp } from '../../countup';
import { lobby_entries } from './games';
import { useWallet, WORK_PAYOUT_UNIT } from './wallet';

const wallet = useWallet();
const chipsRoll = useCountUp(() => wallet.chips.value);
const isBunny = computed(() => wallet.store.data.主角.身份状态 === '兔女郎');

const visibleEntries = computed(() => lobby_entries.filter(e => !e.bunnyOnly || isBunny.value));

const active_id = useLocalStorage<string | null>('casino_lobby:active', null);
const active_entry = computed(() => visibleEntries.value.find(entry => entry.id === active_id.value) ?? null);

// ── 破产判定（状态驱动，覆盖 AI 剧情扣筹码等所有变动来源） ──
watch(
  () => [wallet.store.data.主角.筹码, wallet.store.data.主角.欠债],
  () => wallet.checkBankruptcy(),
);

// ── 发薪环（全局单实例，不放 Loan.vue 以免 tab 未打开时失效） ──
// 工作进度满 100 → 自动发放一档筹码工资、进度归零；欠债仍需主动偿还
watch(
  () => wallet.store.data.主角.兔女郎工作进度,
  progress => {
    if (wallet.isBunny.value && progress >= 100) {
      wallet.store.data.主角.筹码 += WORK_PAYOUT_UNIT;
      wallet.store.data.主角.兔女郎工作进度 = 0;
      wallet.pushEvent(
        `发薪：兔女郎工作进度满档，发放工资${WORK_PAYOUT_UNIT}筹码，当前筹码${wallet.store.data.主角.筹码}，当前欠债${wallet.store.data.主角.欠债}`,
      );
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
  --game-felt: #1a1022;
  --game-surface: #291831;
  --game-wine: #72294a;
  --game-gold: #d6a64a;
  --game-ivory: #f2e5d2;
  --game-mint: #6fd3a5;
  --game-machine-surface: #aa98c5;
  --game-machine-edge: #ded5ed;
  --game-machine-shadow: #675371;
  --game-action-alt: #b9a7dc;
  --game-action-alt-hover: #c8b9e6;
  --game-display-font: 'STSong', 'Songti SC', 'Noto Serif SC', serif;

  position: relative;
  box-sizing: border-box;
  width: 100%;
  overflow: hidden;
  max-width: 640px;
  margin: 0 auto;
  background:
    radial-gradient(circle at 88% -20%, rgba(114, 41, 74, 0.2), transparent 38%),
    linear-gradient(160deg, #211329 0%, var(--game-felt) 58%, #140c1b 100%);
  border: 1px solid rgba(214, 166, 74, 0.34);
  border-radius: 14px;
  box-shadow:
    inset 0 1px 0 rgba(242, 229, 210, 0.06),
    0 10px 30px rgba(5, 2, 9, 0.44);
  padding: 16px;
  color: var(--c-text);
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 15px;

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
  gap: 14px;

  .title-block,
  .bankroll {
    display: flex;
    flex-direction: column;
  }

  .title-block {
    gap: 2px;
  }

  .table-kicker,
  .bankroll-label {
    color: var(--c-text-muted);
    font-size: 13px;
    letter-spacing: 0.12em;
  }

  .title {
    color: var(--game-ivory);
    font-family: var(--game-display-font);
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 0.08em;

    i {
      color: var(--game-gold);
      font-size: 15px;
      margin-right: 3px;
    }
  }

  .bankroll {
    align-items: flex-end;
    gap: 4px;
  }

  .led-mini {
    position: relative;
    font-family: var(--font-led);
    font-size: 17px;
    line-height: 1;
    background: var(--led-bg);
    border: 1px solid rgba(214, 166, 74, 0.4);
    border-radius: 6px;
    box-shadow: var(--led-inset);
    padding: 6px 9px;

    .led-mini-ghost {
      color: rgba(214, 166, 74, 0.07);
      user-select: none;
    }

    .led-mini-value {
      position: absolute;
      right: 8px;
      top: 5px;
      color: var(--game-gold);
      text-shadow: 0 0 8px rgba(214, 166, 74, 0.45);
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
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(84px, 1fr));
  gap: 6px;
  padding: 5px;
  background: rgba(9, 5, 13, 0.34);
  border: 1px solid rgba(242, 229, 210, 0.08);
  border-radius: 10px;
}

.tab-btn {
  min-width: 0;
  min-height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 7px;
  color: var(--c-text-muted);
  padding: 8px 5px;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  transition:
    background 0.2s,
    color 0.2s,
    border-color 0.2s,
    transform 0.15s;

  &:hover {
    color: var(--c-text);
    background: rgba(242, 229, 210, 0.05);
  }

  &.active {
    color: var(--game-ivory);
    background: linear-gradient(180deg, rgba(114, 41, 74, 0.72), rgba(72, 25, 50, 0.82));
    border-color: rgba(214, 166, 74, 0.72);
    box-shadow:
      inset 0 1px 0 rgba(242, 229, 210, 0.1),
      0 2px 8px rgba(5, 2, 9, 0.24);

    i {
      color: var(--game-gold);
    }
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
  border: 1px solid rgba(214, 166, 74, 0.28);
  border-radius: 10px;
  padding: 16px;
  background: radial-gradient(circle at 50% -25%, rgba(114, 41, 74, 0.18), transparent 48%), rgba(22, 13, 29, 0.82);
  box-shadow: inset 0 1px 0 rgba(242, 229, 210, 0.04);

  &.placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    text-align: center;
    color: var(--c-text-muted);
    padding: 34px 24px;

    i {
      color: var(--game-gold);
    }
  }

  &.service-area {
    overflow: hidden;
    padding: 0;
    background: #210f1d;
    border-color: rgba(255, 181, 207, 0.42);
  }
}

@media (max-width: 480px) {
  .lobby-card {
    padding: 12px;
    gap: 10px;
  }

  .header {
    align-items: flex-end;

    .table-kicker,
    .bankroll-label {
      font-size: 13px;
    }

    .title {
      font-size: 18px;
    }

    .led-mini {
      font-size: 15px;
    }
  }

  .tab-nav {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .tab-btn {
    font-size: 13px;
  }

  .game-area {
    padding: 12px;
  }
}

@media (max-width: 350px) {
  .header .table-kicker {
    display: none;
  }

  .tab-btn {
    gap: 4px;
    padding-right: 2px;
    padding-left: 2px;

    span {
      white-space: nowrap;
    }
  }
}
</style>
