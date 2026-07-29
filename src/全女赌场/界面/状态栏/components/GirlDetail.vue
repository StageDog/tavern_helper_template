<template>
  <article class="girl-detail">
    <button type="button" class="back-btn" @click="emit('back')">
      <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
      返回名册
    </button>

    <div class="profile-grid">
      <div class="portrait-col">
        <button
          type="button"
          class="portrait-wrap"
          :class="{ switchable: list.length > 1 }"
          :aria-label="list.length > 1 ? `切换${name}的立绘` : `${name}的立绘`"
          @click="next"
        >
          <img v-if="current" class="portrait" :src="current" :alt="name" />
          <span v-else class="portrait placeholder" :style="{ background: placeholderGradient(name) }">
            <i class="fa-solid fa-user-large" aria-hidden="true"></i>
          </span>
          <span v-if="list.length > 1" class="dots" aria-hidden="true">
            <span v-for="(__, i) in list" :key="i" class="dot" :class="{ on: i === index }"></span>
          </span>
        </button>
      </div>

      <div
        ref="profileContent"
        class="profile-content"
        role="region"
        tabindex="0"
        :aria-label="`${name}的名册档案`"
        @scroll="syncScrollRail"
      >
        <header class="identity">
          <div>
            <h2>{{ name }}</h2>
            <span class="badge" :class="{ bunny: isBunny }">{{ girl.身份 }}</span>
          </div>
          <span class="location"><i class="fa-solid fa-location-dot" aria-hidden="true"></i> {{ girl.所在位置 }}</span>
        </header>

        <section class="action-lead">
          <i class="fa-solid fa-masks-theater" aria-hidden="true"></i>
          <p>{{ girl.当前动作 }}</p>
        </section>

        <div class="snapshot-grid">
          <section class="snapshot">
            <h3><i class="fa-solid fa-shirt" aria-hidden="true"></i> 衣着</h3>
            <p>{{ girl.着装 }}</p>
          </section>
          <section class="snapshot thought">
            <h3><i class="fa-solid fa-comment" aria-hidden="true"></i> 心声</h3>
            <p>{{ girl.内心 }}</p>
          </section>
        </div>

        <details class="body-register">
          <summary>
            <span><i class="fa-solid fa-ribbon" aria-hidden="true"></i> 身体状态</span>
            <span class="summary-meta">{{ bodyEntryCount }} 项记录</span>
            <i class="fa-solid fa-chevron-down chevron" aria-hidden="true"></i>
          </summary>
          <dl>
            <div v-for="(desc, part) in girl.身体状态" :key="part">
              <dt>{{ part }}</dt>
              <dd>{{ desc }}</dd>
            </div>
          </dl>
        </details>

        <section class="ledger">
          <header>
            <h3><i class="fa-solid fa-chart-line" aria-hidden="true"></i> 账目</h3>
          </header>

          <div v-if="!isBunny" class="ledger-stats">
            <div>
              <span>总营收</span>
              <strong>{{ girl.经济状态.总营收.toLocaleString() }}</strong>
            </div>
            <div>
              <span>本轮</span>
              <strong :class="roundClass">
                {{ girl.经济状态.本轮盈亏 > 0 ? '+' : '' }}{{ girl.经济状态.本轮盈亏 }}
              </strong>
            </div>
          </div>

          <div v-else class="redeem">
            <div class="redeem-copy">
              <span>赎身进度</span>
              <strong>{{ girl.赎身进度 }}/10</strong>
            </div>
            <div
              class="redeem-pips"
              role="progressbar"
              aria-label="赎身进度"
              :aria-valuenow="girl.赎身进度"
              aria-valuemin="0"
              aria-valuemax="10"
            >
              <span v-for="i in 10" :key="i" :class="{ filled: i <= girl.赎身进度 }"></span>
            </div>
          </div>
        </section>

        <section v-if="isBunny" class="service">
          <div v-if="userIsBunny" class="service-blocked">
            <i class="fa-solid fa-lock" aria-hidden="true"></i>
            <span>兔女郎当班期间不能点单同事。</span>
          </div>

          <div v-else-if="price !== null" class="service-ticket" :class="{ done: alreadyOrdered }">
            <div class="service-copy">
              <span>包夜服务</span>
              <strong><i class="fa-solid fa-coins" aria-hidden="true"></i> {{ price }}</strong>
            </div>

            <span v-if="alreadyOrdered" class="ordered-tag"><i class="fa-solid fa-check"></i> 已点单</span>
            <template v-else>
              <button v-if="!showConfirm" type="button" class="order-btn" @click="showConfirm = true">点单</button>
              <div v-else class="confirm-group">
                <button type="button" class="confirm-yes" @click="handleOrder">确认</button>
                <button type="button" class="confirm-no" @click="showConfirm = false">取消</button>
              </div>
            </template>
          </div>

          <div v-else class="service-blocked">
            <i class="fa-solid fa-clock" aria-hidden="true"></i>
            <span>包夜价目待定</span>
          </div>

          <Transition name="tip-fade">
            <div v-if="orderTip" class="order-tip" :class="{ fail: orderTip.startsWith('✗') }" role="status">
              {{ orderTip }}
            </div>
          </Transition>
        </section>
      </div>

      <div
        v-show="showScrollRail"
        ref="scrollRail"
        class="profile-scrollbar"
        aria-hidden="true"
        @pointerdown="jumpToRailPosition"
      >
        <span class="profile-scrollbar-thumb" :style="scrollThumbStyle" @pointerdown.stop="beginThumbDrag"></span>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Schema } from '../../../schema';
import { placeholderGradient, portraitList } from '../portraits';
import { hasOrdered, placeOrder, servicePrice, type OrderResult } from '../services';
import { useDataStore } from '../store';

const props = defineProps<{
  name: string;
  girl: Schema['群友'][string];
}>();

const emit = defineEmits<{ back: [] }>();
const store = useDataStore();

const isBunny = computed(() => props.girl.身份.includes('兔女郎'));
const userIsBunny = computed(() => store.data.主角.身份状态 === '兔女郎');
const bodyEntryCount = computed(() => Object.keys(props.girl.身体状态).length);
const roundClass = computed(() => ({
  profit: props.girl.经济状态.本轮盈亏 > 0,
  loss: props.girl.经济状态.本轮盈亏 < 0,
}));

const list = computed(() => portraitList(props.name, props.girl.身份));
const index = ref(0);
watch(list, () => (index.value = 0));
const current = computed(() => list.value[index.value]);

function next() {
  if (list.value.length > 1) index.value = (index.value + 1) % list.value.length;
}

const profileContent = ref<HTMLElement | null>(null);
const scrollRail = ref<HTMLElement | null>(null);
const showScrollRail = ref(false);
const scrollThumbHeight = ref(40);
const scrollThumbOffset = ref(0);
const scrollThumbStyle = computed(() => ({
  height: `${scrollThumbHeight.value}px`,
  transform: `translateY(${scrollThumbOffset.value}px)`,
}));

let scrollResizeObserver: ResizeObserver | null = null;
let scrollMutationObserver: MutationObserver | null = null;
let scrollSyncFrame = 0;
let dragCleanup: (() => void) | null = null;

function syncScrollRail() {
  const content = profileContent.value;
  const rail = scrollRail.value;
  if (!content || !rail) return;

  const maxScroll = Math.max(0, content.scrollHeight - content.clientHeight);
  const wasVisible = showScrollRail.value;
  showScrollRail.value = maxScroll > 2;
  if (!showScrollRail.value) {
    scrollThumbOffset.value = 0;
    return;
  }
  if (!wasVisible) {
    nextTick(syncScrollRail);
    return;
  }

  const railHeight = rail.clientHeight;
  const nextThumbHeight = Math.max(34, Math.round((content.clientHeight / content.scrollHeight) * railHeight));
  const maxThumbTravel = Math.max(0, railHeight - nextThumbHeight);
  scrollThumbHeight.value = nextThumbHeight;
  scrollThumbOffset.value = maxScroll ? Math.round((content.scrollTop / maxScroll) * maxThumbTravel) : 0;
}

function scheduleScrollRailSync() {
  cancelAnimationFrame(scrollSyncFrame);
  scrollSyncFrame = requestAnimationFrame(syncScrollRail);
}

function jumpToRailPosition(event: PointerEvent) {
  const content = profileContent.value;
  const rail = scrollRail.value;
  if (!content || !rail) return;

  const railRect = rail.getBoundingClientRect();
  const maxThumbTravel = Math.max(1, rail.clientHeight - scrollThumbHeight.value);
  const target = Math.min(maxThumbTravel, Math.max(0, event.clientY - railRect.top - scrollThumbHeight.value / 2));
  content.scrollTop = (target / maxThumbTravel) * (content.scrollHeight - content.clientHeight);
}

function beginThumbDrag(event: PointerEvent) {
  const content = profileContent.value;
  const rail = scrollRail.value;
  if (!content || !rail) return;

  event.preventDefault();
  dragCleanup?.();

  const startY = event.clientY;
  const startScrollTop = content.scrollTop;
  const maxScroll = Math.max(0, content.scrollHeight - content.clientHeight);
  const maxThumbTravel = Math.max(1, rail.clientHeight - scrollThumbHeight.value);

  const handleMove = (moveEvent: PointerEvent) => {
    content.scrollTop = startScrollTop + ((moveEvent.clientY - startY) / maxThumbTravel) * maxScroll;
  };
  const handleEnd = () => dragCleanup?.();

  dragCleanup = () => {
    window.removeEventListener('pointermove', handleMove);
    window.removeEventListener('pointerup', handleEnd);
    window.removeEventListener('pointercancel', handleEnd);
    dragCleanup = null;
  };

  window.addEventListener('pointermove', handleMove);
  window.addEventListener('pointerup', handleEnd);
  window.addEventListener('pointercancel', handleEnd);
}

onMounted(() => {
  nextTick(() => {
    const content = profileContent.value;
    if (!content) return;

    scrollResizeObserver = new ResizeObserver(scheduleScrollRailSync);
    scrollResizeObserver.observe(content);

    scrollMutationObserver = new MutationObserver(scheduleScrollRailSync);
    scrollMutationObserver.observe(content, {
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
    });

    scheduleScrollRailSync();
  });
});

onBeforeUnmount(() => {
  cancelAnimationFrame(scrollSyncFrame);
  scrollResizeObserver?.disconnect();
  scrollMutationObserver?.disconnect();
  dragCleanup?.();
});

const price = computed(() => servicePrice(props.name));
const alreadyOrdered = computed(() => hasOrdered(props.name));
const showConfirm = ref(false);
const orderTip = ref('');
let tipTimer = 0;

function handleOrder() {
  const result: OrderResult = placeOrder(props.name);
  showConfirm.value = false;

  if (result.ok) {
    orderTip.value = `✓ 已花费 ${result.cost} 筹码`;
  } else if (result.reason === 'insufficient') {
    orderTip.value = '✗ 筹码不足';
  } else {
    orderTip.value = '✗ 当前无法点单';
  }

  clearTimeout(tipTimer);
  tipTimer = window.setTimeout(() => (orderTip.value = ''), 3500);
}
</script>

<style lang="scss" scoped>
.girl-detail {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.back-btn {
  align-self: flex-start;
  padding: 5px 2px;
  color: var(--c-text-muted);
  font-family: inherit;
  font-size: 12px;
  background: transparent;
  border: 0;
  cursor: pointer;

  i {
    margin-right: 6px;
    color: var(--c-primary);
  }

  &:hover {
    color: var(--c-text);
  }
}

.profile-grid {
  position: relative;
  display: grid;
  grid-template-columns: minmax(180px, 40%) minmax(0, 1fr);
  align-items: start;
  gap: 14px;
}

.portrait-col {
  grid-column: 1;
  min-width: 0;
}

.portrait-wrap {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 2 / 3;
  padding: 0;
  overflow: hidden;
  background: var(--c-surface-alt);
  border: 1px solid var(--c-border);
  border-radius: 11px;

  &.switchable {
    cursor: pointer;

    &:hover {
      border-color: var(--c-primary);
    }
  }
}

.portrait {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;

  &.placeholder {
    display: grid;
    place-items: center;

    i {
      color: rgba(255, 255, 255, 0.34);
      font-size: 48px;
    }
  }
}

.dots {
  position: absolute;
  bottom: 9px;
  left: 50%;
  display: flex;
  gap: 5px;
  padding: 4px 7px;
  background: rgba(14, 9, 17, 0.72);
  border-radius: 999px;
  transform: translateX(-50%);
}

.dot {
  width: 6px;
  aspect-ratio: 1;
  background: rgba(255, 255, 255, 0.35);
  border-radius: 50%;

  &.on {
    background: var(--c-primary);
  }
}

.profile-content {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  box-sizing: border-box;
  width: calc(60% - 14px);
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  padding: 12px 20px 14px 12px;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  background: linear-gradient(90deg, rgba(213, 164, 73, 0.055), transparent 24px), rgba(8, 5, 10, 0.26);
  border: 1px solid rgba(213, 164, 73, 0.18);
  border-radius: 11px;
  box-shadow: inset 3px 0 0 rgba(213, 164, 73, 0.13);
  scrollbar-width: none;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }

  &:focus-visible {
    outline: 2px solid rgba(213, 164, 73, 0.78);
    outline-offset: 2px;
  }

  > * {
    flex-shrink: 0;
  }
}

.profile-scrollbar {
  position: absolute;
  top: 10px;
  right: 5px;
  bottom: 10px;
  z-index: 4;
  width: 9px;
  overflow: hidden;
  touch-action: none;
  background:
    linear-gradient(90deg, transparent 0 3px, rgba(213, 164, 73, 0.3) 3px 5px, transparent 5px), rgba(88, 64, 92, 0.22);
  border: 1px solid rgba(213, 164, 73, 0.24);
  border-radius: 999px;
  box-shadow: 0 0 0 2px rgba(8, 5, 10, 0.3);
  cursor: pointer;
}

.profile-scrollbar-thumb {
  position: absolute;
  top: 0;
  left: 1px;
  display: block;
  width: 5px;
  min-height: 34px;
  touch-action: none;
  background: linear-gradient(180deg, #edc56d, #b47c28);
  border: 1px solid rgba(243, 234, 223, 0.34);
  border-radius: 999px;
  box-shadow:
    0 0 8px rgba(213, 164, 73, 0.32),
    inset 0 1px 0 rgba(255, 255, 255, 0.35);
  cursor: grab;
  will-change: transform;

  &:active {
    cursor: grabbing;
  }
}

.identity {
  position: sticky;
  top: -12px;
  z-index: 2;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin: -12px -1px 0;
  padding: 12px 1px 10px;
  background: linear-gradient(180deg, #140d17 0 76%, rgba(20, 13, 23, 0.96) 88%, rgba(20, 13, 23, 0.72) 100%);
  border-bottom: 1px solid rgba(213, 164, 73, 0.16);
  box-shadow: 0 8px 12px rgba(8, 5, 10, 0.18);

  > div {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  h2 {
    margin: 0;
    overflow: hidden;
    font-family: var(--font-display);
    font-size: 21px;
    letter-spacing: 0.06em;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.badge {
  flex: none;
  padding: 3px 8px;
  color: var(--c-text-muted);
  font-size: 10px;
  background: var(--c-surface-alt);
  border: 1px solid var(--c-border);
  border-radius: 999px;

  &.bunny {
    color: #fff;
    background: var(--c-danger);
    border-color: var(--c-danger);
  }
}

.location {
  flex: none;
  max-width: 42%;
  padding-top: 4px;
  overflow: hidden;
  color: var(--c-text-muted);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;

  i {
    margin-right: 4px;
    color: var(--c-primary);
  }
}

.action-lead {
  display: grid;
  grid-template-columns: 30px 1fr;
  align-items: start;
  gap: 9px;
  padding: 11px;
  background: rgba(213, 164, 73, 0.08);
  border-left: 3px solid var(--c-primary);
  border-radius: 0 8px 8px 0;

  > i {
    display: grid;
    width: 30px;
    aspect-ratio: 1;
    place-items: center;
    color: var(--c-primary);
    background: rgba(213, 164, 73, 0.1);
    border-radius: 50%;
  }

  p {
    margin: 2px 0 0;
    font-size: 13px;
    line-height: 1.55;
  }
}

.snapshot-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.snapshot {
  min-width: 0;
  padding: 9px 10px;
  background: var(--c-surface-alt);
  border: 1px solid var(--c-border);
  border-radius: 8px;

  h3 {
    margin: 0 0 5px;
    color: var(--c-text-muted);
    font-size: 11px;
    font-weight: 500;

    i {
      margin-right: 5px;
      color: var(--c-primary);
    }
  }

  p {
    margin: 0;
    font-size: 12px;
    line-height: 1.5;
  }

  &.thought p {
    color: var(--c-text-muted);
    font-style: italic;
  }
}

.body-register {
  overflow: hidden;
  border: 1px solid var(--c-border);
  border-radius: 8px;

  &[open] {
    .chevron {
      transform: rotate(180deg);
    }
  }

  summary {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 38px;
    padding: 0 10px;
    color: var(--c-text);
    font-size: 12px;
    list-style: none;
    cursor: pointer;

    &::-webkit-details-marker {
      display: none;
    }

    > span:first-child {
      flex: 1;
      font-weight: 700;

      i {
        margin-right: 6px;
        color: var(--c-primary);
      }
    }
  }

  dl {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 0;
    padding: 0 10px 10px;
  }

  dl > div {
    display: grid;
    grid-template-columns: minmax(46px, auto) 1fr;
    gap: 9px;
    padding-top: 7px;
    border-top: 1px solid rgba(88, 64, 92, 0.65);
  }

  dt {
    color: var(--c-primary);
    font-size: 11px;
    font-weight: 700;
  }

  dd {
    margin: 0;
    font-size: 12px;
    line-height: 1.45;
  }
}

.summary-meta {
  color: var(--c-text-muted);
  font-size: 10px;
}

.chevron {
  color: var(--c-text-muted);
  font-size: 9px;
  transition: transform 150ms ease;
}

.ledger {
  overflow: hidden;
  background: rgba(255, 255, 255, 0.018);
  border: 1px solid var(--c-border);
  border-radius: 8px;

  > header {
    padding: 8px 10px 0;
  }

  h3 {
    margin: 0;
    font-family: var(--font-display);
    font-size: 13px;
    letter-spacing: 0.06em;

    i {
      margin-right: 6px;
      color: var(--c-primary);
      font-size: 11px;
    }
  }
}

.ledger-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;

  > div {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    padding: 8px 10px 10px;

    & + div {
      border-left: 1px solid var(--c-border);
    }
  }

  span {
    color: var(--c-text-muted);
    font-size: 11px;
  }

  strong {
    font-size: 14px;
    font-variant-numeric: tabular-nums;

    &.profit {
      color: var(--c-success);
    }

    &.loss {
      color: var(--c-danger);
    }
  }
}

.redeem {
  padding: 9px 10px 11px;
}

.redeem-copy {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 7px;

  span {
    color: var(--c-text-muted);
    font-size: 11px;
  }

  strong {
    color: var(--c-danger);
    font-size: 12px;
  }
}

.redeem-pips {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 3px;

  span {
    height: 7px;
    background: rgba(255, 255, 255, 0.07);
    border-radius: 2px;

    &.filled {
      background: var(--c-danger);
    }
  }
}

.service {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.service-ticket,
.service-blocked {
  display: flex;
  align-items: center;
  min-height: 48px;
  padding: 8px 10px;
  background: rgba(214, 87, 114, 0.07);
  border: 1px solid rgba(214, 87, 114, 0.32);
  border-radius: 8px;
}

.service-ticket {
  gap: 10px;

  &.done {
    opacity: 0.72;
  }
}

.service-copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;

  span {
    color: var(--c-text-muted);
    font-size: 11px;
  }

  strong {
    color: var(--c-primary);
    font-size: 14px;

    i {
      margin-right: 4px;
      font-size: 10px;
    }
  }
}

.service-blocked {
  gap: 8px;
  color: var(--c-text-muted);
  font-size: 12px;

  i {
    color: var(--c-danger);
  }
}

.order-btn,
.confirm-yes,
.confirm-no {
  min-height: 31px;
  padding: 5px 13px;
  font-family: inherit;
  font-size: 11px;
  font-weight: 700;
  border-radius: 6px;
  cursor: pointer;
}

.order-btn,
.confirm-yes {
  color: var(--c-ink);
  background: var(--c-primary);
  border: 1px solid var(--c-primary);
}

.confirm-no {
  color: var(--c-text-muted);
  background: transparent;
  border: 1px solid var(--c-border);
}

.confirm-group {
  display: flex;
  gap: 5px;
}

.ordered-tag {
  color: var(--c-success);
  font-size: 11px;

  i {
    margin-right: 4px;
  }
}

.order-tip {
  padding: 7px 9px;
  color: var(--c-success);
  font-size: 11px;
  background: rgba(99, 198, 159, 0.1);
  border-radius: 6px;

  &.fail {
    color: var(--c-danger);
    background: rgba(214, 87, 114, 0.1);
  }
}

.tip-fade-enter-active,
.tip-fade-leave-active {
  transition:
    opacity 150ms ease,
    transform 150ms ease;
}

.tip-fade-enter-from,
.tip-fade-leave-to {
  opacity: 0;
  transform: translateY(-3px);
}

@media (max-width: 470px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }

  .portrait-col {
    display: flex;
    justify-content: center;
  }

  .portrait-wrap {
    width: min(58%, 210px);
  }

  .profile-content {
    position: static;
    width: 100%;
    max-height: none;
    padding: 12px;
    overflow: visible;
  }

  .profile-scrollbar {
    display: none;
  }

  .identity {
    position: static;
    margin: -12px -1px 0;
    box-shadow: none;
  }

  .snapshot-grid {
    grid-template-columns: 1fr;
  }
}
</style>
