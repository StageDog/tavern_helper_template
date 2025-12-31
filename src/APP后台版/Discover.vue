<template>
  <div class="app-view active">
    <div class="app-header">
      <div class="title">
        <span>?? 发现</span>
        <button class="import-btn" @click="triggerImport">导入JSON</button>
      </div>
    </div>

    <div class="app-content">
      <div class="shop-list">
        <div v-if="shops.length === 0" class="empty-state">
          <i class="fas fa-search"></i>
          <p>暂无发现，请先让AI生成内容</p>
        </div>
        <div v-else class="shop-list-items">
          <div
            v-for="(shop, idx) in shops"
            :key="shop.id || shop.shop_id || idx"
            class="shop-card"
            @click="$router.push(`/shop/${shop.id || shop.shop_id || idx}`)"
          >
            <div class="avatar-text">
              <i
                v-if="(shop.packages || []).find((p: any) => p.icon)"
                :class="(shop.packages || []).find((p: any) => p.icon).icon"
              ></i>
              <i v-else class="fas fa-store"></i>
            </div>
            <div class="info">
              <div class="name">{{ shop.shopname || shop.name || '未命名店铺' }}</div>
              <div class="desc">
                <span class="slogan-text">{{ (shop.shoptags || []).join(' / ') || '优质服务' }}</span>
                <span v-if="shop.packages && shop.packages.length > 0" class="package-count">
                  <i class="fas fa-layer-group"></i>
                  {{ shop.packages.length }} 个套餐
                </span>
              </div>
            </div>
            <button class="delete-btn" @click.stop="deleteShop(idx)">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
  <input ref="fileInput" class="hidden-input" type="file" accept=".json,application/json" @change="handleFileChange" />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { shopStoreMvu } from './shared/shopStoreMvu';

const shops = ref<any[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);
const MAX_IMPORT_ITEMS = 200;
const MAX_IMPORT_SIZE_MB = 5;

async function loadShops() {
  const data = await shopStoreMvu.getShops();
  shops.value = Array.isArray(data) ? data : [];
}

const onShopCacheUpdated = () => {
  void loadShops();
};

// 初始化
onMounted(async () => {
  await loadShops();
  window.addEventListener('shop:cache:updated', onShopCacheUpdated);
});

onUnmounted(() => {
  window.removeEventListener('shop:cache:updated', onShopCacheUpdated);
});

function deleteShop(idx: number) {
  // 只影响本地视图，不写回 MVU
  shops.value = shops.value.filter((_, i) => i !== idx);
  console.log('[Discover] 已删除店铺(仅本地视图)', idx);
}

function triggerImport() {
  fileInput.value?.click();
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = input.files;
  if (!files || files.length === 0) return;
  const file = files[0];
  if (file.size > MAX_IMPORT_SIZE_MB * 1024 * 1024) {
    toastr.error(`文件过大（>${MAX_IMPORT_SIZE_MB}MB）`, '导入失败');
    input.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const text = String(reader.result || '');
      const parsed = JSON.parse(text);
      const list = Array.isArray(parsed) ? parsed : parsed?.店铺列表 || parsed?.shops || [];
      const safeList = Array.isArray(list) ? list.slice(0, MAX_IMPORT_ITEMS) : [];
      shops.value = safeList;
      toastr.success(`导入成功，${safeList.length} 条店铺`, '导入完成');
    } catch (err: any) {
      toastr.error(err?.message || '解析失败', '导入失败');
    } finally {
      input.value = '';
    }
  };
  reader.readAsText(file, 'utf-8');
}
</script>

<style lang="scss" scoped>
.app-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
  /* position: absolute; */
  /* top: 0; */
  /* left: 0; */
  transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: flex;
  flex-direction: column;
}

.app-header {
  background: linear-gradient(135deg, var(--bg-header) 0, var(--bg-header-light) 100%);
  padding: 35px 16px 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--border-color), transparent);
  }

  .title {
    font-size: 1.3rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 12px;
    color: var(--text-primary);

    .import-btn {
      border: none;
      background: linear-gradient(135deg, var(--accent-primary), var(--accent-dark));
      color: #fff;
      padding: 8px 14px;
      border-radius: 10px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(255, 195, 0, 0.3);
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-2px);
      }
    }
  }
}

.app-content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 16px;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.shop-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.shop-list-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.shop-card {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.25s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
  }

  .avatar-text {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background: linear-gradient(135deg, rgba(255, 195, 0, 0.12), rgba(255, 215, 64, 0.18));
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);

    i {
      font-size: 1.4rem;
      color: var(--accent-primary);
      text-shadow:
        0 2px 8px rgba(255, 195, 0, 0.5),
        0 0 12px rgba(255, 215, 64, 0.4);
      filter: drop-shadow(0 2px 4px rgba(255, 195, 0, 0.5));
      transition: all 0.3s ease;
    }
  }

  .info {
    flex-grow: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .name {
    font-weight: 700;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 1.15rem;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }

  .desc {
    font-size: 0.9rem;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    line-height: 1.5;
    font-weight: 400;

    .slogan-text {
      flex: 1;
      min-width: 100px;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .package-count {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      background: linear-gradient(135deg, var(--accent-primary), var(--accent-light));
      color: rgba(255, 255, 255, 0.95);
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(255, 195, 0, 0.3);
      transition: all 0.3s ease;

      i {
        font-size: 0.7rem;
        opacity: 0.9;
      }
    }
  }
}

.nav-bar {
  display: flex;
  border-top: 1px solid var(--border-accent);
  background: linear-gradient(135deg, var(--bg-header) 0%, var(--bg-header-light) 100%);
  padding: 8px 12px;
  padding-bottom: max(8px, env(safe-area-inset-bottom));
  flex-shrink: 0;
  -webkit-backdrop-filter: blur(15px);
  backdrop-filter: blur(15px);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--border-accent), transparent);
  }

  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: var(--text-secondary);
    font-size: 0.8rem;
    padding: 6px 4px;
    cursor: pointer;
    transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;
    border-radius: 12px;
    margin: 0 2px;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 100%;
      background: linear-gradient(135deg, rgba(255, 195, 0, 0.15), rgba(255, 215, 64, 0.1));
      border-radius: 12px;
      transition: all 0.3s ease;
      z-index: 0;
    }

    &.active {
      color: var(--text-primary);
      transform: translateY(-2px);

      &::before {
        width: 100%;
      }

      i {
        color: var(--accent-primary);
        transform: scale(1.2) translateY(-3px);
        filter: drop-shadow(0 2px 6px rgba(255, 195, 0, 0.4));
      }

      span {
        font-weight: 700;
        color: var(--accent-primary);
      }
    }

    &:hover:not(.active) {
      color: var(--text-primary);
      transform: translateY(-1px);

      &::before {
        width: 60%;
      }
    }

    i {
      font-size: 1.4rem;
      margin-bottom: 2px;
      transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative;
      z-index: 1;
    }

    span {
      font-size: 0.7rem;
      font-weight: 600;
      transition: all 0.3s ease;
      position: relative;
      z-index: 1;
      letter-spacing: 0.5px;
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-secondary);
  text-align: center;

  i {
    font-size: 3rem;
    margin-bottom: 16px;
    opacity: 0.3;
  }

  p {
    margin: 0;
    font-size: 0.95rem;
    opacity: 0.8;
  }
}

.hidden-input {
  display: none;
}
</style>
