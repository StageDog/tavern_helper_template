import { waitUntil } from 'async-wait-until';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import './global.css';

$(async () => {
  await waitUntil(() => {
    try {
      getCurrentMessageId();
      return true;
    } catch {
      return false;
    }
  });
  await waitGlobalInitialized('Mvu');
  await waitUntil(() => _.has(getVariables({ type: 'message', message_id: getCurrentMessageId() }), 'stat_data'));
  createApp(App).use(createPinia()).mount('#app');
});
