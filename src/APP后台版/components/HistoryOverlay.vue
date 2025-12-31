<template>
  <div v-if="historyOverlayOpen" class="fixed inset-0 z-[5000] flex items-center justify-center bg-black/60 p-4">
    <div class="relative flex h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900/90 to-black/80 shadow-2xl shadow-blue-500/10 backdrop-blur-xl">
      <div class="flex items-center gap-3 border-b border-slate-700/50 px-5 py-4">
        <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
          <i class="fas fa-history"></i>
        </div>
        <div class="min-w-0 flex-1">
          <div class="truncate text-base font-bold text-white">历史订单</div>
          <div class="text-xs text-slate-400">从 MVU/缓存读取已完成订单</div>
        </div>
        <button
          class="rounded-xl border border-slate-700/50 bg-slate-800/50 px-3 py-2 text-sm text-slate-200 hover:border-blue-500/30 hover:bg-slate-700/50"
          :disabled="loading"
          @click="refreshHistory"
        >
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
          <span class="ml-2">刷新</span>
        </button>
        <button
          class="rounded-xl border border-slate-700/50 bg-slate-800/50 px-3 py-2 text-sm text-slate-200 hover:border-blue-500/30 hover:bg-slate-700/50"
          @click="closeAll"
        >
          <i class="fas fa-times"></i>
          <span class="ml-2">关闭</span>
        </button>
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto p-5">
        <div v-if="loading" class="flex items-center justify-center py-12 text-slate-300">
          <div class="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-blue-400"></div>
          正在加载历史订单…
        </div>

        <div v-else-if="historyItems.length === 0" class="py-12 text-center text-slate-400">
          <i class="fas fa-inbox mb-3 text-3xl opacity-40"></i>
          <div class="text-sm">暂无历史订单</div>
          <div class="mt-1 text-xs opacity-80">{{ errorMessage || '（可能尚未生成订单 / MVU 未就绪）' }}</div>
        </div>

        <div v-else class="space-y-3">
          <button
            v-for="(item, idx) in historyItems"
            :key="item.id ?? `${item.order_time ?? 'history'}_${idx}`"
            class="group w-full rounded-2xl border border-slate-700/50 bg-slate-800/30 p-4 text-left transition-all hover:border-blue-500/40 hover:bg-slate-800/60"
            @click="openReorder(item)"
          >
            <div class="flex items-start gap-3">
              <div class="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <i class="fas fa-receipt"></i>
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between gap-3">
                  <div class="truncate text-sm font-bold text-white">
                    {{ item.girl_name || '-' }} · {{ item.identity || '-' }}
                  </div>
                  <div class="shrink-0 text-sm font-bold text-yellow-300">￥{{ item.price ?? '-' }}</div>
                </div>
                <div class="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span class="rounded-full border border-slate-700/50 bg-slate-900/40 px-2 py-0.5">
                    {{ item.package_name || '未命名套餐' }}
                  </span>
                  <span class="rounded-full border border-slate-700/50 bg-slate-900/40 px-2 py-0.5">
                    {{ item.order_status || '服务结束' }}
                  </span>
                </div>
              </div>
              <div class="shrink-0 text-xs text-slate-500 group-hover:text-slate-300">
                <i class="fas fa-chevron-right"></i>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Reorder modal -->
    <div v-if="currentView === 'reorder' && selectedOrder" class="absolute inset-0 z-[5100] flex items-center justify-center bg-black/70 p-4">
      <div class="w-full max-w-xl overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900/95 to-black/90 shadow-2xl shadow-blue-500/10">
        <div class="flex items-center gap-3 border-b border-slate-700/50 px-5 py-4">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            <i class="fas fa-shopping-cart"></i>
          </div>
          <div class="min-w-0 flex-1">
            <div class="truncate text-base font-bold text-white">确认订单</div>
            <div class="text-xs text-slate-400">{{ selectedOrder.package_name || '未命名套餐' }}</div>
          </div>
          <button
            class="rounded-xl border border-slate-700/50 bg-slate-800/50 px-3 py-2 text-sm text-slate-200 hover:border-blue-500/30 hover:bg-slate-700/50"
            @click="backToList"
          >
            <i class="fas fa-arrow-left"></i>
            <span class="ml-2">返回</span>
          </button>
        </div>

        <div class="space-y-4 p-5">
          <div class="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-4">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="truncate text-sm font-bold text-white">
                  {{ selectedOrder.girl_name || '-' }} · {{ selectedOrder.identity || '-' }}
                </div>
                <div class="mt-1 text-xs text-slate-400">{{ selectedOrder.package_name || '未命名套餐' }}</div>
              </div>
              <div class="shrink-0 text-sm font-bold text-yellow-300">￥{{ selectedOrder.price ?? '-' }}</div>
            </div>
            <div v-if="currentOrderFeatures.length" class="mt-3 flex flex-wrap gap-2">
              <span
                v-for="tag in currentOrderFeatures.slice(0, 6)"
                :key="tag"
                class="rounded-full border border-slate-700/50 bg-slate-900/40 px-2 py-0.5 text-xs text-slate-300"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div class="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-3">
              <div class="text-[11px] text-slate-400">好感度</div>
              <div class="mt-1 text-sm font-bold text-white">{{ getNestedValue(selectedOrder?.originalData, '心理状态.好感度', '-') }}</div>
            </div>
            <div class="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-3">
              <div class="text-[11px] text-slate-400">怀孕几率</div>
              <div class="mt-1 text-sm font-bold text-white">
                {{ formatPregnancyChance(getNestedValue(selectedOrder?.originalData, '性经验.怀孕几率', '-')) }}
              </div>
            </div>
            <div class="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-3">
              <div class="text-[11px] text-slate-400">下单次数</div>
              <div class="mt-1 text-sm font-bold text-white">{{ getNestedValue(selectedOrder?.originalData, '性经验.下单次数', '-') }}</div>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-1">
            <button
              class="rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm text-slate-200 hover:border-blue-500/30 hover:bg-slate-700/50"
              @click="backToList"
            >
              取消
            </button>
            <button
              class="rounded-xl border border-blue-400/30 bg-gradient-to-r from-blue-500 to-violet-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:from-blue-600 hover:to-violet-700"
              @click="openRemarkModal"
            >
              再次下单
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- remark modal -->
    <div v-if="showRemarkModal" class="absolute inset-0 z-[5200] flex items-center justify-center bg-black/70 p-4" @click.self="closeRemarkModal">
      <div class="w-full max-w-xl overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900/95 to-black/90 shadow-2xl shadow-blue-500/10">
        <div class="flex items-center justify-between gap-3 border-b border-slate-700/50 px-5 py-4">
          <div class="text-base font-bold text-white">玩法和备注</div>
          <button class="rounded-xl border border-slate-700/50 bg-slate-800/50 px-3 py-2 text-sm text-slate-200 hover:border-blue-500/30 hover:bg-slate-700/50" @click="closeRemarkModal">
            <i class="fas fa-times"></i>
            <span class="ml-2">关闭</span>
          </button>
        </div>

        <div class="space-y-4 p-5">
          <div v-if="currentOrderFeatures.length" class="flex flex-wrap gap-2">
            <button
              v-for="feature in currentOrderFeatures"
              :key="feature"
              class="rounded-full border border-slate-700/50 bg-slate-900/40 px-3 py-1 text-xs text-slate-200 hover:border-blue-500/40 hover:bg-slate-800/60"
              @click="addFeatureToRemark(feature)"
            >
              {{ feature }}
            </button>
          </div>

          <textarea
            ref="remarkTextarea"
            v-model="orderRemark"
            class="h-28 w-full rounded-2xl border border-slate-700/50 bg-slate-950/40 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500/40"
            placeholder="可输入特殊要求，如服装、场景、认知等..."
          ></textarea>

          <div class="flex items-center justify-end gap-3">
            <button class="rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm text-slate-200 hover:border-blue-500/30 hover:bg-slate-700/50" @click="closeRemarkModal">取消</button>
            <button
              class="rounded-xl border border-blue-400/30 bg-gradient-to-r from-blue-500 to-violet-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:from-blue-600 hover:to-violet-700"
              @click="confirmOrder"
            >
              发送下单指令
            </button>
          </div>
          <div v-if="copiedHint" class="text-xs text-slate-400">
            <i class="fas fa-info-circle text-blue-400"></i>
            {{ copiedHint }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { historyOverlayOpen } from '../shared/uiState';
import { filterCompletedOrders, loadOrdersFromMVU, readCachedOrders } from '../shared/serviceOrders';
import { getNestedValue } from '../utils';

const loading = ref(false);
const errorMessage = ref('');

const historyItems = ref<any[]>([]);
const selectedOrder = ref<any>(null);
const currentView = ref<'list' | 'reorder'>('list');

const showRemarkModal = ref(false);
const orderRemark = ref('');
const remarkTextarea = ref<HTMLTextAreaElement | null>(null);
const copiedHint = ref('');

function closeAll() {
  historyOverlayOpen.value = false;
  selectedOrder.value = null;
  currentView.value = 'list';
  showRemarkModal.value = false;
  orderRemark.value = '';
  copiedHint.value = '';
}

function backToList() {
  selectedOrder.value = null;
  currentView.value = 'list';
  showRemarkModal.value = false;
  orderRemark.value = '';
  copiedHint.value = '';
}

function formatPregnancyChance(value: any): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'string' && value.includes('%')) return value;
  const num = Number(value);
  if (!Number.isFinite(num)) return '-';
  const clamped = Math.min(100, Math.max(0, num));
  return `${Math.round(clamped * 100) / 100}%`;
}

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

const currentOrderFeatures = computed(() => {
  if (!selectedOrder.value) return [];
  const raw = selectedOrder.value.features || extractOrderFeatures(selectedOrder.value.originalData);
  const list = Array.isArray(raw) ? raw : typeof raw === 'string' ? raw.split(/\s*,\s*|\s+/).filter(Boolean) : [];
  return list;
});

function openReorder(item: any) {
  if (!item || typeof item !== 'object') return;
  selectedOrder.value = item;
  currentView.value = 'reorder';
}

function openRemarkModal() {
  if (!selectedOrder.value) return;
  copiedHint.value = '';
  showRemarkModal.value = true;
  nextTick(() => remarkTextarea.value?.focus());
}

function closeRemarkModal() {
  showRemarkModal.value = false;
  orderRemark.value = '';
}

function addFeatureToRemark(feature: string) {
  if (!feature) return;
  const next = orderRemark.value ? `${orderRemark.value} ${feature}` : feature;
  orderRemark.value = next;
  nextTick(() => remarkTextarea.value?.focus());
}

function sendToAI(message: string) {
  const fullCommand = `${message} | /trigger await=true`;
  if (typeof (window as any).triggerSlash !== 'undefined') {
    try {
      (window as any).triggerSlash(fullCommand);
      return true;
    } catch (e) {
      console.error('[HistoryOverlay] 执行 triggerSlash 出错:', e);
      return false;
    }
  }
  return false;
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // 兼容旧环境
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

async function confirmOrder() {
  if (!selectedOrder.value) return;
  const pkg = selectedOrder.value.package_name || '未知套餐';
  const girl = selectedOrder.value.girl_name || '未知';
  const identity = selectedOrder.value.identity || '未知';
  const age = getNestedValue(selectedOrder.value?.originalData, '基础信息.年龄', '-');
  const originPrice = selectedOrder.value.price;
  const finalPrice = originPrice ?? '-';
  const remark = orderRemark.value.trim() || '无';

  const text = `再次下单：${girl}，${age}，${identity}，${pkg}，订单价格：￥${finalPrice}。备注：${remark}`;
  const cmd = `/send ${text}`;

  const ok = sendToAI(cmd);
  if (!ok) {
    const copied = await copyToClipboard(`${cmd} | /trigger await=true`);
    copiedHint.value = copied ? '未检测到 triggerSlash，已复制指令到剪贴板。' : '未检测到 triggerSlash，且复制失败，请手动复制指令。';
  } else {
    copiedHint.value = '已发送下单指令。';
  }

  closeRemarkModal();
  backToList();
}

async function refreshHistory() {
  loading.value = true;
  errorMessage.value = '';
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
      price: order.套餐?.折后价格 || order.套餐?.套餐价格 || 0,
      features: extractOrderFeatures(order.originalData),
      originalData: order.originalData,
    }));
  } catch (e: any) {
    console.error('[HistoryOverlay] 获取订单失败，尝试缓存:', e);
    errorMessage.value = e?.message || '获取订单失败';
    const cached = readCachedOrders();
    const completed = filterCompletedOrders(cached);
    historyItems.value = completed.map(order => ({
      id: order.id,
      girl_name: order.基础信息?.姓名 || '未知',
      identity: order.基础信息?.身份 || '未知',
      package_name: order.套餐?.套餐名称 || '未知套餐',
      order_time: '历史订单',
      order_status: order.status || '服务结束',
      price: order.套餐?.折后价格 || order.套餐?.套餐价格 || 0,
      features: extractOrderFeatures(order.originalData),
      originalData: order.originalData,
    }));
  } finally {
    loading.value = false;
  }
}

watch(
  () => historyOverlayOpen.value,
  async open => {
    if (open) await refreshHistory();
  },
);

onMounted(() => {
  // 预加载一次，避免首次打开空白
  refreshHistory().catch(() => {});
});
</script>

