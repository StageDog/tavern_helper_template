<template>
  <main class="status-shell">
    <header class="masthead">
      <div class="brand">
        <span class="brand-mark" aria-hidden="true"><i class="fa-solid fa-spade"></i></span>
        <span class="brand-copy">
          <strong>兔窟账房</strong>
          <span>THE RABBIT PIT</span>
        </span>
      </div>

      <div class="location" :title="`当前位置：${store.data.赌场.当前位置}`">
        <i class="fa-solid fa-location-dot" aria-hidden="true"></i>
        <span>{{ store.data.赌场.当前位置 }}</span>
      </div>
    </header>

    <nav class="tab-nav" role="tablist" aria-label="状态栏视图">
      <button
        type="button"
        role="tab"
        :aria-selected="activeTab === 'economy'"
        :class="{ active: activeTab === 'economy' }"
        @click="activeTab = 'economy'"
      >
        <i class="fa-solid fa-coins" aria-hidden="true"></i>
        <span>账房</span>
      </button>
      <button
        type="button"
        role="tab"
        :aria-selected="activeTab === 'girls'"
        :class="{ active: activeTab === 'girls' }"
        @click="activeTab = 'girls'"
      >
        <i class="fa-solid fa-address-book" aria-hidden="true"></i>
        <span>名册</span>
        <span v-if="girlCount" class="tab-count">{{ girlCount }}</span>
      </button>
    </nav>

    <Transition name="view-shift" mode="out-in">
      <EconomyCard v-if="activeTab === 'economy'" />
      <GirlsPanel v-else />
    </Transition>
  </main>
</template>

<script setup lang="ts">
import { useDataStore } from './store';
import EconomyCard from './components/EconomyCard.vue';
import GirlsPanel from './components/GirlsPanel.vue';

const store = useDataStore();
const activeTab = useLocalStorage<'economy' | 'girls'>('casino_status:tab', 'economy');
const girlCount = computed(() => Object.keys(store.data.群友).length);
</script>

<style lang="scss" scoped>
.status-shell {
  --c-surface: #160f1b;
  --c-surface-alt: #26172a;
  --c-surface-raised: #302035;
  --c-border: #58405c;
  --c-border-soft: rgba(213, 164, 73, 0.2);
  --c-text: #f3eadf;
  --c-text-muted: #b7a5b7;
  --c-primary: #d5a449;
  --c-danger: #d65772;
  --c-success: #63c69f;
  --c-ink: #1a121c;
  --font-display: 'STSong', 'Songti SC', 'Noto Serif SC', Georgia, serif;

  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-sizing: border-box;
  width: min(100%, 640px);
  margin: 0 auto;
  padding: 14px;
  overflow: hidden;
  color: var(--c-text);
  font-size: 14px;
  background:
    linear-gradient(115deg, transparent 0 48%, rgba(213, 164, 73, 0.025) 48% 52%, transparent 52%) 0 0 / 18px 18px,
    radial-gradient(circle at 86% 0, rgba(214, 87, 114, 0.1), transparent 34%),
    var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 16px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 14px 38px rgba(6, 3, 8, 0.38);
}

.masthead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-width: 0;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.brand-mark {
  display: grid;
  flex: 0 0 35px;
  width: 35px;
  aspect-ratio: 1;
  place-items: center;
  color: var(--c-ink);
  background: var(--c-primary);
  border: 3px double var(--c-ink);
  border-radius: 50%;
  box-shadow: 0 0 0 1px var(--c-primary);
}

.brand-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;

  strong {
    overflow: hidden;
    font-family: var(--font-display);
    font-size: 17px;
    line-height: 1.05;
    letter-spacing: 0.1em;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    margin-top: 4px;
    color: var(--c-text-muted);
    font-family: Georgia, serif;
    font-size: 8px;
    letter-spacing: 0.22em;
  }
}

.location {
  display: flex;
  align-items: center;
  min-width: 0;
  padding: 6px 10px;
  color: var(--c-text-muted);
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid var(--c-border);
  border-radius: 999px;

  i {
    flex: none;
    margin-right: 6px;
    color: var(--c-primary);
    font-size: 11px;
  }

  span {
    overflow: hidden;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.tab-nav {
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 3px;
  background: rgba(5, 3, 7, 0.35);
  border: 1px solid var(--c-border-soft);
  border-radius: 10px;

  button {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 36px;
    padding: 6px 14px;
    color: var(--c-text-muted);
    font-family: inherit;
    font-size: 13px;
    font-weight: 700;
    background: transparent;
    border: 0;
    border-radius: 7px;
    cursor: pointer;
    transition:
      color 160ms ease,
      background 160ms ease,
      box-shadow 160ms ease;

    &:hover {
      color: var(--c-text);
    }

    &.active {
      color: var(--c-ink);
      background: var(--c-primary);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.45),
        0 2px 8px rgba(0, 0, 0, 0.3);
    }
  }
}

.tab-count {
  min-width: 17px;
  padding: 1px 5px;
  font-size: 10px;
  line-height: 15px;
  color: currentColor;
  background: rgba(22, 15, 27, 0.14);
  border-radius: 999px;
}

.view-shift-enter-active,
.view-shift-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.view-shift-enter-from {
  opacity: 0;
  transform: translateY(5px);
}

.view-shift-leave-to {
  opacity: 0;
  transform: translateY(-3px);
}

@media (max-width: 420px) {
  .status-shell {
    padding: 11px;
    border-radius: 13px;
  }

  .location {
    max-width: 42%;
  }
}
</style>
