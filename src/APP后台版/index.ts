import { createApp } from 'vue';
import $ from 'jquery';
import _ from 'lodash';
import router from './界面';
import app from './app.vue';
// import '@fortawesome/fontawesome-free/css/all.min.css';
// import 'toastr/build/toastr.min.css';

// 给外部脚本的“就绪探针”一个确定初值（避免出现 APP_READY undefined）
try {
  (window as any).APP_READY = false;
} catch {
  // ignore
}
try {
  (window.parent as any).APP_READY = false;
} catch {
  // ignore
}
try {
  (window.top as any).APP_READY = false;
} catch {
  // ignore
}

// 确保全局可用 jQuery（部分代码/依赖使用全局 $）
(window as any).$ = $;
(window as any).jQuery = $;

// 确保全局可用 lodash（酒馆环境和部分代码/依赖使用全局 _）
(window as any)._ = _;

// Vue Router必须在全局作用域创建，不能放在$(() => {})中
const vueApp = createApp(app);
vueApp.use(router);

import { logger, perfLogger, mvuLogger, sysLogger } from './logger';

// 性能监控标记
const perfStartTime = performance.now();

// Web Vitals性能监控
const initWebVitalsMonitoring = () => {
  try {
    // 监控LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver(entryList => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      perfLogger.perf(`LCP: ${lastEntry.startTime.toFixed(2)}ms`, lastEntry);
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

    // 监控FID (First Input Delay) - 通过Event Timing API
    const fidObserver = new PerformanceObserver(entryList => {
      for (const entry of entryList.getEntries()) {
        if (entry.entryType === 'first-input') {
          const firstInput = entry as PerformanceEventTiming;
          const fid = firstInput.processingStart - firstInput.startTime;
          perfLogger.perf(`FID: ${fid.toFixed(2)}ms`, firstInput);
        }
      }
    });
    fidObserver.observe({ type: 'first-input', buffered: true });

    // 监控CLS (Cumulative Layout Shift)
    let clsValue = 0;
    const clsEntries: LayoutShift[] = [];
    const clsObserver = new PerformanceObserver(entryList => {
      for (const entry of entryList.getEntries()) {
        if (entry.entryType === 'layout-shift') {
          const layoutShift = entry as LayoutShift;
          if (!layoutShift.hadRecentInput) {
            clsEntries.push(layoutShift);
            clsValue += layoutShift.value;
            perfLogger.perf(`CLS累计: ${clsValue.toFixed(4)}`, layoutShift);
          }
        }
      }
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });

    // 监控长任务 (Long Tasks)
    const longTaskObserver = new PerformanceObserver(entryList => {
      for (const entry of entryList.getEntries()) {
        if (entry.duration > 50) {
          // 超过50ms的任务
          perfLogger.perf(`长任务检测: ${entry.duration.toFixed(2)}ms`, entry);
        }
      }
    });
    longTaskObserver.observe({ type: 'longtask', buffered: true });

    perfLogger.log('Web Vitals监控已启动');
  } catch (error) {
    perfLogger.warn('Web Vitals监控初始化失败:', error);
  }
};

// 内存使用监控（仅Chrome支持）
const initMemoryMonitoring = () => {
  try {
    // 检查performance.memory API是否可用
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      perfLogger.perf(
        `初始化内存状态: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB / ${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      );

      // 定期监控内存使用
      setInterval(() => {
        const mem = (performance as any).memory;
        const usedMB = mem.usedJSHeapSize / 1024 / 1024;
        const totalMB = mem.totalJSHeapSize / 1024 / 1024;
        const percentage = (usedMB / totalMB) * 100;
        const percentageText = percentage.toFixed(1);

        // 仅在高内存使用或增长时记录
        if (usedMB > 50 || percentage > 80) {
          perfLogger.warn(`内存使用较高: ${usedMB.toFixed(2)}MB/${totalMB.toFixed(2)}MB (${percentageText}%)`);
        }
      }, 30000); // 每30秒检查一次

      perfLogger.log('内存监控已启动');
    } else {
      perfLogger.log('performance.memory API不可用');
    }
  } catch (error) {
    perfLogger.warn('内存监控初始化失败:', error);
  }
};

// 预加载关键路由组件
const preloadCriticalRoutes = async () => {
  try {
    // 预加载用户最可能访问的页面
    const criticalRoutes = ['/service', '/play'];
    await Promise.all(
      criticalRoutes.map(path => {
        const route = router.resolve(path);
        // Vue Router会自动处理组件预加载
        return route;
      }),
    );
    perfLogger.log('关键路由预加载完成');
  } catch (error) {
    perfLogger.warn('路由预加载失败:', error);
  }
};

// 预加载资源
const preloadCriticalResources = async () => {
  try {
    // 预加载关键资源
    const resources: string[] = [
      // 可以添加图片、字体等关键资源
    ];

    if (resources.length === 0) return;

    await Promise.all(
      resources.map(url => {
        return new Promise((resolve, reject) => {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = url;
          link.onload = resolve;
          link.onerror = reject;
          document.head.appendChild(link);
        });
      }),
    );
    perfLogger.log('关键资源预加载完成');
  } catch (error) {
    perfLogger.warn('资源预加载失败:', error);
  }
};

// 等待MVU框架初始化（带超时和错误处理）
const waitForMvu = async (timeout = 5000) => {
  // 非酒馆环境可能没有 waitGlobalInitialized，全局缺失则直接降级
  if (typeof (window as any).waitGlobalInitialized !== 'function') {
    mvuLogger.info('检测到非酒馆环境，跳过 MVU 初始化');
    return null;
  }

  return Promise.race([
    waitGlobalInitialized('Mvu'),
    new Promise((_, reject) => setTimeout(() => reject(new Error('MVU初始化超时')), timeout)),
  ]).catch(err => {
    mvuLogger.warn('初始化失败，使用降级方案:', err);
    return null; // 返回null表示降级
  });
};

// 初始化应用
const initApp = async () => {
  try {
    // 并行执行所有初始化任务
    const initTasks = Promise.all([
      waitForMvu(), // MVU初始化（带超时）
      preloadCriticalRoutes(), // 路由预加载
      preloadCriticalResources(), // 资源预加载
    ]);

    // 等待所有初始化任务完成
    const [mvuReady] = await initTasks;

    // 性能监控默认关闭（多 iframe 会显著增大开销）；需要时手动开启：localStorage.setItem('app-perf-monitor','1')
    const enablePerfMonitoring = (() => {
      try {
        return localStorage.getItem('app-perf-monitor') === '1';
      } catch {
        return false;
      }
    })();
    if (enablePerfMonitoring) {
      initWebVitalsMonitoring();
      initMemoryMonitoring();
    }

    // 记录初始化耗时
    const initTime = performance.now() - perfStartTime;
    perfLogger.log(`应用初始化完成，耗时: ${initTime.toFixed(2)}ms`);

    // 根据MVU状态显示不同消息
    if (mvuReady) {
      sysLogger.log(`界面加载成功！(${initTime.toFixed(0)}ms)`);
    } else {
      sysLogger.warn('部分功能可能不可用 (MVU未就绪)');
    }

    // 挂载Vue应用
    vueApp.mount('#app');

    // 标记 APP 就绪（给外部脚本/插件识别用）
    try {
      (window as any).APP_READY = true;
    } catch {
      // ignore
    }
    try {
      (window.parent as any).APP_READY = true;
    } catch {
      // ignore
    }
    try {
      (window.top as any).APP_READY = true;
    } catch {
      // ignore
    }
    try {
      if (typeof (window as any).eventEmit === 'function' && typeof (window as any).tavern_events !== 'undefined') {
        // 通知酒馆侧“APP_READY”事件（若可用）
        (window as any).eventEmit((window as any).tavern_events.APP_READY);
      }
    } catch {
      // ignore
    }

    // 记录挂载耗时
    const mountTime = performance.now() - perfStartTime;
    perfLogger.log(`总启动时间: ${mountTime.toFixed(2)}ms`);
  } catch (err) {
    sysLogger.error('应用启动失败:', err);
    // 生产环境可能需要更友好的提示，但这里主要记录日志
  }
};

// 正确使用 jQuery 进行初始化（不是 DOMContentLoaded）
$(() => {
  // 初始化主题 - 移动到Vue组件的onMounted中处理，避免重复设置
  initApp();
});

// 正确使用 jQuery 进行卸载时清理
$(window).on('pagehide', () => {
  const unloadTime = performance.now() - perfStartTime;
  perfLogger.log(`应用运行时间: ${unloadTime.toFixed(2)}ms`);
  sysLogger.log('界面已卸载');
});

// 全局错误处理 - 捕获未处理的Promise错误
window.addEventListener('unhandledrejection', event => {
  sysLogger.error('未处理的Promise错误:', event.reason);
  try {
    window.dispatchEvent(
      new CustomEvent('app-fatal-error', {
        detail: { type: 'unhandledrejection', reason: event.reason },
      }),
    );
  } catch {
    // ignore
  }
});

// 全局错误处理 - 捕获JavaScript运行时错误
window.addEventListener('error', event => {
  sysLogger.error('JavaScript运行时错误:', event.error);
  try {
    window.dispatchEvent(
      new CustomEvent('app-fatal-error', {
        detail: { type: 'error', error: event.error, message: event.message, filename: event.filename, lineno: event.lineno },
      }),
    );
  } catch {
    // ignore
  }
});
