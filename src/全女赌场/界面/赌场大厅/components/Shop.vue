<template>
  <div class="shop">
    <div v-if="toast" class="toast" :class="toastClass">{{ toast }}</div>

    <div v-if="wallet.isBunny.value" class="bunny-notice">
      <i class="fa-solid fa-triangle-exclamation"></i>
      <span>你现在是兔女郎身份，老板娘不许你从商店买东西——店里的货都得自己挣。</span>
    </div>

    <div class="goods-list">
      <div v-for="item in GOODS" :key="item.name" class="goods-row" :class="{ locked: wallet.isBunny.value }">
        <div class="goods-icon"><i :class="item.icon"></i></div>
        <div class="goods-info">
          <span class="goods-name">{{ item.name }}</span>
          <span class="goods-desc">{{ item.description }}</span>
        </div>
        <button
          class="buy-btn"
          :disabled="wallet.isBunny.value || item.price > wallet.chips.value"
          :title="wallet.isBunny.value ? '下海期间禁购物' : ''"
          @click="buy(item)"
        >
          <i class="fa-solid fa-coins"></i> {{ item.price.toLocaleString() }}
        </button>
      </div>
    </div>

    <p class="hint">购买后物品会写入持有物品，在剧情中告诉她们你想怎么用。</p>
  </div>
</template>

<script setup lang="ts">
import { GOODS, type Goods } from '../../../goods';
import { useWallet } from '../wallet';

const wallet = useWallet();
const toast = ref('');
const toastClass = ref('');
let toastTimer = 0;

function buy(item: Goods) {
  if (wallet.isBunny.value) {
    showToast('下海期间不可购物～', 'fail');
    return;
  }
  if (wallet.purchase(item.name, item.price)) {
    showToast(`已购入「${item.name}」`, 'ok');
    wallet.pushEvent(`商店：花费${item.price}token 购入「${item.name}」`);
  } else {
    showToast('token 不足', 'fail');
  }
}

function showToast(text: string, cls: string) {
  toast.value = text;
  toastClass.value = cls;
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => (toast.value = ''), 2000);
}
</script>

<style lang="scss" scoped>
.shop {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast {
  text-align: center;
  font-weight: bold;
  padding: 4px;
  border-radius: 6px;

  &.ok {
    color: var(--c-success);
  }

  &.fail {
    color: var(--c-danger);
  }
}

.goods-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bunny-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(220, 53, 69, 0.08);
  border: 1px solid rgba(220, 53, 69, 0.35);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  color: var(--c-danger);

  i {
    flex-shrink: 0;
    font-size: 13px;
  }
}

.goods-row {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 8px;
  padding: 8px 10px;

  &.locked {
    opacity: 0.55;
    filter: grayscale(0.3);
  }
}

.goods-icon {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--c-surface-alt);
  border: 1px solid var(--c-border);
  border-radius: 8px;

  i {
    color: var(--c-primary);
    font-size: 15px;
  }
}

.goods-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.goods-name {
  font-weight: bold;
}

.goods-desc {
  font-size: 11px;
  color: var(--c-text-muted);
}

.buy-btn {
  background: var(--btn-gold);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 2px 4px rgba(0, 0, 0, 0.35);
  border: none;
  border-radius: 6px;
  color: #1a1224;
  font-weight: bold;
  padding: 6px 12px;
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  white-space: nowrap;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.hint {
  margin: 0;
  font-size: 11px;
  color: var(--c-text-muted);
}
</style>
