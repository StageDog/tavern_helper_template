<template>
  <div class="economy">
    <!-- 英雄层：LED 筹码计数窗 -->
    <div class="led-meter" :class="chips.cls.value">
      <div class="led-head">
        <span class="chip-disc"><span class="chip-core"></span></span>
        <span class="eyebrow">TOKENS · 当前token</span>
      </div>
      <span class="led-digits">
        <span class="led-ghost">888888</span>
        <span class="led-value">{{ ledText }}</span>
      </span>
    </div>

    <!-- 次层：眉题行 -->
    <div class="sub-row">
      <div class="sub-item" :class="{ danger: store.data.主角.欠债 > 0 }">
        <span class="eyebrow">欠债</span>
        <span class="sub-value" :class="debt.cls.value === 'win' ? 'lose' : debt.cls.value === 'lose' ? 'win' : ''">{{ debt.text.value }}</span>
      </div>
      <span class="sub-divider"></span>
      <div class="sub-item">
        <span class="eyebrow">身份</span>
        <span class="sub-value" :class="{ bunny: isBunny }">{{ store.data.主角.身份状态 }}</span>
        <span v-if="isFuta" class="futa-badge"><i class="fa-solid fa-venus-mars"></i> 扶她化</span>
      </div>
    </div>

    <div v-if="isBunny" class="bunny-progress">
      <span class="eyebrow">抵债进度</span>
      <div class="bar">
        <div class="bar-fill" :style="{ width: `${store.data.主角.兔女郎工作进度}%` }"></div>
      </div>
      <span class="bar-num">{{ store.data.主角.兔女郎工作进度 }}/100</span>
    </div>

    <div v-if="!_.isEmpty(store.data.主角.物品栏)" class="inventory">
      <div class="sec-head">
        <span class="eyebrow"><i class="fa-solid fa-flask"></i> 持有物品</span>
        <hr class="hairline" />
      </div>
      <div class="item-list">
        <div v-for="(count, name) in store.data.主角.物品栏" :key="name" class="item-card">
          <div class="item-icon">
            <i :class="findGoods(name as string)?.icon ?? 'fa-solid fa-box'"></i>
          </div>
          <div class="item-info">
            <span class="item-name">{{ name }} <span class="item-count">×{{ count }}</span></span>
            <span class="item-desc">{{ findGoods(name as string)?.description ?? '来历不明的物品…' }}</span>
          </div>
          <button class="use-btn" :title="`使用${name}`" @click="useItem(name as string)">
            <i class="fa-solid fa-hand-sparkles"></i> 使用
          </button>
        </div>
      </div>
      <span v-if="usedTip" class="used-tip">{{ usedTip }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { useCountUp } from '../../../countup';
import { findGoods } from '../../../goods';
import { useDataStore } from '../store';

const store = useDataStore();
const isBunny = computed(() => store.data.主角.身份状态 === '兔女郎');
const isFuta = computed(() => store.data.主角.扶她化状态 === '生效中');

// 数字滚动 + 赢闪/输抖（欠债方向反转：涨=坏事红抖，降=好事绿闪）
const chips = useCountUp(() => store.data.主角.筹码);
const debt = useCountUp(() => store.data.主角.欠债);

// LED 窗显示：去掉千分位逗号（七段数码管没有逗号），前导用暗段补齐
const ledText = computed(() => chips.text.value.replace(/,/g, ''));

const usedTip = ref('');
let tipTimer = 0;

/**
 * 使用物品：把使用宣言填入聊天输入框，等玩家补充细节（对谁用/怎么用）后发送，
 * 效果结算交给 AI（见变量更新规则的「物品使用」段）。
 */
async function useItem(name: string) {
  const bunnyWarn = isBunny.value ? '（⚠️ 作为兔女郎对客人使用道具会被老板娘扣工资！）' : '';
  const text = `（从物品栏取出「${name}」准备使用）${bunnyWarn}`;
  await triggerSlash(`/setinput ${text}`);
  usedTip.value = isBunny.value
    ? `⚠️ 已填入输入框，注意：对客人使用会被扣工资哦`
    : `已把「${name}」填进输入框，补上对谁用、怎么用再发送～`;
  clearTimeout(tipTimer);
  tipTimer = window.setTimeout(() => (usedTip.value = ''), 3000);
}
</script>

<style lang="scss" scoped>
.economy {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ── 英雄层：LED 筹码计数窗 ── */
.led-meter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: var(--led-bg);
  border: 1px solid var(--c-border);
  border-radius: 10px;
  box-shadow: var(--led-inset);
  padding: 10px 16px;

  &.win .led-value {
    color: var(--c-success);
    text-shadow: var(--glow-green);
  }

  &.lose {
    animation: lose-shake 0.5s;

    .led-value {
      color: var(--c-danger);
      text-shadow: var(--glow-pink);
    }
  }
}

.led-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.led-digits {
  position: relative;
  font-family: var(--font-led);
  font-size: 26px;
  line-height: 1;
}

/* 未点亮的暗段（真数码管的底显） */
.led-ghost {
  color: rgba(232, 176, 79, 0.07);
  user-select: none;
}

.led-value {
  position: absolute;
  right: 0;
  top: 0;
  color: var(--c-primary);
  text-shadow: var(--glow-gold);
  transition: color 0.3s;
}

/* ── 次层：眉题行 ── */
.sub-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 4px;
}

.sub-item {
  display: flex;
  align-items: baseline;
  gap: 8px;

  &.danger .sub-value {
    color: var(--c-danger);
  }
}

.sub-divider {
  width: 1px;
  height: 14px;
  background: var(--c-border);
}

.sub-value {
  font-weight: bold;
  font-size: 14px;

  &.bunny {
    color: var(--c-danger);
  }

  &.win {
    color: var(--c-success);
    animation: win-flash 0.7s ease-out;
  }

  &.lose {
    color: var(--c-danger);
    animation: lose-shake 0.5s;
  }
}

.futa-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 10px;
  color: #fff;
  background: linear-gradient(90deg, var(--c-neon-pink), var(--c-neon-cyan));
  box-shadow: var(--glow-pink);
  letter-spacing: 0.05em;
}

.section-label {
  font-size: 11px;
  color: var(--c-text-muted);
}

/* CSS 筹码圆盘 */
.chip-disc {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background:
    repeating-conic-gradient(var(--c-primary) 0deg 22.5deg, #1a1224 22.5deg 45deg);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--glow-gold);
}

.chip-core {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--btn-gold);
  border: 1.5px dashed rgba(26, 18, 36, 0.55);
}

.bunny-progress {
  display: flex;
  align-items: center;
  gap: 8px;

  .bar {
    flex: 1;
    height: 8px;
    background: var(--c-surface-alt);
    border-radius: 4px;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    background: var(--c-danger);
    box-shadow: var(--glow-pink);
    transition: width 0.4s;
  }

  .bar-num {
    font-size: 11px;
    color: var(--c-text-muted);
  }
}

.inventory {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sec-head {
  display: flex;
  align-items: center;
  gap: 10px;

  .hairline {
    flex: 1;
  }
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.item-card {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--c-surface-alt);
  border: 1px solid var(--c-border);
  border-radius: 8px;
  padding: 8px 10px;
  transition: border-color 0.15s;

  &:hover {
    border-color: var(--c-primary);
  }
}

.item-icon {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 8px;

  i {
    color: var(--c-primary);
    font-size: 15px;
  }
}

.item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.item-name {
  font-weight: bold;
  font-size: 13px;
}

.item-count {
  font-weight: normal;
  font-size: 11px;
  color: var(--c-text-muted);
}

.item-desc {
  font-size: 11px;
  color: var(--c-text-muted);
  line-height: 1.4;
}

.use-btn {
  flex-shrink: 0;
  background: var(--btn-gold);
  border: none;
  border-radius: 6px;
  color: #1a1224;
  font-size: 12px;
  font-weight: bold;
  padding: 6px 14px;
  cursor: pointer;
  font-family: inherit;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.35);
  transition: filter 0.15s, transform 0.1s;

  &:hover {
    filter: brightness(1.12);
  }

  &:active {
    transform: translateY(1px);
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
  }
}

.used-tip {
  font-size: 11px;
  color: var(--c-success);
}
</style>
