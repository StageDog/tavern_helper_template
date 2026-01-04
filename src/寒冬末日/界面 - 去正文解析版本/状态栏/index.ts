import App from './App.vue';
import './global.css';

// 声明全局类型
declare const Mvu: {
  events: {
    VARIABLE_UPDATE_ENDED: string;
    VARIABLE_INITIALIZED: string;
  };
  getMvuData: (options: { type: 'message'; message_id: number }) => { stat_data: Record<string, any> };
};
declare const eventOn: <T extends string>(event_type: T, listener: (...args: any[]) => void) => { stop: () => void };

// 等待依赖注入的辅助函数
async function waitForDependencies(maxWait = 15000): Promise<void> {
  const checkInterval = 100;
  const startTime = Date.now();

  // 检查关键依赖是否可用
  const checkDeps = (): boolean => {
    return (
      typeof getCurrentMessageId === 'function' &&
      typeof getChatMessages === 'function' &&
      typeof Mvu !== 'undefined' &&
      typeof eventOn === 'function'
    );
  };

  // 先快速检查一次
  if (checkDeps()) return;

  // 等待依赖注入
  while (Date.now() - startTime < maxWait) {
    await new Promise(resolve => setTimeout(resolve, checkInterval));
    if (checkDeps()) return;
  }

  console.warn('[状态栏] 等待依赖注入超时，部分功能可能不可用');
}

$(async () => {
  // 等待所有依赖注入完成
  await waitForDependencies();

  // 再等待 MVU 框架初始化完成
  if (typeof waitGlobalInitialized === 'function') {
    await waitGlobalInitialized('Mvu');
  }

  // 挂载 Vue 应用
  const app = createApp(App);
  app.use(createPinia());
  app.mount('#app');
});

// 卸载时清理资源
$(window).on('pagehide', () => {
  eventClearAll();
});
