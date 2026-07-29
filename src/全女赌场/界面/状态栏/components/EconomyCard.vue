<template>
  <div class="economy">
    <section class="balance-card" :class="[chips.cls.value, { 'debt-risk': debtRatio >= 0.5 }]">
      <div class="balance-copy">
        <span class="balance-label">可用筹码</span>
        <div class="balance-number" aria-live="polite">
          <span class="balance-ghost" aria-hidden="true">888888888</span>
          <span class="balance-value">{{ ledText }}</span>
        </div>
      </div>

      <div class="chip-seal" aria-hidden="true">
        <span><i class="fa-solid fa-spade"></i></span>
      </div>
    </section>

    <div class="account-strip">
      <section
        class="account-cell debt-cell"
        :class="{ alert: store.data.主角.欠债 > 0, 'normal-state': !isBunny }"
      >
        <div class="cell-head">
          <span><i class="fa-solid fa-file-invoice-dollar" aria-hidden="true"></i> 欠债</span>
          <strong :class="debtDeltaClass">{{ debt.text.value }}</strong>
        </div>
        <div
          class="debt-track"
          role="progressbar"
          aria-label="欠债额度"
          :aria-valuenow="store.data.主角.欠债"
          aria-valuemin="0"
          aria-valuemax="50000"
        >
          <span :style="{ width: `${debtRatio * 100}%` }"></span>
        </div>
      </section>

      <section class="account-cell identity-cell">
        <div class="cell-head">
          <span><i class="fa-solid fa-id-card" aria-hidden="true"></i> 身份</span>
          <strong :class="{ bunny: isBunny }">{{ store.data.主角.身份状态 }}</strong>
        </div>
        <div class="identity-flags">
          <span v-if="isFuta" class="status-badge"><i class="fa-solid fa-venus-mars"></i> 扶她化</span>
          <span v-if="isBunny" class="work-copy">抵债 {{ store.data.主角.兔女郎工作进度 }}%</span>
          <span v-else-if="!isFuta" class="status-clear">状态正常</span>
        </div>
        <div v-if="isBunny" class="work-track" aria-hidden="true">
          <span :style="{ width: `${store.data.主角.兔女郎工作进度}%` }"></span>
        </div>
      </section>
    </div>

    <section class="inventory">
      <header class="section-head">
        <h2><i class="fa-solid fa-layer-group" aria-hidden="true"></i> 道具</h2>
        <span>{{ inventoryEntries.length }} 种</span>
      </header>

      <template v-if="inventoryEntries.length">
        <div class="item-grid" role="list">
          <button
            v-for="[name, count] in inventoryEntries"
            :key="name"
            type="button"
            role="listitem"
            class="item-chip"
            :class="{ active: activeName === name }"
            :aria-pressed="activeName === name"
            @click="selectedName = name"
          >
            <i :class="findGoods(name)?.icon ?? 'fa-solid fa-box'" aria-hidden="true"></i>
            <span>{{ name }}</span>
            <strong>×{{ count }}</strong>
          </button>
        </div>

        <Transition name="drawer-swap" mode="out-in">
          <div :key="activeName" class="item-drawer">
            <div class="drawer-copy">
              <strong>{{ activeName }}</strong>
              <p>{{ activeGoods?.description ?? '暂无物品说明。' }}</p>
            </div>
            <button type="button" class="use-btn" @click="useActiveItem">
              <i class="fa-solid fa-hand-sparkles" aria-hidden="true"></i>
              使用
            </button>
          </div>
        </Transition>
      </template>

      <div v-else class="empty-inventory">
        <i class="fa-solid fa-box-open" aria-hidden="true"></i>
        <span>道具为空</span>
      </div>

      <Transition name="tip-fade">
        <div v-if="usedTip" class="used-tip" role="status">{{ usedTip }}</div>
      </Transition>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useCountUp } from '../../../countup';
import { findGoods } from '../../../goods';
import { useDataStore } from '../store';

const store = useDataStore();
const isBunny = computed(() => store.data.主角.身份状态 === '兔女郎');
const isFuta = computed(() => store.data.主角.扶她化状态 === '生效中');
const debtRatio = computed(() => Math.min(store.data.主角.欠债 / 50000, 1));

const chips = useCountUp(() => store.data.主角.筹码);
const debt = useCountUp(() => store.data.主角.欠债);
const ledText = computed(() => chips.text.value.replace(/,/g, ''));
const debtDeltaClass = computed(() =>
  debt.cls.value === 'win' ? 'delta-bad' : debt.cls.value === 'lose' ? 'delta-good' : '',
);

const inventoryEntries = computed(() => Object.entries(store.data.主角.物品栏).filter(([, count]) => count > 0));
const selectedName = ref<string | null>(null);
const activeName = computed(() => {
  const current = selectedName.value;
  if (current && inventoryEntries.value.some(([name]) => name === current)) return current;
  return inventoryEntries.value[0]?.[0] ?? null;
});
const activeGoods = computed(() => (activeName.value ? findGoods(activeName.value) : undefined));

const usedTip = ref('');
let tipTimer = 0;

async function useItem(name: string) {
  const warning = isBunny.value ? '（兔女郎对客人使用道具会被扣工资）' : '';
  await triggerSlash(`/setinput （从物品栏取出「${name}」准备使用）${warning}`);
  usedTip.value = isBunny.value ? '已放入输入框；对客人使用会被扣工资。' : '已放入输入框；补充对象与方式后发送。';
  clearTimeout(tipTimer);
  tipTimer = window.setTimeout(() => (usedTip.value = ''), 3200);
}

function useActiveItem() {
  if (activeName.value) void useItem(activeName.value);
}
</script>

<style lang="scss" scoped>
.economy {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.balance-card {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 112px;
  padding: 16px 18px 16px 20px;
  overflow: hidden;
  background: linear-gradient(90deg, rgba(213, 164, 73, 0.08), transparent 48%), #0e0911;
  border: 1px solid rgba(213, 164, 73, 0.52);
  border-radius: 13px;
  box-shadow:
    inset 0 0 0 3px #0e0911,
    inset 0 0 0 4px rgba(213, 164, 73, 0.14);

  &::before,
  &::after {
    position: absolute;
    top: 50%;
    width: 10px;
    aspect-ratio: 1;
    content: '';
    background: var(--c-surface);
    border: 1px solid rgba(213, 164, 73, 0.4);
    border-radius: 50%;
    transform: translateY(-50%);
  }

  &::before {
    left: -6px;
  }

  &::after {
    right: -6px;
  }

  &.win .balance-value {
    color: var(--c-success);
  }

  &.lose {
    animation: lose-shake 420ms ease;

    .balance-value {
      color: var(--c-danger);
    }
  }

  &.debt-risk {
    border-color: rgba(214, 87, 114, 0.6);

    .chip-seal {
      filter: saturate(0.8) hue-rotate(300deg);
    }
  }
}

.balance-copy {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.balance-label {
  color: var(--c-text-muted);
  font-family: var(--font-display);
  font-size: 14px;
  letter-spacing: 0.14em;
}

.balance-number {
  position: relative;
  align-self: flex-start;
  max-width: 100%;
  font-family: var(--font-led);
  font-size: clamp(30px, 8vw, 45px);
  line-height: 1;
  letter-spacing: 0.03em;
}

.balance-ghost {
  color: rgba(213, 164, 73, 0.055);
  user-select: none;
}

.balance-value {
  position: absolute;
  top: 0;
  right: 0;
  color: var(--c-primary);
  text-shadow: 0 0 16px rgba(213, 164, 73, 0.35);
  transition: color 200ms ease;
}

.chip-seal {
  position: relative;
  display: grid;
  flex: 0 0 76px;
  width: 76px;
  aspect-ratio: 1;
  place-items: center;
  margin-right: 2px;
  background:
    radial-gradient(circle, #ead399 0 30%, transparent 31%),
    repeating-conic-gradient(var(--c-primary) 0 12deg, #2b1b2e 12deg 24deg);
  border: 2px solid #ead399;
  border-radius: 50%;
  box-shadow:
    inset 0 0 0 7px #18101b,
    inset 0 0 0 9px rgba(234, 211, 153, 0.75),
    0 6px 20px rgba(0, 0, 0, 0.45);
  transform: rotate(-7deg);
  transition: filter 200ms ease;

  span {
    display: grid;
    width: 30px;
    aspect-ratio: 1;
    place-items: center;
    color: var(--c-ink);
    font-size: 14px;
    transform: rotate(7deg);
  }
}

.account-strip {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border: 1px solid var(--c-border);
  border-radius: 11px;
}

.account-cell {
  display: grid;
  grid-template-rows: auto 26px 4px;
  min-width: 0;
  padding: 12px 14px;

  & + & {
    border-left: 1px solid var(--c-border);
  }
}

.cell-head {
  grid-row: 1;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;

  > span {
    color: var(--c-text-muted);
    font-size: 13px;

    i {
      width: 17px;
      color: var(--c-primary);
    }
  }

  strong {
    font-size: 17px;
    font-variant-numeric: tabular-nums;
  }
}

.debt-cell.alert {
  .cell-head strong {
    color: var(--c-danger);
  }
}

.debt-cell.normal-state {
  grid-template-rows: auto 34px 4px;
}

.delta-good {
  color: var(--c-success) !important;
  animation: win-flash 650ms ease;
}

.delta-bad {
  color: var(--c-danger) !important;
  animation: lose-shake 420ms ease;
}

.debt-track,
.work-track {
  grid-row: 3;
  height: 4px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 999px;

  span {
    display: block;
    height: 100%;
    background: var(--c-danger);
    border-radius: inherit;
    transition: width 300ms ease;
  }
}

.identity-cell .cell-head strong.bunny {
  color: var(--c-danger);
}

.identity-flags {
  grid-row: 2;
  display: flex;
  align-items: center;
  min-height: 19px;
  margin-top: 7px;
}

.status-clear,
.work-copy {
  color: var(--c-text-muted);
  font-size: 11px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  background: var(--c-danger);
  border-radius: 999px;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 9px;

  h2 {
    margin: 0;
    font-family: var(--font-display);
    font-size: 16px;
    letter-spacing: 0.08em;

    i {
      margin-right: 7px;
      color: var(--c-primary);
      font-size: 13px;
    }
  }

  > span {
    color: var(--c-text-muted);
    font-size: 11px;
  }
}

.item-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 7px;
}

.item-chip {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) auto;
  align-items: center;
  gap: 7px;
  min-height: 40px;
  padding: 7px 9px;
  color: var(--c-text);
  text-align: left;
  background: var(--c-surface-alt);
  border: 1px solid var(--c-border);
  border-radius: 8px;
  cursor: pointer;
  transition:
    border-color 140ms ease,
    background 140ms ease;

  > i {
    color: var(--c-primary);
    text-align: center;
  }

  > span {
    overflow: hidden;
    font-family: inherit;
    font-size: 12px;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  > strong {
    color: var(--c-text-muted);
    font-size: 11px;
    font-variant-numeric: tabular-nums;
  }

  &:hover {
    border-color: rgba(213, 164, 73, 0.65);
  }

  &.active {
    background: var(--c-surface-raised);
    border-color: var(--c-primary);
  }
}

.item-drawer {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 8px;
  padding: 11px 12px;
  background: rgba(213, 164, 73, 0.07);
  border: 1px solid var(--c-border-soft);
  border-radius: 9px;
}

.drawer-copy {
  flex: 1;
  min-width: 0;

  strong {
    font-size: 13px;
  }

  p {
    margin: 4px 0 0;
    color: var(--c-text-muted);
    font-size: 12px;
    line-height: 1.5;
  }
}

.use-btn {
  flex: none;
  min-width: 76px;
  min-height: 36px;
  color: var(--c-ink);
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  background: var(--c-primary);
  border: 0;
  border-radius: 7px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4);
  cursor: pointer;

  i {
    margin-right: 4px;
  }

  &:hover {
    filter: brightness(1.1);
  }

  &:active {
    transform: translateY(1px);
  }
}

.empty-inventory {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 62px;
  color: var(--c-text-muted);
  background: rgba(255, 255, 255, 0.018);
  border: 1px dashed var(--c-border);
  border-radius: 9px;
}

.used-tip {
  margin-top: 8px;
  padding: 8px 10px;
  color: var(--c-text);
  font-size: 12px;
  background: rgba(99, 198, 159, 0.11);
  border-left: 3px solid var(--c-success);
  border-radius: 0 6px 6px 0;
}

.drawer-swap-enter-active,
.drawer-swap-leave-active,
.tip-fade-enter-active,
.tip-fade-leave-active {
  transition:
    opacity 150ms ease,
    transform 150ms ease;
}

.drawer-swap-enter-from,
.tip-fade-enter-from,
.drawer-swap-leave-to,
.tip-fade-leave-to {
  opacity: 0;
  transform: translateY(-3px);
}

@media (max-width: 460px) {
  .balance-card {
    min-height: 96px;
    padding: 14px;
  }

  .balance-number {
    font-size: clamp(26px, 8.5vw, 34px);
  }

  .chip-seal {
    flex-basis: 62px;
    width: 62px;
  }

  .account-strip {
    grid-template-columns: 1fr;
  }

  .account-cell + .account-cell {
    border-top: 1px solid var(--c-border);
    border-left: 0;
  }

  .item-grid {
    grid-template-columns: 1fr;
  }

  .item-drawer {
    align-items: flex-end;
  }
}
</style>
