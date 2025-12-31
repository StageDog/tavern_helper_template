<template>
  <div class="app-view active">
    <!-- 历史订单内容 -->
    <div class="app-header">
      <div class="title">
        <i class="fas fa-history"></i>
        <span>历史订单</span>
      </div>
    </div>

    <div class="app-content">
      <div class="card">
        <div class="card-title"><i class="fas fa-history"></i>历史订单</div>
        <div v-if="historyItems.length === 0" class="empty-state">暂无历史订单</div>
          <div v-else>
          <div
            v-for="(item, index) in historyItems"
            :key="item.id ?? `${item.order_time ?? 'history'}_${index}`"
            class="history-card"
            @click="reorder(item)"
          >
            <!-- 头部：姓名套餐和价格 -->
            <div class="history-header">
              <div class="title-section">
                <h3 class="history-title">{{ item.girl_name || '-' }} - {{ item.package_name || '-' }}</h3>
              </div>
              <div class="price-section">
                <div class="history-price">{{ item.price ?? '-' }}</div>
              </div>
            </div>

            <!-- 中部：身份信息 -->
            <div class="identity-section">
              <i class="fas fa-user"></i>
              <span class="identity-text">{{ item.identity || '-' }}</span>
            </div>

            <!-- 底部：时间和状态 + 按钮 -->
            <div class="bottom-section">
              <div class="status-time">
                <span class="order-time">{{ item.order_time || '-' }}</span>
                <span :style="getStatusStyle(item.order_status)" class="status-badge">{{
                  item.order_status || '-'
                }}</span>
              </div>
              <div class="quick-reorder-btn">
                <i class="fas fa-redo"></i>
                <span>再次下单</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 确认订单弹窗 -->
    <div
      v-if="currentView === 'reorder' && selectedOrder"
      class="reorder-modal-overlay"
      @click.self="backToHistory"
    >
      <div class="reorder-modal-content">
        <div class="modal-header">
          <div class="modal-title"><i class="fas fa-shopping-cart"></i>确认订单</div>
          <button class="btn-close" @click="backToHistory"><i class="fas fa-arrow-left"></i> 返回</button>
        </div>

        <div class="modal-body">
          <div class="order-summary">
            <div class="summary-avatar">
              <i class="fas fa-heart"></i>
            </div>
            <div class="summary-main">
              <div class="summary-title">
                <span class="summary-name">{{ selectedOrder.girl_name || '-' }}</span>
                <span class="summary-identity">{{ selectedOrder.identity || '-' }}</span>
              </div>
              <div class="summary-package">{{ selectedOrder.package_name || '未命名套餐' }}</div>
              <div v-if="currentOrderFeatures.length" class="summary-tags">
                <span v-for="tag in currentOrderFeatures.slice(0, 4)" :key="tag" class="summary-tag">{{ tag }}</span>
                <span v-if="currentOrderFeatures.length > 4" class="summary-tag more"
                  >+{{ currentOrderFeatures.length - 4 }}</span
                >
              </div>
            </div>
              <div class="summary-price">
              <span class="price-number">￥{{ selectedOrder.price ?? '-' }}</span>
              <span class="price-tip">下单后立即生效</span>
            </div>
          </div>

          <div class="key-metrics">
            <div class="metric-card">
              <span class="metric-label">好感度</span>
              <span class="metric-value">{{
                getNestedValue(selectedOrder?.originalData, '心理状态.好感度', '-')
              }}</span>
            </div>
            <div class="metric-card">
              <span class="metric-label">怀孕几率</span>
              <span class="metric-value">
                {{ formatPregnancyChance(getNestedValue(selectedOrder?.originalData, '性经验.怀孕几率', '-')) }}
              </span>
            </div>
            <div class="metric-card">
              <span class="metric-label">被下单次数</span>
              <span class="metric-value">{{
                getNestedValue(selectedOrder?.originalData, '性经验.下单次数', '-')
              }}</span>
            </div>
          </div>

          <div class="order-info-grid">
            <div class="info-box">
              <div class="info-label">美人姓名</div>
              <div class="info-value">{{ selectedOrder.girl_name || '-' }}</div>
            </div>
            <div class="info-box">
              <div class="info-label">身份</div>
              <div class="info-value">{{ selectedOrder.identity || '-' }}</div>
            </div>
            <div class="info-box">
              <div class="info-label">套餐名称</div>
              <div class="info-value">{{ selectedOrder.package_name || '-' }}</div>
            </div>
            <div class="info-box">
              <div class="info-label">订单价格</div>
              <div class="info-value price">¥{{ selectedOrder.price || '-' }}</div>
            </div>
          </div>

          <div class="info-section">
            <div class="section-title"><i class="fas fa-info-circle"></i> 订单说明</div>
            <div class="section-content">
              您即将再次下单"{{ selectedOrder.package_name || '-' }}"服务，价格为 ¥{{ selectedOrder.price || '-' }}。
              当前好感度：{{ getNestedValue(selectedOrder?.originalData, '心理状态.好感度', '-') }}， 被下单次数：{{
                getNestedValue(selectedOrder?.originalData, '性经验.下单次数', '-')
              }}， 怀孕几率：{{
                formatPregnancyChance(getNestedValue(selectedOrder?.originalData, '性经验.怀孕几率', '-'))
              }}。 确认后将立即生效，请确保您已了解服务内容。
            </div>
          </div>

          <div class="info-section">
            <div class="section-title"><i class="fas fa-heart"></i> 心理状态</div>
            <div class="section-grid">
              <div class="section-item">
                <div class="section-item-label">好感度</div>
                <div class="section-item-value">
                  {{ getNestedValue(selectedOrder?.originalData, '心理状态.好感度', '-') }}
                </div>
              </div>
              <div class="section-item">
                <div class="section-item-label">当前所想</div>
                <div class="section-item-value">
                  {{ getNestedValue(selectedOrder?.originalData, '心理状态.当前所想', '-') }}
                </div>
              </div>
            </div>
          </div>

          <div class="info-section">
            <div class="section-title"><i class="fas fa-user"></i> 身体特征</div>
            <div class="section-grid">
              <div class="section-item">
                <div class="section-item-label">三围描述</div>
                <div class="section-item-value">
                  {{ getNestedValue(selectedOrder?.originalData, '身体特征.三围.描述', '-') }}
                </div>
              </div>
              <div class="section-item">
                <div class="section-item-label">乳房形状</div>
                <div class="section-item-value">
                  {{ getNestedValue(selectedOrder?.originalData, '身体特征.乳房.形状', '-') }}
                </div>
              </div>
              <div class="section-item">
                <div class="section-item-label">姿势</div>
                <div class="section-item-value">
                  {{ getNestedValue(selectedOrder?.originalData, '身体特征.姿势', '-') }}
                </div>
              </div>
              <div class="section-item">
                <div class="section-item-label">胸部状态</div>
                <div class="section-item-value">
                  {{ getNestedValue(selectedOrder?.originalData, '身体特征.胸部', '-') }}
                </div>
              </div>
              <div class="section-item">
                <div class="section-item-label">私处状态</div>
                <div class="section-item-value">
                  {{ getNestedValue(selectedOrder?.originalData, '身体特征.私处', '-') }}
                </div>
              </div>
            </div>
          </div>

          <div class="info-section">
            <div class="section-title"><i class="fas fa-star"></i> 性经验</div>
            <div class="section-grid">
              <div class="section-item">
                <div class="section-item-label">是否处女</div>
                <div class="section-item-value">
                  {{ getNestedValue(selectedOrder?.originalData, '性经验.处女', '-') }}
                </div>
              </div>
              <div class="section-item">
                <div class="section-item-label">性伴侣数量</div>
                <div class="section-item-value">
                  {{ getNestedValue(selectedOrder?.originalData, '性经验.性伴侣数量', '-') }}
                </div>
              </div>
              <div class="section-item">
                <div class="section-item-label">初次性行为对象</div>
                <div class="section-item-value">
                  {{ getNestedValue(selectedOrder?.originalData, '性经验.初次性行为对象', '-') }}
                </div>
              </div>
              <div class="section-item">
                <div class="section-item-label">怀孕几率</div>
                <div class="section-item-value">
                  {{ formatPregnancyChance(getNestedValue(selectedOrder?.originalData, '性经验.怀孕几率', '-')) }}
                </div>
              </div>
              <div class="section-item">
                <div class="section-item-label">下单次数</div>
                <div class="section-item-value">
                  {{ getNestedValue(selectedOrder?.originalData, '性经验.下单次数', '-') }}
                </div>
              </div>
            </div>
          </div>

          <div class="info-section">
            <div class="section-title"><i class="fas fa-chart-bar"></i> 服务统计</div>
            <div class="section-grid">
              <div class="section-item">
                <div class="section-item-label">本次服务性交次数</div>
                <div class="section-item-value">
                  {{ getNestedValue(selectedOrder?.originalData, '服务统计.本次服务性交次数', '-') }}
                </div>
              </div>
              <div class="section-item">
                <div class="section-item-label">内射次数</div>
                <div class="section-item-value">
                  {{ getNestedValue(selectedOrder?.originalData, '服务统计.内射次数', '-') }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-primary" @click="showReorderModal">
            <i class="fas fa-check-circle"></i> 再次下单
          </button>
          <button class="btn btn-secondary" @click="backToHistory">
            <i class="fas fa-times-circle"></i> 取消
          </button>
        </div>
      </div>
    </div>

    <!-- 玩法和备注弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h3>玩法和备注</h3>
        <div v-if="currentOrderFeatures.length > 0" class="modal-tags-section">
          <h4>快速选择</h4>
          <div class="modal-tags-wrapper">
            <button
              v-for="feature in currentOrderFeatures"
              :key="feature"
              class="content-tag-btn"
              @click="addFeatureToRemark(feature)"
            >
              {{ feature }}
            </button>
          </div>
        </div>
        <textarea
          ref="remarkTextarea"
          v-model="orderRemark"
          placeholder="可输入特殊要求，如服装、场景、认知等..."
        ></textarea>
        <div class="modal-buttons">
          <button class="modal-btn-cancel" @click="closeModal">取消</button>
          <button class="modal-btn-confirm" @click="confirmOrder">再次下单</button>
        </div>
      </div>
    </div>

    <!-- 底部导航 -->
    <div class="nav-bar">
      <div class="nav-item" @click="$router.push('/home')">
        <i class="fas fa-home"></i>
        <span>首页</span>
      </div>
      <div class="nav-item" @click="$router.push('/discover')">
        <i class="fas fa-compass"></i>
        <span>发现</span>
      </div>
      <div class="nav-item" @click="$router.push('/service')">
        <i class="fas fa-heart"></i>
        <span>服务</span>
      </div>
      <div class="nav-item active" @click="$router.push('/history')">
        <i class="fas fa-history"></i>
        <span>历史</span>
      </div>
      <div class="nav-item" @click="$router.push('/me')">
        <i class="fas fa-user"></i>
        <span>我的</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onActivated, onMounted, ref } from 'vue';
import { filterCompletedOrders, loadOrdersFromMVU, readCachedOrders } from './shared/serviceOrders';
import { getNestedValue } from './utils';

// 格式化怀孕几率
function formatPregnancyChance(value: any): string {
  if (value === null || value === undefined) return '-';

  // 如果已经是带%的字符串，直接返回
  if (typeof value === 'string' && value.includes('%')) {
    return value;
  }

  const num = Number(value);
  if (!Number.isFinite(num)) return '-';

  // MVU 已保证为 0-100 的整数百分比，这里兜底 clamp 并统一两位小数
  const clamped = Math.min(100, Math.max(0, num));
  return `${Math.round(clamped * 100) / 100}%`;
}

// 响应式数据
const historyItems = ref<any[]>([]);
const selectedOrder = ref<any>(null);
const currentView = ref('history');
const showModal = ref(false);
const orderRemark = ref('');
const remarkTextarea = ref<HTMLTextAreaElement | null>(null);

// 状态样式
function getStatusStyle(status: string) {
  const styles: Record<string, string> = {
    已完成:
      'background-color: rgba(46,204,113,0.2); color: #2ecc71; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;',
    订单结束:
      'background-color: rgba(231,76,60,0.2); color: #e74c3c; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;',
    服务结束:
      'background-color: rgba(230,126,34,0.2); color: #e67e22; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;',
    进行中:
      'background-color: rgba(52,152,219,0.2); color: #3498db; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;',
  };
  return styles[status] || styles['进行中'];
}

// 提取订单特色功能
function extractOrderFeatures(order: any): string[] {
  if (!order || typeof order !== 'object') return [];

  const features = new Set<string>();

  const pushFeature = (value: any) => {
    if (typeof value !== 'string') return;
    const trimmed = value.trim();
    if (!trimmed) return;
    if (['无', '未知', '--'].includes(trimmed)) return;
    features.add(trimmed);
  };

  const pushFeatureArray = (list: any[]) => {
    if (!Array.isArray(list)) return;
    list.forEach(pushFeature);
  };

  pushFeature(order['套餐名称']);
  if (order['套餐']) {
    pushFeature(order['套餐']['套餐名称']);
    pushFeatureArray(order['套餐']['玩法特色']);
    pushFeature(order['套餐']['商品类型']);
  }

  const clothingSources = [order['服装'], order['身体特征']?.['服装']];
  clothingSources.forEach(source => {
    if (source && typeof source === 'object') {
      Object.values(source).forEach(pushFeature);
    }
  });

  return Array.from(features);
}

// 当前订单特色
const currentOrderFeatures = computed(() => {
  if (selectedOrder.value) {
    const raw = selectedOrder.value.features || extractOrderFeatures(selectedOrder.value.originalData);
    const orderFeatures = Array.isArray(raw) ? raw : typeof raw === 'string' ? raw.split(/\s*,\s*|\s+/).filter(Boolean) : [];
    if (orderFeatures.length > 0) return orderFeatures;
  }
  return [];
});

function backToHistory() {
  currentView.value = 'history';
  selectedOrder.value = null;
  showModal.value = false;
  orderRemark.value = '';
}

// 重新下单
function reorder(item: any) {
  if (!item || typeof item !== 'object') return;
  const hasAnyInfo = Boolean(item.originalData) || Boolean(item.girl_name) || Boolean(item.package_name);
  if (!hasAnyInfo) return;
  selectedOrder.value = item;
  currentView.value = 'reorder';
}

function showReorderModal() {
  if (!selectedOrder.value) return;
  orderRemark.value = '';
  showModal.value = true;
  nextTick(() => {
    try {
      if (remarkTextarea.value) {
        remarkTextarea.value.focus();
      }
    } catch (_) {
      // ignore
    }
  });
}

function closeModal() {
  showModal.value = false;
  orderRemark.value = '';
}

function addFeatureToRemark(feature: string) {
  if (orderRemark.value) {
    orderRemark.value += ' ' + feature;
  } else {
    orderRemark.value = feature;
  }
  if (remarkTextarea.value) remarkTextarea.value.focus();
}

function confirmOrder() {
  if (!selectedOrder.value) return;

  const pkg = selectedOrder.value.package_name || '未知套餐';
  const girl = selectedOrder.value.girl_name || '未知';
  const identity = selectedOrder.value.identity || '未知';
  const age = getNestedValue(selectedOrder.value?.originalData, '基础信息.年龄', '-');

  const originPrice = selectedOrder.value.price;
  const finalPrice = originPrice ?? '-';

  const remark = orderRemark.value.trim() || '无';
  const text = `再次下单：${girl}，${age}，${identity}，${pkg}，订单价格：¥${finalPrice}。备注：${remark}`;
  const ok = sendToAI(`/send ${text}`);

  closeModal();
  currentView.value = 'history';
  selectedOrder.value = null;

  if (!ok) {
    try {
      console.info('命令已复制到剪贴板');
    } catch (_) {
      // ignore
    }
  }
}

function sendToAI(message: string) {
  console.log(`[发送至AI]: ${message}`);
  const fullCommand = `${message} | /trigger await=true`;
  if (typeof window.triggerSlash !== 'undefined') {
    try {
      window.triggerSlash(fullCommand);
      return true;
    } catch (e) {
      console.error('执行triggerSlash时出错:', e);
      return false;
    }
  } else {
    console.log(`[模拟发送至AI - 完整指令]: ${fullCommand}`);
    return false;
  }
}

async function refreshHistory() {
  try {
    const orders = await loadOrdersFromMVU();
    const completed = filterCompletedOrders(orders);
    historyItems.value = completed.map(order => ({
      id: order.id,
      girl_name: order.基础信息?.姓名 || '未知',
      identity: order.基础信息?.身份 || '未知',
      package_name: order.套餐?.套餐名称 || '未知套餐',
      order_time: '历史订单',
      order_status: order.status || '服务结束',
      service_location: '未知',
      price: order.套餐?.折后价格 || order.套餐?.套餐价格 || 0,
      features: extractOrderFeatures(order.originalData),
      originalData: order.originalData,
    }));
  } catch (e) {
    console.error('[History] 获取订单失败，尝试缓存:', e);
    const cached = readCachedOrders();
    const completed = filterCompletedOrders(cached);
    historyItems.value = completed.map(order => ({
      id: order.id,
      girl_name: order.基础信息?.姓名 || '未知',
      identity: order.基础信息?.身份 || '未知',
      package_name: order.套餐?.套餐名称 || '未知套餐',
      order_time: '历史订单',
      order_status: order.status || '服务结束',
      service_location: '未知',
      price: order.套餐?.折后价格 || order.套餐?.套餐价格 || 0,
      features: extractOrderFeatures(order.originalData),
      originalData: order.originalData,
    }));
  }
}

onMounted(async () => {
  await refreshHistory();
});

onActivated(async () => {
  await refreshHistory();
});
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

  .title {
    font-size: 1.3rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-primary);

    i {
      color: var(--accent-primary);
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

.card {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 195, 0, 0.1);

  .card-title {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 8px;

    i {
      color: var(--accent-primary);
    }
  }
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-placeholder);
  line-height: 1.6;
}

.history-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: var(--bg-card);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.4s;
  border: 1px solid var(--border-accent);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 195, 0, 0.2);
  }

  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;

    .title-section {
      flex: 1;
      min-width: 0;

      .history-title {
        font-size: 16px;
        font-weight: 700;
        color: var(--text-primary);
        line-height: 1.4;
        margin: 0;
        word-break: break-word;
      }
    }

    .price-section {
      flex-shrink: 0;

      .history-price {
        font-size: 24px;
        font-weight: 900;
        background: var(--badge-danger-gradient);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        white-space: nowrap;

        &::before {
          content: '¥';
          font-size: 18px;
        }
      }
    }
  }

  .identity-section {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--text-secondary);
    padding: 4px 0;

    i {
      color: var(--accent-primary);
      width: 14px;
      text-align: center;
      flex-shrink: 0;
    }

    .identity-text {
      font-style: italic;
    }
  }

  .bottom-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;

    .status-time {
      display: flex;
      align-items: center;
      gap: 12px;

      .order-time {
        font-size: 12px;
        color: var(--text-placeholder);
        white-space: nowrap;
      }

      .status-badge {
        padding: 3px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        white-space: nowrap;
      }
    }

    .quick-reorder-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      background: var(--bg-badge);
      border: 1px solid var(--accent-primary);
      border-radius: 50px;
      font-size: 12px;
      font-weight: 600;
      color: var(--accent-dark);
      transition: all 0.25s;

      &:hover {
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-dark));
        color: white;
      }

      i {
        font-size: 11px;
      }
    }
  }
}

.reorder-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
}

.reorder-modal-content {
  background: var(--bg-card);
  border-radius: 24px;
  width: 100%; /* 宽度撑满 */
  height: 100%; /* 高度撑满 */
  max-width: none; /* 移除最大宽度限制 */
  max-height: none; /* 移除最大高度限制 */
  overflow-y: auto;
  box-shadow: none; /* 全屏模式不需要阴影 */
  position: relative;
  display: flex;
  flex-direction: column;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(90deg, var(--accent-primary), var(--accent-dark));
    z-index: 10;
  }

  .modal-header {
    padding: 24px 24px 16px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--border-color);

    .modal-title {
      font-size: 20px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--text-primary);

      i {
        color: var(--accent-primary);
      }
    }

    .btn-close {
      padding: 8px 16px;
      background: var(--bg-card-light);
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.25s;
      color: var(--text-secondary);

      &:hover {
        background: var(--bg-badge);
      }

      i {
        margin-right: 4px;
      }
    }
  }

  .modal-body {
    padding: 24px;
    overflow-y: auto;
    flex: 1;

    .order-summary {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 14px;
      align-items: center;
      padding: 18px;
      border: 1px solid var(--border-color);
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(255, 247, 230, 0.85), rgba(255, 255, 255, 0.92));
      margin-bottom: 16px;

      .summary-avatar {
        width: 52px;
        height: 52px;
        border-radius: 14px;
        background: var(--bg-badge);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--accent-primary);
        font-size: 1.4rem;
        box-shadow:
          0 4px 12px rgba(255, 195, 0, 0.25),
          0 0 0 2px var(--border-accent) inset;
      }

      .summary-main {
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-width: 0;

        .summary-title {
          display: flex;
          gap: 10px;
          align-items: baseline;
          flex-wrap: wrap;
        }

        .summary-name {
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .summary-identity {
          font-size: 0.9rem;
          color: var(--text-secondary);
          padding: 4px 10px;
          border-radius: 999px;
          background: var(--bg-card-light);
          border: 1px solid var(--border-color);
        }

        .summary-package {
          font-size: 0.95rem;
          color: var(--text-secondary);
          font-weight: 600;
          line-height: 1.4;
          word-break: break-word;
        }

        .summary-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;

          .summary-tag {
            padding: 6px 10px;
            border-radius: 10px;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            font-size: 0.8rem;
            color: var(--text-secondary);
            &.more {
              background: var(--bg-badge);
              color: var(--accent-primary);
            }
          }
        }
      }

      .summary-price {
        text-align: right;
        display: flex;
        flex-direction: column;
        gap: 4px;
        align-items: flex-end;

        .price-number {
          font-size: 1.5rem;
          font-weight: 900;
          background: var(--badge-danger-gradient);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          white-space: nowrap;
        }

        .price-tip {
          font-size: 0.78rem;
          color: var(--text-secondary);
        }
      }

      @media (max-width: 640px) {
        grid-template-columns: 1fr;
        text-align: left;

        .summary-price {
          align-items: flex-start;
        }
      }
    }

    .key-metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 18px;

      @media (max-width: 640px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (max-width: 480px) {
        grid-template-columns: 1fr;
      }

      .metric-card {
        padding: 14px 16px;
        background: var(--bg-card-light);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);

        .metric-label {
          font-size: 0.85rem;
          color: var(--text-secondary);
          letter-spacing: 0.3px;
        }

        .metric-value {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--text-primary);
        }
      }
    }

    /* 平板端：双栏布局 */
    @media (min-width: 768px) {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      align-items: start;

      .order-summary,
      .key-metrics {
        grid-column: 1 / -1;
      }

      /* 左侧：基础信息、订单说明、心理状态 */
      .order-info-grid,
      .info-section:nth-of-type(1),
      .info-section:nth-of-type(2) {
        grid-column: 1 / 2;
      }

      /* 右侧：身体特征、性经验、服务统计 */
      .info-section:nth-of-type(n + 3) {
        grid-column: 2 / 3;
      }
    }
  }

  .modal-footer {
    padding: 16px 24px 24px 24px;
    display: flex;
    gap: 12px;

    .btn {
      flex: 1;
      padding: 14px;
      border-radius: 12px;
      border: none;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.25s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;

      &.btn-primary {
        background: linear-gradient(135deg, var(--accent-primary) 0, var(--accent-dark) 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(255, 195, 0, 0.2);

        &:hover {
          background: linear-gradient(135deg, var(--accent-dark) 0, #cc9900 100%);
          transform: translateY(-2px);
        }
      }

      &.btn-secondary {
        background: var(--bg-card-light);
        color: var(--text-secondary);

        &:hover {
          background: var(--bg-badge);
        }
      }
    }
  }
}

.order-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  /* 大屏端：4列 */
  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
    grid-column: 1 / -1 !important; /* 跨越两栏 */
  }

  .info-box {
    background: var(--bg-card-light);
    padding: 20px;
    border-radius: 16px;
    border: 1px solid var(--border-color);
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    justify-content: center;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      border-color: var(--accent-primary);
    }

    .info-label {
      font-size: 14px;
      color: var(--text-secondary);
      margin-bottom: 8px;
      font-weight: 500;
    }

    .info-value {
      font-size: 20px;
      font-weight: 800;
      color: var(--text-primary);
      line-height: 1.2;
      word-break: break-word;

      &.price {
        font-size: 28px;
        background: var(--badge-danger-gradient);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }
  }
}

.info-section {
  background: var(--bg-card-light);
  padding: 24px;
  border-radius: 16px;
  margin-bottom: 24px;
  border: 1px solid var(--border-color);
  height: fit-content;

  .section-title {
    font-size: 18px;
    font-weight: 800;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    color: var(--text-primary);
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);

    i {
      color: var(--accent-primary);
      font-size: 20px;
    }
  }

  .section-content {
    font-size: 16px;
    color: var(--text-secondary);
    line-height: 1.8;
    background: rgba(255, 255, 255, 0.5);
    padding: 20px;
    border-radius: 12px;
  }

  .section-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;

    /* 平板端：3列 */
    @media (min-width: 600px) {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .section-item {
    background: rgba(255, 255, 255, 0.5);
    padding: 16px;
    border-radius: 12px;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.8);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
    }

    .section-item-label {
      font-size: 14px;
      color: var(--text-secondary);
      margin-bottom: 6px;
      font-weight: 600;
    }

    .section-item-value {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-primary);
      word-break: break-word;
    }
  }
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: var(--bg-card);
  padding: 28px;
  border-radius: 20px;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 12px 40px rgba(255, 195, 0, 0.25);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(135deg, var(--accent-primary) 0, var(--accent-dark) 100%);
    border-radius: 20px 20px 0 0;
  }

  h3 {
    margin-bottom: 20px;
    text-align: center;
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .modal-tags-section {
    margin-bottom: 16px;

    h4 {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 10px;
      text-align: left;
      color: var(--text-secondary);
    }
  }

  .modal-tags-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .content-tag-btn {
    background: var(--bg-card-light);
    color: var(--text-primary);
    font-size: 13px;
    padding: 8px 14px;
    border-radius: 50px;
    border: 1.5px solid var(--border-color);
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background: linear-gradient(135deg, var(--accent-primary), var(--accent-dark));
      color: white;
      transform: translateY(-2px);
    }
  }

  textarea {
    width: 100%;
    height: 100px;
    border: 2px solid var(--border-color);
    border-radius: 12px;
    padding: 12px;
    margin-bottom: 20px;
    font-size: 14px;
    resize: none;
    transition: all 0.3s;
    font-family: inherit;
    background: var(--bg-card);
    color: var(--text-primary);

    &:focus {
      outline: none;
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 3px rgba(255, 195, 0, 0.2);
    }
  }

  .modal-buttons {
    display: flex;
    gap: 12px;

    button {
      flex: 1;
      padding: 14px;
      border-radius: 12px;
      border: none;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .modal-btn-confirm {
      background: linear-gradient(135deg, var(--accent-primary) 0, var(--accent-dark) 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(255, 195, 0, 0.2);

      &:hover {
        transform: translateY(-2px);
      }
    }

    .modal-btn-cancel {
      background: var(--bg-card-light);
      color: var(--text-secondary);

      &:hover {
        background: var(--bg-badge);
      }
    }
  }
}

.nav-bar {
  display: flex;
  border-top: 1px solid var(--border-color);
  background: linear-gradient(135deg, var(--bg-header) 0, var(--bg-header-light) 100%);
  padding: 8px 0;
  flex-shrink: 0;

  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: var(--text-secondary);
    font-size: 0.8rem;
    padding: 4px 0;
    cursor: pointer;
    transition: all 0.25s;
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
      transition: all 0.25s;
    }
  }
}

@media (max-width: 480px) {
  .order-info-grid {
    grid-template-columns: 1fr;
  }

  .info-section {
    .section-grid {
      grid-template-columns: 1fr;
    }
  }

  .history-card {
    .history-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;

      .title-section {
        width: 100%;
      }

      .price-section {
        align-self: flex-end;
      }
    }

    .bottom-section {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;

      .status-time {
        width: 100%;
        justify-content: space-between;
      }

      .quick-reorder-btn {
        align-self: flex-end;
      }
    }
  }
}
</style>
