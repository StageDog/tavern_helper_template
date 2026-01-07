import App from './App.vue';
import './global.css';

async function waitUntil(
  predicate: () => boolean,
  { intervalMs = 50, timeoutMs = 5000 }: { intervalMs?: number; timeoutMs?: number } = {},
): Promise<void> {
  const start = Date.now();
  while (!predicate()) {
    if (Date.now() - start > timeoutMs) {
      throw new Error('[角色卡示例/状态栏] waitUntil timeout');
    }
    await new Promise<void>(resolve => setTimeout(resolve, intervalMs));
  }
}

$(async () => {
  await waitGlobalInitialized('Mvu');
  await waitUntil(() => _.has(getVariables({ type: 'message' }), 'stat_data'));
  createApp(App).use(createPinia()).mount('#app');
});
