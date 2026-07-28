<template>
  <div class="girl-detail">
    <button class="back-btn" @click="emit('back')"><i class="fa-solid fa-angle-left"></i> 返回</button>

    <div class="detail-body">
      <!-- 左列：竖版立绘（多张可点击循环切换） -->
      <div class="portrait-col">
        <div class="portrait-wrap" :class="{ switchable: list.length > 1 }" @click="next">
          <img v-if="current" class="portrait" :src="current" :alt="name" />
          <div v-else class="portrait placeholder" :style="{ background: placeholderGradient(name) }">
            <i class="fa-solid fa-user-large"></i>
          </div>
          <div v-if="list.length > 1" class="dots">
            <span v-for="(__, i) in list" :key="i" class="dot" :class="{ on: i === index }"></span>
          </div>
        </div>
        <div class="identity-row">
          <span class="name">{{ name }}</span>
          <span class="badge" :class="{ bunny: isBunny }">{{ girl.身份 }}</span>
        </div>
      </div>

      <!-- 右列：信息区 -->
      <div class="info-col">
        <section>
          <h4 class="sec-title"><i class="fa-solid fa-shirt"></i> 当前着装<span class="rule"></span></h4>
          <p class="sec-text">{{ girl.着装 }}</p>
        </section>

        <section>
          <h4 class="sec-title"><i class="fa-solid fa-ribbon"></i> 身体状态<span class="rule"></span></h4>
          <div class="body-list">
            <div v-for="(desc, part) in girl.身体状态" :key="part" class="body-row">
              <span class="body-part">{{ part }}</span>
              <span class="body-desc">{{ desc }}</span>
            </div>
          </div>
        </section>

        <section>
          <h4 class="sec-title"><i class="fa-solid fa-scroll"></i> 实时行为<span class="rule"></span></h4>
          <div class="behavior">
            <div class="behavior-row">
              <span class="behavior-label"><i class="fa-solid fa-location-dot"></i> 所在位置</span>
              <span class="behavior-loc">{{ girl.所在位置 }}</span>
            </div>
            <div class="behavior-block">
              <span class="behavior-label"><i class="fa-solid fa-masks-theater"></i> 当前动作</span>
              <p class="behavior-text">{{ girl.当前动作 }}</p>
            </div>
            <div class="behavior-block">
              <span class="behavior-label"><i class="fa-solid fa-brain"></i> 内心活动</span>
              <p class="behavior-text inner">{{ girl.内心 }}</p>
            </div>
          </div>
        </section>

        <!-- 经济状态 -->
        <section class="economy-section">
          <h4 class="sec-title"><i class="fa-solid fa-chart-line"></i> 经济状态<span class="rule"></span></h4>
          <!-- 普通赌客：显示总营收 + 本轮盈亏 -->
          <div v-if="!isBunny" class="econ-card">
            <div class="econ-row">
              <span class="econ-label">总营收</span>
              <span class="econ-value">{{ girl.经济状态.总营收.toLocaleString() }}</span>
            </div>
            <div class="econ-row">
              <span class="econ-label">本轮盈亏</span>
              <span
                class="econ-value"
                :class="girl.经济状态.本轮盈亏 > 0 ? 'profit' : girl.经济状态.本轮盈亏 < 0 ? 'loss' : ''"
              >{{ girl.经济状态.本轮盈亏 > 0 ? '+' : '' }}{{ girl.经济状态.本轮盈亏 }}</span>
            </div>
          </div>
          <!-- 兔女郎：显示赎身进度（10格格子） -->
          <div v-else class="redeem-card">
            <span class="econ-label">赎身进度</span>
            <div class="redeem-pips">
              <span
                v-for="i in 10"
                :key="i"
                class="pip"
                :class="{ filled: i <= girl.赎身进度 }"
              ></span>
            </div>
            <span class="redeem-num">{{ girl.赎身进度 }}/10</span>
          </div>
        </section>

        <!-- 点单区域：仅群友是兔女郎时显示 -->
        <section v-if="isBunny" class="order-section">
          <h4 class="sec-title"><i class="fa-solid fa-champagne-glasses"></i> 点单服务<span class="rule"></span></h4>
          <div v-if="userIsBunny" class="bunny-block-notice">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <span>你现在是兔女郎身份，不可以点单别的兔女郎同事哦—— 大家一起接客就好。</span>
          </div>
          <div v-else-if="price !== null" class="order-card" :class="{ 'order-card--done': alreadyOrdered }">
            <div class="order-card-row">
              <div class="order-info">
                <span class="order-name">包夜服务</span>
                <span class="order-price"><i class="fa-solid fa-coins"></i> {{ price }} 筹码</span>
              </div>
              <!-- 已点单：封锁显示 -->
              <span v-if="alreadyOrdered" class="ordered-tag">
                <i class="fa-solid fa-check"></i> 已点单
              </span>
              <!-- 未点单：正常流程 -->
              <template v-else>
                <button v-if="!showConfirm" class="order-btn" @click="showConfirm = true">
                  <i class="fa-solid fa-bell-concierge"></i> 点单
                </button>
                <div v-else class="confirm-group">
                  <button class="confirm-yes" @click="handleOrder">确定</button>
                  <button class="confirm-no" @click="showConfirm = false">取消</button>
                </div>
              </template>
            </div>
            <Transition name="tip-fade">
              <span v-if="orderTip" class="order-tip" :class="{ fail: orderTip.startsWith('✗') }">{{ orderTip }}</span>
            </Transition>
          </div>
          <div v-else class="order-card order-card--disabled">
            <span class="no-price"><i class="fa-solid fa-clock"></i> 价目待定</span>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Schema } from '../../../schema';
import { placeholderGradient, portraitList } from '../portraits';
import { servicePrice, placeOrder, hasOrdered, type OrderResult } from '../services';
import { useDataStore } from '../store';

const props = defineProps<{
  name: string;
  girl: Schema['群友'][string];
}>();

const emit = defineEmits<{ back: [] }>();

const store = useDataStore();
const isBunny = computed(() => props.girl.身份.includes('兔女郎'));
/** 玩家自己是否是兔女郎（限制点单功能） */
const userIsBunny = computed(() => store.data.主角.身份状态 === '兔女郎');

// 当前状态的立绘组；身份变化（如下海）时自动换组并回到第一张
const list = computed(() => portraitList(props.name, props.girl.身份));
const index = ref(0);
watch(list, () => (index.value = 0));
const current = computed(() => list.value[index.value]);

function next() {
  if (list.value.length > 1) {
    index.value = (index.value + 1) % list.value.length;
  }
}

// ─── 点单逻辑 ───
const price = computed(() => servicePrice(props.name));
const alreadyOrdered = computed(() => hasOrdered(props.name));
const showConfirm = ref(false);
const orderTip = ref('');
let tipTimer = 0;

function handleOrder() {
  const result: OrderResult = placeOrder(props.name);
  showConfirm.value = false;

  if (result.ok) {
    orderTip.value = `✓ 已花费 ${result.cost} 筹码包下「${props.name}」一夜`;
  } else if (result.reason === 'insufficient') {
    orderTip.value = '✗ 筹码不足，赚够了再来吧';
  } else {
    orderTip.value = '✗ 无法点单';
  }

  clearTimeout(tipTimer);
  tipTimer = window.setTimeout(() => (orderTip.value = ''), 4000);
}
</script>

<style lang="scss" scoped>
.girl-detail {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.back-btn {
  align-self: flex-start;
  background: var(--c-surface-alt);
  border: 1px solid var(--c-border);
  border-radius: 6px;
  color: var(--c-text-muted);
  padding: 4px 12px;
  font-size: 12px;
  cursor: pointer;
  font-family: inherit;

  &:hover {
    color: var(--c-primary);
    border-color: var(--c-primary);
  }
}

.detail-body {
  display: flex;
  gap: 12px;
}

.portrait-col {
  flex: 0 0 38%;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.portrait-wrap {
  position: relative;

  &.switchable {
    cursor: pointer;
  }
}

.portrait {
  width: 100%;
  aspect-ratio: 2 / 3;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--c-border);
  display: block;

  &.placeholder {
    display: flex;
    align-items: center;
    justify-content: center;

    i {
      font-size: 52px;
      color: rgba(255, 255, 255, 0.35);
    }
  }
}

.dots {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 5px;
  padding: 3px 8px;
  background: rgba(10, 6, 16, 0.55);
  border-radius: 8px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.35);

  &.on {
    background: var(--c-primary);
  }
}

.identity-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.name {
  font-size: 16px;
  font-weight: bold;
  color: var(--c-text);
}

.badge {
  font-size: 10px;
  padding: 1px 8px;
  border-radius: 8px;
  border: 1px solid var(--c-border);
  color: var(--c-text-muted);

  &.bunny {
    color: #fff;
    border-color: var(--c-danger);
    background: var(--c-danger);
  }
}

.info-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sec-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 6px;
  font-size: 13px;
  color: var(--c-primary);

  .rule {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, var(--c-border), transparent);
  }
}

.sec-text {
  margin: 0;
  font-size: 12px;
  color: var(--c-text);
  line-height: 1.5;
}

.body-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.body-row {
  display: flex;
  gap: 8px;
  background: var(--c-surface-alt);
  border-left: 2px solid var(--c-danger);
  border-radius: 0 6px 6px 0;
  padding: 5px 8px;
  font-size: 12px;
}

.body-part {
  flex-shrink: 0;
  font-weight: bold;
  color: var(--c-text-muted);
}

.body-desc {
  color: var(--c-text);
  line-height: 1.45;
}

.behavior {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.behavior-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
}

.behavior-label {
  font-size: 11px;
  color: var(--c-text-muted);

  i {
    margin-right: 3px;
  }
}

.behavior-loc {
  font-size: 12px;
  font-weight: bold;
  color: var(--c-primary);
}

.behavior-block {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.behavior-text {
  margin: 0;
  font-size: 12px;
  color: var(--c-text);
  line-height: 1.55;
  background: var(--c-surface-alt);
  border: 1px solid var(--c-border);
  border-radius: 6px;
  padding: 6px 9px;

  &.inner {
    font-style: italic;
    color: var(--c-text-muted);
    border-left: 2px solid var(--c-primary);
  }
}

/* 窄屏：立绘上、信息下 */
@media (max-width: 430px) {
  .detail-body {
    flex-direction: column;
  }

  .portrait-col {
    flex: none;
    flex-direction: row;
    align-items: flex-end;

    .portrait {
      width: 45%;
    }
  }
}

/* ─── 经济状态区域 ─── */
.economy-section {
  border-top: 1px solid var(--c-border);
  padding-top: 10px;
}

.econ-card {
  display: flex;
  flex-direction: column;
  gap: 5px;
  background: var(--c-surface-alt);
  border: 1px solid var(--c-border);
  border-radius: 8px;
  padding: 8px 12px;
}

.econ-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
}

.econ-label {
  font-size: 11px;
  color: var(--c-text-muted);
}

.econ-value {
  font-size: 13px;
  font-weight: bold;
  color: var(--c-text);

  &.profit {
    color: var(--c-success);
  }

  &.loss {
    color: var(--c-danger);
  }
}

.redeem-card {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--c-surface-alt);
  border: 1px solid rgba(var(--c-danger-rgb, 220, 53, 69), 0.35);
  border-radius: 8px;
  padding: 8px 12px;
}

.redeem-pips {
  display: flex;
  gap: 4px;
  flex: 1;
}

.pip {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  transition: background 0.2s, border-color 0.2s;

  &.filled {
    background: var(--c-danger);
    border-color: var(--c-danger);
    box-shadow: var(--glow-pink);
  }
}

.redeem-num {
  font-size: 11px;
  color: var(--c-text-muted);
  white-space: nowrap;
}

/* ─── 点单区域 ─── */
.order-section {
  border-top: 1px solid var(--c-border);
  padding-top: 10px;
}

.bunny-block-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(220, 53, 69, 0.08);
  border: 1px solid rgba(220, 53, 69, 0.35);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  color: var(--c-danger);
  line-height: 1.5;

  i {
    flex-shrink: 0;
    font-size: 13px;
  }
}

.order-card {
  background: var(--c-surface-alt);
  border: 1px solid var(--c-border);
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: border-color 0.15s;

  &:hover {
    border-color: var(--c-primary);
  }

  &--disabled {
    opacity: 0.6;

    &:hover {
      border-color: var(--c-border);
    }
  }

  &--done {
    border-color: var(--c-border);
    opacity: 0.75;

    &:hover {
      border-color: var(--c-border);
    }
  }
}

.ordered-tag {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: bold;
  color: var(--c-text-muted);
  border: 1px solid var(--c-border);
  border-radius: 5px;
  padding: 5px 12px;

  i {
    margin-right: 4px;
    color: var(--c-success);
  }
}

.order-card-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.order-name {
  font-size: 12px;
  color: var(--c-text-muted);
}

.order-price {
  font-size: 14px;
  font-weight: bold;
  color: var(--c-primary);

  i {
    font-size: 11px;
    margin-right: 3px;
  }
}

.order-btn {
  flex-shrink: 0;
  background: var(--btn-gold);
  border: none;
  border-radius: 6px;
  color: #1a1224;
  font-size: 12px;
  font-weight: bold;
  padding: 7px 16px;
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

.confirm-group {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.confirm-yes {
  background: var(--c-danger);
  border: none;
  border-radius: 5px;
  color: #fff;
  font-size: 11px;
  font-weight: bold;
  padding: 5px 14px;
  cursor: pointer;
  font-family: inherit;

  &:hover {
    filter: brightness(1.15);
  }
}

.confirm-no {
  background: transparent;
  border: 1px solid var(--c-border);
  border-radius: 5px;
  color: var(--c-text-muted);
  font-size: 11px;
  padding: 5px 14px;
  cursor: pointer;
  font-family: inherit;

  &:hover {
    color: var(--c-text);
    border-color: var(--c-text-muted);
  }
}

.no-price {
  font-size: 12px;
  color: var(--c-text-muted);
  font-style: italic;

  i {
    margin-right: 4px;
  }
}

.order-tip {
  font-size: 11px;
  color: var(--c-success);

  &.fail {
    color: var(--c-danger);
  }
}

.tip-fade-enter-active,
.tip-fade-leave-active {
  transition: opacity 0.25s;
}

.tip-fade-enter-from,
.tip-fade-leave-to {
  opacity: 0;
}

/* ─── 经济状态区块 ─── */
.econ-section {
  border-top: 1px solid var(--c-border);
  padding-top: 10px;
}

.econ-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.econ-item {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.econ-val {
  font-weight: bold;
  font-size: 13px;
  color: var(--c-text);

  &.positive {
    color: var(--c-success);
  }

  &.negative {
    color: var(--c-danger);
  }
}

.redeem-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.redeem-track {
  display: flex;
  gap: 3px;
}

.redeem-cell {
  width: 16px;
  height: 10px;
  border-radius: 2px;
  background: var(--c-surface-alt);
  border: 1px solid var(--c-border);

  &.filled {
    background: var(--c-danger);
    border-color: var(--c-danger);
    box-shadow: var(--glow-pink);
  }
}

.redeem-num {
  font-size: 11px;
  color: var(--c-text-muted);
}
</style>
