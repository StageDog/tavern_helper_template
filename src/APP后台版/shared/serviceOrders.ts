/**
 * 服务订单数据共享工具（APP后台版备份）
 * - 从 MVU 获取并规范化订单
 * - 写入/读取脚本变量缓存（最多 15 条，留新去旧）
 * - 提供活跃/已完成过滤
 */

// 缓存键：避免与其他脚本/界面冲突
const CACHE_KEY = 'app_backend_service_orders_cache';
const LEGACY_CACHE_KEYS = ['service_orders_cache'];
const CACHE_LIMIT = 15;

export interface ServiceOrder {
  id: string;
  status: string; // 订单状态
  基础信息: Record<string, any>;
  服装: Record<string, any>;
  性经验: Record<string, any>;
  服务统计: Record<string, any>;
  套餐: Record<string, any>;
  心理状态: Record<string, any>;
  身体特征: Record<string, any>;
  originalData: any;
  __cachedAt?: number;
}

function pickCacheVariableOptions(): any[] {
  // 优先按聊天维度缓存；在非酒馆/无聊天环境下再退到 global / localStorage
  return [{ type: 'chat' }, { type: 'global' }, { type: 'script' }];
}

function readCacheFromLocalStorage(): ServiceOrder[] {
  try {
    const raw =
      window.localStorage?.getItem(CACHE_KEY) ||
      LEGACY_CACHE_KEYS.map(k => window.localStorage?.getItem(k)).find(Boolean);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(Boolean)
      .sort((a, b) => (b.__cachedAt || 0) - (a.__cachedAt || 0))
      .slice(0, CACHE_LIMIT);
  } catch (e) {
    console.warn('[ServiceOrders] localStorage 读取缓存失败', e);
    return [];
  }
}

function readCache(): ServiceOrder[] {
  // 酒馆变量缓存
  for (const option of pickCacheVariableOptions()) {
    try {
      if (typeof (window as any).getVariables !== 'function') break;
      const vars = getVariables(option) || {};
      const cached =
        (vars as any)[CACHE_KEY] || LEGACY_CACHE_KEYS.map(k => (vars as any)[k]).find((v: any) => Array.isArray(v));
      if (!Array.isArray(cached)) continue;
      return cached
        .filter(Boolean)
        .sort((a, b) => (b.__cachedAt || 0) - (a.__cachedAt || 0))
        .slice(0, CACHE_LIMIT);
    } catch (e) {
      // 尝试下一种变量作用域
      continue;
    }
  }

  // 退化到 localStorage（便于本地/非酒馆环境调试）
  return readCacheFromLocalStorage();
}

function writeCache(list: ServiceOrder[]) {
  const withCap = [...list]
    .map((o, idx) => ({ ...o, __cachedAt: Date.now() + idx }))
    .sort((a, b) => (b.__cachedAt || 0) - (a.__cachedAt || 0))
    .slice(0, CACHE_LIMIT);

  // 酒馆变量缓存：不要用 replaceVariables（会覆盖整个变量表，导致其他页面/功能“空载”）
  for (const option of pickCacheVariableOptions()) {
    try {
      if (typeof (window as any).updateVariablesWith === 'function') {
        updateVariablesWith((vars: Record<string, any>) => {
          const next = vars && typeof vars === 'object' ? vars : {};
          (next as any)[CACHE_KEY] = withCap;
          return next;
        }, option);
        return;
      }
      if (typeof (window as any).insertOrAssignVariables === 'function') {
        insertOrAssignVariables({ [CACHE_KEY]: withCap }, option);
        return;
      }
    } catch (e) {
      // 尝试下一种变量作用域
      continue;
    }
  }

  // 退化到 localStorage
  try {
    window.localStorage?.setItem(CACHE_KEY, JSON.stringify(withCap));
  } catch (e) {
    console.warn('[ServiceOrders] localStorage 写入缓存失败', e);
  }
}

function normalizeOrder(order: any, idx: number): ServiceOrder {
  const normalizePercent = (val: any): string => {
    if (val === null || val === undefined || val === '') return '-';
    if (typeof val === 'string') {
      // 已经带 % 直接返回；纯数字字符串则转数字再处理
      if (val.includes('%')) return val.trim();
      const num = Number(val);
      if (!isNaN(num)) {
        if (num <= 1) return `${(num * 100).toFixed(0)}%`;
        if (num <= 100) return `${num.toFixed(0)}%`;
      }
      return val.trim();
    }
    if (typeof val === 'number') {
      if (val <= 1) return `${(val * 100).toFixed(0)}%`;
      if (val <= 100) return `${val.toFixed(0)}%`;
      return `${val}`;
    }
    return '-';
  };

  return {
    id: order.id || `order_${idx}`,
    status: order.订单状态 || '未知',
    基础信息: {
      姓名: order.基础信息?.姓名 || order.姓名 || '未知',
      身份: order.基础信息?.身份 || order.身份 || '未知',
      年龄: order.基础信息?.年龄 || order.年龄 || 0,
      描述: order.基础信息?.描述 || order.描述 || '',
    },
    服装: {
      上衣: order.服装?.上衣 || '',
      下装: order.服装?.下装 || '',
      内衣: order.服装?.内衣 || '',
      内裤: order.服装?.内裤 || '',
      丝袜: order.服装?.丝袜 || '',
      鞋子: order.服装?.鞋子 || '',
      配饰: order.服装?.配饰 || '',
    },
    性经验: {
      处女: order.性经验?.处女 || '-',
      性伴侣数量: order.性经验?.性伴侣数量 || '-',
      初次性行为对象: order.性经验?.初次性行为对象 || '-',
      怀孕几率: normalizePercent(order.性经验?.怀孕几率),
      下单次数: order.性经验?.下单次数 || 0,
    },
    服务统计: {
      本次服务性交次数: order.服务统计?.本次服务性交次数 || '-',
      内射次数: order.服务统计?.内射次数 || '-',
      订单状态: order.订单状态 || '未知',
      心跳: order.心跳 || order.服务统计?.心跳 || '-',
    },
    套餐: {
      套餐名称: order.套餐?.套餐名称 || order.套餐名称 || '未命名套餐',
      套餐价格: order.套餐?.套餐价格 || order.套餐价格 || 0,
      商品类型: order.套餐?.商品类型 || '未知',
      折后价格: order.套餐?.折后价格 || 0,
      玩法特色: order.套餐?.玩法特色 || [],
    },
    心理状态: {
      好感度: order.心理状态?.好感度 || 0,
      当前所想: order.心理状态?.当前所想 || '',
      兴奋度: order.心理状态?.兴奋度 || 0,
      性格类型: order.心理状态?.性格类型 || '',
    },
    身体特征: {
      三围: {
        描述: order.身体特征?.三围?.描述 || '',
        罩杯: order.身体特征?.三围?.罩杯 || '',
      },
      乳房: {
        形状: order.身体特征?.乳房?.形状 || '',
      },
      姿势: order.身体特征?.姿势 || '',
      胸部: order.身体特征?.胸部 || '',
      私处: order.身体特征?.私处 || '',
    },
    originalData: order,
  };
}

function extractOrdersFromMvuData(mvuData: any): ServiceOrder[] {
  const stat = mvuData?.stat_data || mvuData;
  const orders = stat?.['服务中的订单'] || stat?.服务中的订单;
  if (!orders) return [];

  // 兼容 Zod MVU：服务中的订单可能是对象而非数组（以订单号为键）
  const list = Array.isArray(orders)
    ? orders
    : typeof orders === 'object'
      ? Object.values(orders as Record<string, any>)
      : [];

  return list.map((o: any, idx: number) => normalizeOrder(o, idx));
}

export async function loadOrdersFromMVU(): Promise<ServiceOrder[]> {
  try {
    await waitGlobalInitialized('Mvu');

    const data = (() => {
      try {
        const currentId = getCurrentMessageId();
        if (typeof currentId === 'number' && currentId < 0) return null;
        for (let id = currentId; id >= 0; id--) {
          const d = Mvu.getMvuData({ type: 'message', message_id: id });
          if (d && d.stat_data) return d;
        }
      } catch (e) {
        // ignore
      }
      return Mvu.getMvuData({ type: 'message', message_id: 'latest' });
    })();

    if (!data) throw new Error('MVU 数据为空');

    const orders = extractOrdersFromMvuData(data);
    // “没有订单”不是致命错误：优先回退到缓存，否则返回空数组
    if (orders.length === 0) {
      const cached = readCache();
      return cached;
    }

    writeCache(orders);
    return orders;
  } catch (e) {
    console.error('[ServiceOrders] 获取 MVU 失败，使用缓存:', e);
    const cached = readCache();
    if (cached.length === 0) throw e;
    return cached;
  }
}

export function filterActiveOrders(orders: ServiceOrder[]) {
  return orders.filter(o => !String(o.status).includes('服务结束'));
}

export function filterCompletedOrders(orders: ServiceOrder[]) {
  return orders.filter(o => String(o.status).includes('服务结束'));
}

export function readCachedOrders() {
  return readCache();
}
