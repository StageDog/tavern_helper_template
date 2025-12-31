<template>
  <div class="app-view active">
    <!-- 页面头部 -->
    <div class="app-header">
      <div class="title">
        <i class="fas fa-concierge-bell"></i>
        <span>服务状态</span>
      </div>
      <button v-if="girlsData.length > 0" class="refresh-btn" @click="refreshData">
        <i class="fas fa-sync-alt" :class="{ 'fa-spin': isRefreshing }"></i>
      </button>
    </div>

    <div class="app-content">
      <!-- 空状态 -->
      <div v-if="girlsData.length === 0 && !isLoading" class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>{{ errorMessage || '暂无服务中的订单' }}</p>
        <button class="retry-btn" @click="refreshData">
          <i class="fas fa-redo"></i>
          重试
        </button>
      </div>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>正在加载服务数据...</p>
      </div>

      <!-- 标签页（仅多订单时显示） -->
      <div v-if="girlsData.length > 1" class="tabs-container">
        <div
          v-for="(girl, index) in girlsData"
          :key="index"
          :class="['tab-item', { active: currentGirlIndex === index }]"
          @click="currentGirlIndex = index"
        >
          {{ getGirlName(girl) }}
        </div>
      </div>

      <!-- 当前女孩的核心状态卡片 -->
      <div v-if="currentGirl" class="status-card">
        <!-- 基本信息和状态 -->
        <div class="status-header">
          <div class="basic-info">
            <h2 class="girl-name">{{ basicInfo.name }}</h2>
            <div class="sub-info">
              <span class="identity">{{ basicInfo.identity }}</span>
              <span class="dot">·</span>
              <span class="age">{{ basicInfo.age }}岁</span>
            </div>
          </div>
          <div class="badges">
            <span class="badge badge-hot">HOT</span>
            <span v-if="packageInfo.type" class="badge badge-type">{{ packageInfo.type }}</span>
          </div>
        </div>

        <!-- 订单状态指示器 -->
        <div class="order-status-row">
          <div class="status-item">
            <i class="fas fa-heart status-icon" :class="orderStatusClass"></i>
            <span class="status-text">{{ orderStatus }}</span>
          </div>
          <div class="status-item">
            <i class="fas fa-heartbeat status-icon" :class="heartbeatStatusClass"></i>
            <span class="status-text">{{ heartbeatDisplay }}</span>
          </div>
        </div>

        <!-- 星级评分 -->
        <div class="rating-section">
          <div class="stars">
            <i v-for="n in 5" :key="n" :class="['fas fa-star', n <= starRating ? 'star active' : 'star']"></i>
          </div>
          <span class="affection-score">{{ affectionDisplay }}/100</span>
        </div>

        <!-- 价格信息 -->
        <div class="price-section">
          <div class="price-label">套餐价格</div>
          <div class="price-value">¥{{ packageInfo.price }}</div>
          <div class="package-name">{{ packageInfo.name }}</div>
          <div v-if="packageInfo.features && packageInfo.features.length > 0" class="features-tags">
            <span v-for="feature in packageInfo.features" :key="feature" class="feature-tag">{{ feature }}</span>
          </div>
        </div>

        <!-- 关键指标网格 -->
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-label">心跳</div>
            <div class="metric-value" :style="{ color: heartbeatColor }">
              {{ heartbeatDisplay }}
              <span v-if="heartbeatDisplay !== '-'" class="metric-unit">bpm</span>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-label">服务进度</div>
            <div class="metric-value">{{ serviceProgress }}<span v-if="serviceProgress !== '-'">%</span></div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: serviceProgressBarWidth, background: progressColor }"></div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-label">服务次数</div>
            <div class="metric-value">{{ serviceCount }}<span class="metric-unit">次</span></div>
          </div>
          <div class="metric-card">
            <div class="metric-label">好感度</div>
            <div class="metric-value">{{ affectionDisplay }}<span class="metric-unit">/100</span></div>
          </div>
        </div>
      </div>

      <!-- 详情折叠面板 -->
      <div v-if="currentGirl" class="detail-section">
        <div class="detail-card accordion">
          <div class="accordion-header" :class="{ active: showDetails }" @click="showDetails = !showDetails">
            <span>
              <i class="fas fa-info-circle accordion-icon"></i>
              详细信息
            </span>
            <i class="fas fa-chevron-down accordion-arrow" :class="{ active: showDetails }"></i>
          </div>
          <div class="accordion-content" :class="{ show: showDetails }">
            <div class="accordion-body">
              <!-- 着装信息 -->
              <div class="detail-group">
                <h4 class="group-title">
                  <i class="fas fa-user-tie"></i>
                  着装信息
                </h4>
                <div v-if="hasValidClothing" class="clothing-grid">
                  <div v-for="(value, key) in displayClothing" :key="key" class="clothing-item">
                    <i :class="['clothing-icon', clothingIcon(String(key))]"></i>
                    <span class="clothing-key">{{ key }}</span>
                    <span class="clothing-value">{{ value }}</span>
                  </div>
                </div>
                <div v-else class="empty-text">暂无着装信息</div>
              </div>

              <!-- 心理状态信息（可折叠） -->
              <div class="detail-group collapsible-group">
                <div class="collapsible-header" @click="showPsychology = !showPsychology">
                  <h4 class="group-title">
                    <i class="fas fa-heart"></i>
                    心理状态
                  </h4>
                  <i :class="['fas fa-chevron-down accordion-arrow', { active: showPsychology }]"></i>
                </div>
                <div v-show="showPsychology" class="collapsible-content">
                  <div class="psychology-content">
                    <div class="psychology-item">
                      <div class="psychology-label">
                        <i class="fas fa-brain"></i>
                        当前所想
                      </div>
                      <div class="psychology-text">
                        {{ getNestedValue(currentGirl, '心理状态.当前所想', '-') }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 身体特征信息（可折叠） -->
              <div class="detail-group collapsible-group">
                <div class="collapsible-header" @click="showBody = !showBody">
                  <h4 class="group-title">
                    <i class="fas fa-female"></i>
                    身体特征
                  </h4>
                  <i :class="['fas fa-chevron-down accordion-arrow', { active: showBody }]"></i>
                </div>
                <div v-show="showBody" class="collapsible-content">
                  <div class="body-feature-grid">
                    <div class="feature-row">
                      <div class="feature-item">
                        <div class="feature-icon">
                          <i class="fas fa-tshirt"></i>
                        </div>
                        <div class="feature-content">
                          <div class="feature-label">罩杯</div>
                          <div class="feature-value">{{ getNestedValue(currentGirl, '身体特征.三围.罩杯', '-') }}</div>
                        </div>
                      </div>
                      <div class="feature-item">
                        <div class="feature-icon">
                          <i class="fas fa-circle"></i>
                        </div>
                        <div class="feature-content">
                          <div class="feature-label">乳形</div>
                          <div class="feature-value">{{ getNestedValue(currentGirl, '身体特征.乳房.形状', '-') }}</div>
                        </div>
                      </div>
                    </div>
                    <div class="feature-description">
                      <div class="desc-item">
                        <div class="desc-label">
                          <i class="fas fa-star"></i>
                          乳房
                        </div>
                        <div class="desc-text">{{ getNestedValue(currentGirl, '身体特征.胸部', '-') }}</div>
                      </div>
                      <div class="desc-item">
                        <div class="desc-label">
                          <i class="fas fa-leaf"></i>
                          小穴
                        </div>
                        <div class="desc-text">{{ getNestedValue(currentGirl, '身体特征.私处', '-') }}</div>
                      </div>
                      <div class="desc-item">
                        <div class="desc-label">
                          <i class="fas fa-running"></i>
                          姿势
                        </div>
                        <div class="desc-text">{{ getNestedValue(currentGirl, '身体特征.姿势', '-') }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 性经验与服务统计（可折叠） -->
              <div class="detail-group collapsible-group">
                <div class="collapsible-header" @click="showExperience = !showExperience">
                  <h4 class="group-title">
                    <i class="fas fa-chart-bar"></i>
                    性经验与服务统计
                  </h4>
                  <i :class="['fas fa-chevron-down accordion-arrow', { active: showExperience }]"></i>
                </div>
                <div v-show="showExperience" class="collapsible-content">
                  <div class="experience-stats">
                    <div class="stats-section">
                      <div class="section-title">
                        <i class="fas fa-heart"></i>
                        性档案
                      </div>
                      <div class="stats-grid">
                        <div class="stat-item">
                          <div class="stat-icon">
                            <i class="fas fa-seedling"></i>
                          </div>
                          <div class="stat-content">
                            <div class="stat-label">处女</div>
                            <div class="stat-value">{{ getNestedValue(currentGirl, '性经验.处女', '-') }}</div>
                          </div>
                        </div>
                        <div class="stat-item">
                          <div class="stat-icon">
                            <i class="fas fa-users"></i>
                          </div>
                          <div class="stat-content">
                            <div class="stat-label">上过</div>
                            <div class="stat-value">{{ getNestedValue(currentGirl, '性经验.性伴侣数量', '-') }}</div>
                          </div>
                        </div>
                        <div class="stat-item">
                          <div class="stat-icon">
                            <i class="fas fa-handshake"></i>
                          </div>
                          <div class="stat-content">
                            <div class="stat-label">开苞</div>
                            <div class="stat-value">
                              {{ getNestedValue(currentGirl, '性经验.初次性行为对象', '-') }}
                            </div>
                          </div>
                        </div>
                        <div class="stat-item">
                          <div class="stat-icon">
                            <i class="fas fa-baby"></i>
                          </div>
                          <div class="stat-content">
                            <div class="stat-label">孕率</div>
                            <div class="stat-value">{{ getNestedValue(currentGirl, '性经验.怀孕几率', '-') }}</div>
                          </div>
                        </div>
                        <div class="stat-item">
                          <div class="stat-icon">
                            <i class="fas fa-shopping-cart"></i>
                          </div>
                          <div class="stat-content">
                            <div class="stat-label">点过</div>
                            <div class="stat-value">{{ getNestedValue(currentGirl, '性经验.下单次数', 0) }}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="stats-section">
                      <div class="section-title">
                        <i class="fas fa-chart-line"></i>
                        本次服务统计
                      </div>
                      <div class="stats-grid">
                        <div class="stat-item">
                          <div class="stat-icon">
                            <i class="fas fa-heartbeat"></i>
                          </div>
                          <div class="stat-content">
                            <div class="stat-label">日穴</div>
                            <div class="stat-value">
                              {{ getNestedValue(currentGirl, '服务统计.本次服务性交次数', '-') }}
                            </div>
                          </div>
                        </div>
                        <div class="stat-item">
                          <div class="stat-icon">
                            <i class="fas fa-tint"></i>
                          </div>
                          <div class="stat-content">
                            <div class="stat-label">内射</div>
                            <div class="stat-value">{{ getNestedValue(currentGirl, '服务统计.内射次数', '-') }}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, onActivated, onMounted, ref, watch } from 'vue';
import { filterActiveOrders, loadOrdersFromMVU, readCachedOrders } from './shared/serviceOrders';
import { getNestedValue } from './utils';
// 响应式数据
const girlsData = ref<any[]>([]);
const currentGirlIndex = ref(0);
const showDetails = ref(true);
const isLoading = ref(false);
const isRefreshing = ref(false);
const errorMessage = ref('');

// 可折叠分组状态
const showPsychology = ref(false);
const showBody = ref(false);
const showExperience = ref(false);

// 监听女孩切换，重置折叠状态
watch(currentGirlIndex, () => {
  showDetails.value = true;
  showPsychology.value = false;
  showBody.value = false;
  showExperience.value = false;
});

// 当前选中的女孩数据
const currentGirl = computed(() => girlsData.value[currentGirlIndex.value] || null);

// ================ 数据工具函数 ================

/**
 * 获取女孩姓名
 */
function getGirlName(girl: any) {
  return getNestedValue(girl, '基础信息.姓名') || `女孩 ${girlsData.value.indexOf(girl) + 1}`;
}

/**
 * 刷新数据
 */
async function refreshData() {
  isRefreshing.value = true;
  errorMessage.value = '';

  try {
    const orders = await loadOrdersFromMVU();
    const active = filterActiveOrders(orders);
    girlsData.value = active;

    if (active.length === 0) {
      errorMessage.value = '未找到服务中的订单';
      console.log('[服务状态] 暂无服务数据');
    } else {
      toastr.success(`加载了 ${active.length} 位女孩的服务数据`, '服务状态');
    }
  } catch (error: any) {
    console.error('[Service] 刷新数据失败，尝试使用缓存:', error);

    // 降级：脚本变量缓存
    const cached = readCachedOrders();
    const active = filterActiveOrders(cached);
    if (cached.length > 0) {
      girlsData.value = active;
      toastr.info(`使用缓存数据，条目数 ${active.length}`, '服务状态');
      errorMessage.value = '已回退到上次缓存的数据，请重新生成或刷新。';
    } else {
      errorMessage.value = error.message || '数据加载失败';
      console.log('[服务状态] 数据加载失败，请重试');
      girlsData.value = [];
    }
  } finally {
    isRefreshing.value = false;
  }
}

// ================ 计算属性 ================

// 基础信息
const basicInfo = computed(() => ({
  name: getNestedValue(currentGirl.value, '基础信息.姓名', '未知'),
  identity: getNestedValue(currentGirl.value, '基础信息.身份', '未知'),
  age: getNestedValue(currentGirl.value, '基础信息.年龄', 0),
}));

// 套餐信息
const packageInfo = computed(() => ({
  name: getNestedValue(currentGirl.value, '套餐.套餐名称', '未命名套餐'),
  price: getNestedValue(currentGirl.value, '套餐.套餐价格', '0'),
  type: getNestedValue(currentGirl.value, '套餐.商品类型', ''),
  features: getNestedValue(currentGirl.value, '套餐.玩法特色', []),
}));

// 订单状态（添加映射）
const orderStatus = computed(() => {
  const status =
    currentGirl.value?.status ||
    getNestedValue(currentGirl.value, '订单状态', '') ||
    getNestedValue(currentGirl.value, '服务统计.订单状态', '未知');
  if (String(status).includes('服务中')) return '服务中';
  if (String(status).includes('服务结束')) return '服务结束';
  // 其他状态直接展示，并提示需要人工处理
  return `${status || '未知'}（订单状态变量更新错误，请你手动命令AI结束本次服务）`;
});
const orderStatusClass = computed(() => {
  const status = orderStatus.value;
  if (status.includes('服务中')) return 'status-active';
  if (status.includes('服务结束')) return 'status-completed';
  return 'status-pending';
});

// 心跳
const heartbeatDisplay = computed(() => getNestedValue(currentGirl.value, '服务统计.心跳', '-'));
const heartbeatStatusClass = computed(() => {
  const value = parseFloat(String(heartbeatDisplay.value));
  if (isNaN(value)) return 'status-normal';
  if (value < 60) return 'status-warning';
  if (value > 100) return 'status-danger';
  return 'status-normal';
});
const heartbeatColor = computed(() => {
  switch (heartbeatStatusClass.value) {
    case 'status-warning':
      return 'var(--status-warning)';
    case 'status-danger':
      return 'var(--status-danger)';
    default:
      return 'var(--status-success)';
  }
});

// 星级评分
const starRating = computed(() => {
  const rating = Math.floor((affectionDisplay.value / 100) * 5);
  return Math.min(5, Math.max(0, rating));
});

// 好感度
const affectionDisplay = computed(() => {
  const value = getNestedValue(currentGirl.value, '心理状态.好感度', 0);
  return typeof value === 'number' ? value : parseFloat(value) || 0;
});

// 服务进度
const serviceProgress = computed(() => {
  const count = getNestedValue(currentGirl.value, '服务统计.本次服务性交次数', 0);
  const num = typeof count === 'number' ? count : parseFloat(String(count));

  if (isNaN(num)) return '-';
  if (num <= 0) return 0;
  if (num === 1) return 50;
  return 100; // num >= 2 视为即将完成
});

const serviceProgressBarWidth = computed(() => {
  const value = serviceProgress.value;
  return value === '-' ? '0%' : `${value}%`;
});

const progressColor = computed(() => {
  const value = serviceProgress.value;
  if (value === '-') return '#E0E0E0';
  if (value < 30) return '#FFA726';
  if (value > 80) return '#66BB6A';
  return '#FFD54F';
});

// 服务次数（使用服务统计中的本次服务性交次数）
const serviceCount = computed(() => {
  const count = getNestedValue(currentGirl.value, '服务统计.本次服务性交次数', 0);
  return typeof count === 'number' ? count : parseInt(count) || 0;
});

// 着装信息（移除不存在的描述字段）
const displayClothing = computed(() => {
  const clothing = currentGirl.value?.服装;
  if (!clothing) return {};

  const result: any = {};

  for (const [key, value] of Object.entries(clothing)) {
    if (typeof value === 'string' && value.trim() && value !== '未知') {
      result[key] = value;
    }
  }

  return result;
});

const hasValidClothing = computed(() => Object.keys(displayClothing.value).length > 0);

function clothingIcon(key: string) {
  const iconMap: Record<string, string> = {
    上衣: 'fas fa-tshirt',
    下装: 'fas fa-user-tie',
    鞋子: 'fas fa-shoe-prints',
    内衣: 'fas fa-heart',
    内裤: 'fas fa-user',
    丝袜: 'fas fa-socks',
    配饰: 'fas fa-gem',
  };
  return iconMap[key] || 'fas fa-tag';
}

// ================ 生命周期 ================

onMounted(async () => {
  // 首次加载显示全屏 Loading
  if (girlsData.value.length === 0) {
    isLoading.value = true;
  }
  await refreshData();
  isLoading.value = false;
});

onActivated(() => {
  // 再次进入时静默刷新
  refreshData();
});
</script>

<style lang="scss" scoped>
.app-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  /* 移除绝对定位，避免脱离文档流导致动画时布局塌陷 */
  /* position: absolute; */
  /* top: 0; */
  /* left: 0; */
}

.app-header {
  background: linear-gradient(135deg, var(--bg-header) 0%, var(--bg-header-light) 100%);
  padding: 48px 20px 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-accent);
  flex-shrink: 0;
  -webkit-backdrop-filter: blur(15px);
  backdrop-filter: blur(15px);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--border-accent), transparent);
  }

  .title {
    font-size: 1.4rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-primary);
    letter-spacing: 0.5px;

    i {
      color: var(--accent-primary);
      padding: 8px;
      border-radius: 10px;
      transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);

      &:hover {
        background: linear-gradient(135deg, rgba(255, 195, 0, 0.15), rgba(255, 215, 64, 0.1));
        transform: scale(1.15) rotate(-8deg);
      }
    }

    span {
      color: var(--text-primary);
    }
  }

  .refresh-btn {
    background: none;
    border: none;
    color: var(--accent-primary);
    font-size: 1.2rem;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: all 0.3s;

    &:hover {
      background: rgba(255, 195, 0, 0.1);
      transform: rotate(180deg);
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

// 空状态
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);

  i {
    font-size: 4rem;
    color: var(--text-placeholder);
    margin-bottom: 20px;
  }

  p {
    font-size: 1rem;
    margin-bottom: 24px;
  }

  .retry-btn {
    background: linear-gradient(135deg, var(--accent-primary), var(--accent-light));
    color: var(--text-primary);
    border: none;
    padding: 12px 32px;
    border-radius: 25px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 195, 0, 0.4);
    }
  }
}

// 加载状态
.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);

  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid var(--border-color);
    border-top-color: var(--accent-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
  }

  p {
    font-size: 1rem;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// 标签页
.tabs-container {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  padding: 6px;
  background: var(--bg-card);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(255, 195, 0, 0.1);
  border: 1px solid rgba(255, 195, 0, 0.2);

  .tab-item {
    flex: 1;
    padding: 12px 16px;
    border: none;
    background: transparent;
    border-radius: 12px;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s;
    color: var(--text-secondary);
    text-align: center;

    &:hover {
      color: var(--text-primary);
      background: rgba(255, 195, 0, 0.1);
    }

    &.active {
      background: linear-gradient(135deg, var(--accent-primary), var(--accent-light));
      color: var(--text-primary);
      box-shadow: 0 4px 15px rgba(255, 195, 0, 0.3);
    }
  }
}

// 状态卡片
.status-card {
  background: var(--bg-card);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-accent);

  .status-header {
    margin-bottom: 20px;

    .basic-info {
      .girl-name {
        font-size: 28px;
        font-weight: 800;
        margin: 0 0 8px 0;
        color: var(--text-primary);
      }

      .sub-info {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--text-secondary);
        font-size: 14px;

        .dot {
          color: var(--text-placeholder);
        }
      }
    }

    .badges {
      display: flex;
      gap: 8px;
      margin-top: 12px;

      .badge {
        padding: 4px 12px;
        border-radius: 50px;
        font-size: 11px;
        font-weight: 700;

        &.badge-hot {
          background: var(--badge-danger-gradient);
          color: white;
        }

        &.badge-type {
          background: var(--badge-info-gradient);
          color: white;
        }
      }
    }
  }

  .order-status-row {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
    padding: 12px;
    background: var(--bg-card);
    border-radius: 12px;

    .status-item {
      display: flex;
      align-items: center;
      gap: 8px;

      .status-icon {
        font-size: 18px;

        &.status-active {
          color: var(--status-success);
        }
        &.status-completed {
          color: var(--status-info);
        }
        &.status-pending {
          color: var(--status-warning);
        }
        &.status-normal {
          color: var(--status-success);
        }
        &.status-warning {
          color: var(--status-warning);
        }
        &.status-danger {
          color: var(--status-danger);
        }
      }

      .status-text {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-primary);
      }
    }
  }

  .rating-section {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    padding: 12px;
    background: var(--bg-badge);
    border-radius: 12px;

    .stars {
      display: flex;
      gap: 4px;

      .star {
        font-size: 16px;
        color: var(--border-color);

        &.active {
          color: var(--accent-primary);
        }
      }
    }

    .affection-score {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-secondary);
    }
  }

  .price-section {
    text-align: center;
    padding: 16px;
    background: var(--bg-badge);
    border-radius: 12px;
    margin-bottom: 20px;

    .price-label {
      font-size: 12px;
      color: var(--text-placeholder);
      margin-bottom: 8px;
    }

    .price-value {
      font-size: 32px;
      font-weight: 900;
      background: var(--badge-danger-gradient);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      line-height: 1;
      margin-bottom: 8px;
    }

    .package-name {
      font-size: 14px;
      color: var(--text-secondary);
      font-weight: 600;
      margin-bottom: 12px;
    }

    .features-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      justify-content: center;

      .feature-tag {
        padding: 4px 12px;
        background: var(--accent-primary);
        color: #2c3e50; /* 强制使用深色文本 */
        border-radius: 50px;
        font-size: 11px;
        font-weight: 600;
        box-shadow: 0 2px 4px rgba(255, 195, 0, 0.3);
      }
    }
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;

    /* 平板端：4列 */
    @media (min-width: 481px) {
      grid-template-columns: repeat(4, 1fr);
    }

    .metric-card {
      text-align: center;
      padding: 16px;
      background: var(--bg-card);
      border-radius: 12px;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(255, 195, 0, 0.2);
      }

      .metric-label {
        font-size: 13px;
        color: var(--text-secondary);
        margin-bottom: 8px;
        font-weight: 600;
      }

      .metric-value {
        font-size: 28px;
        font-weight: 900;
        color: var(--text-primary);
        margin-bottom: 8px;

        .metric-unit {
          font-size: 14px;
          color: var(--text-secondary);
          font-weight: 700;
        }
      }

      .progress-bar {
        width: 100%;
        height: 6px;
        background: var(--border-color);
        border-radius: 50px;
        overflow: hidden;

        .progress-fill {
          height: 100%;
          border-radius: 50px;
          transition: width 0.8s;
        }
      }
    }
  }
}

// 详情区域
.detail-section {
  .detail-card {
    background: var(--bg-card);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(255, 195, 0, 0.15);

    .accordion-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      cursor: pointer;
      background: var(--bg-card);
      transition: all 0.3s;
      font-weight: 700;
      color: var(--text-primary);

      &:hover {
        background: var(--bg-badge);
      }

      &.active {
        background: var(--bg-badge);

        .accordion-arrow {
          transform: rotate(180deg);
        }
      }

      .accordion-icon {
        color: var(--accent-primary);
        margin-right: 8px;
      }

      .accordion-arrow {
        color: var(--text-placeholder);
        transition: transform 0.3s;
      }
    }

    .accordion-content {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease-out;

      &.show {
        max-height: 2000px;
      }
    }

    .accordion-body {
      padding: 20px;
      background: var(--bg-card);
    }
  }

  .detail-group {
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }

    .group-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 16px 0;
      display: flex;
      align-items: center;
      gap: 8px;

      i {
        color: var(--accent-primary);
      }
    }

    // 字段名称统一样式
    .field-label,
    .feature-label,
    .desc-label,
    .stat-label,
    .psychology-label,
    .compact-key,
    .info-key,
    .section-item-label {
      color: #3b82f6 !important; // blue-500
      font-weight: 600;
    }

    :global([data-theme='dark']) & {
      .field-label,
      .feature-label,
      .desc-label,
      .stat-label,
      .psychology-label,
      .compact-key,
      .info-key,
      .section-item-label {
        color: #60a5fa !important; // blue-400
      }
    }

    // 可折叠分组样式
    &.collapsible-group {
      margin-bottom: 12px;
      border: 1px solid var(--border-accent);
      border-radius: 16px;
      overflow: hidden;
      background: var(--bg-card);

      .collapsible-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        cursor: pointer;
        background: var(--bg-card);
        transition: all 0.3s;

        &:hover {
          background: var(--bg-badge);
        }

        .group-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;

          i {
            color: var(--accent-primary);
          }
        }

        .accordion-arrow {
          color: var(--text-placeholder);
          transition: transform 0.3s;
          font-size: 14px;

          &.active {
            transform: rotate(180deg);
            color: var(--accent-primary);
          }
        }
      }

      .collapsible-content {
        padding: 0 20px 16px 20px;
        transition: all 0.3s ease;
      }

      // 紧凑信息网格样式
      .compact-info-grid {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .compact-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px;
          background: var(--bg-card);
          border-radius: 10px;

          &.full-width {
            flex-direction: column;
            gap: 8px;
          }

          .compact-key {
            font-size: 13px;
            font-weight: 600;
            color: var(--text-primary);
            min-width: 80px;
            flex-shrink: 0;
          }

          .compact-value {
            font-size: 14px;
            font-weight: 500;
            color: var(--text-secondary);
            line-height: 1.5;
            flex: 1;

            &.long-text {
              font-size: 13px;
              line-height: 1.6;
              color: var(--text-primary);
              word-break: break-word;
              white-space: pre-wrap;
            }
          }
        }
      }

      // 心理状态内容样式
      .psychology-content {
        .psychology-item {
          background: linear-gradient(135deg, rgba(255, 195, 0, 0.08), rgba(255, 215, 64, 0.05));
          border: 1px solid rgba(255, 195, 0, 0.2);
          border-radius: 12px;
          padding: 16px;
          position: relative;
          overflow: hidden;

          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, var(--accent-primary), var(--accent-light));
          }

          .psychology-label {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            font-weight: 700;
            color: var(--accent-primary);
            margin-bottom: 12px;

            i {
              font-size: 16px;
            }
          }

          .psychology-text {
            font-size: 14px;
            line-height: 1.6;
            color: var(--text-primary);
            font-style: italic;
            padding: 12px;
            background: var(--bg-card);
            border-radius: 8px;
            border-left: 4px solid var(--accent-primary);
            word-break: break-word;
            white-space: pre-wrap;
          }
        }
      }

      // 身体特征网格样式
      .body-feature-grid {
        .feature-row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 16px;

          /* 平板端：4列 */
          @media (min-width: 481px) {
            grid-template-columns: repeat(4, 1fr);
          }

          .feature-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px;
            background: var(--bg-card);
            border-radius: 12px;
            border: 1px solid rgba(255, 195, 0, 0.15);
            transition: all 0.3s ease;

            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(255, 195, 0, 0.15);
              border-color: var(--accent-primary);
            }

            .feature-icon {
              width: 28px;
              height: 28px;
              border-radius: 6px;
              background: linear-gradient(135deg, var(--accent-primary), var(--accent-light));
              display: flex;
              justify-content: center;
              align-items: center;
              flex-shrink: 0;

              i {
                font-size: 12px;
                color: white;
              }
            }

            .feature-content {
              flex: 1;
              min-width: 0;

              .feature-label {
                font-size: 11px;
                font-weight: 600;
                color: var(--text-secondary);
                margin-bottom: 2px;
              }

              .feature-value {
                font-size: 14px;
                font-weight: 700;
                color: var(--text-primary);
              }
            }
          }
        }

        .feature-description {
          display: flex;
          flex-direction: column;
          gap: 12px;

          .desc-item {
            background: var(--bg-card);
            border-radius: 10px;
            padding: 12px;
            border-left: 4px solid var(--accent-primary);

            .desc-label {
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 13px;
              font-weight: 600;
              color: var(--accent-primary);
              margin-bottom: 8px;

              i {
                font-size: 14px;
              }
            }

            .desc-text {
              font-size: 13px;
              line-height: 1.6;
              color: var(--text-primary);
              padding-left: 22px;
              word-break: break-word;
              white-space: pre-wrap;
            }
          }
        }
      }

      // 性经验与服务统计样式
      .experience-stats {
        .stats-section {
          margin-bottom: 20px;

          &:last-child {
            margin-bottom: 0;
          }

          .section-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            font-weight: 700;
            color: var(--accent-primary);
            margin-bottom: 12px;
            padding: 8px 12px;
            background: linear-gradient(135deg, rgba(255, 195, 0, 0.1), rgba(255, 215, 64, 0.05));
            border-radius: 8px;
            border: 1px solid rgba(255, 195, 0, 0.2);

            i {
              font-size: 16px;
            }
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;

            /* 平板端：3列 */
            @media (min-width: 481px) {
              grid-template-columns: repeat(3, 1fr);
            }

            /* 大屏端：5列 */
            @media (min-width: 1024px) {
              grid-template-columns: repeat(5, 1fr);
            }

            .stat-item {
              display: flex;
              align-items: center;
              gap: 10px;
              padding: 12px;
              background: var(--bg-card);
              border-radius: 10px;
              border: 1px solid rgba(255, 195, 0, 0.12);
              transition: all 0.3s ease;

              &:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(255, 195, 0, 0.1);
                border-color: var(--accent-primary);
              }

              .stat-icon {
                width: 32px;
                height: 32px;
                border-radius: 8px;
                background: linear-gradient(135deg, var(--accent-primary), var(--accent-light));
                display: flex;
                justify-content: center;
                align-items: center;
                flex-shrink: 0;

                i {
                  font-size: 14px;
                  color: white;
                }
              }

              .stat-content {
                flex: 1;
                min-width: 0;

                .stat-label {
                  font-size: 11px;
                  font-weight: 600;
                  color: var(--text-secondary);
                  margin-bottom: 2px;
                  line-height: 1.2;
                }

                .stat-value {
                  font-size: 14px;
                  font-weight: 700;
                  color: var(--text-primary);
                  line-height: 1.2;
                }
              }
            }
          }
        }
      }
    }

    .clothing-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;

      /* 平板端：3列 */
      @media (min-width: 481px) {
        grid-template-columns: repeat(3, 1fr);
      }

      /* 大屏端：4列 */
      @media (min-width: 1024px) {
        grid-template-columns: repeat(4, 1fr);
      }

      .clothing-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px;
        background: var(--bg-card);
        border-radius: 10px;

        .clothing-icon {
          font-size: 18px;
          color: var(--accent-primary);
          flex-shrink: 0;
        }

        .clothing-key {
          font-size: 12px;
          color: var(--text-primary);
          flex: 1;
        }

        .clothing-value {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }
      }
    }

    .info-rows {
      display: grid;
      gap: 10px;

      .info-row {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px 16px;
        background: var(--bg-card);
        border-radius: 10px;

        .info-key {
          font-size: 13px;
          color: var(--text-primary);
          font-weight: 600;
        }

        .info-val {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.5;
          word-break: break-word;
          white-space: pre-wrap;
        }
      }
    }

    .empty-text {
      text-align: center;
      color: var(--text-placeholder);
      padding: 20px;
    }
  }
}

// 底部导航
.nav-bar {
  display: flex;
  border-top: 1px solid var(--border-color);
  background: linear-gradient(135deg, var(--bg-header) 0%, var(--bg-header-light) 100%);
  padding: 8px 0;
  flex-shrink: 0;
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--border-color), transparent);
  }

  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: var(--text-secondary);
    font-size: 0.8rem;
    padding: 4px 0;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    position: relative;
    border-radius: 8px;
    margin: 0 4px;

    &.active {
      color: var(--text-primary);

      i {
        color: var(--accent-primary);
        transform: scale(1.15) translateY(-2px);
      }
    }

    &:hover:not(.active) {
      color: var(--text-primary);
      transform: translateY(-1px);
    }

    i {
      font-size: 1.25rem;
      margin-bottom: 4px;
      transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
  }
}
</style>
