import { waitUntil } from 'async-wait-until';
import App from './App.vue';
import './global.css';

$(() => {
  errorCatched(async () => {
    await waitUntil(() => {
      try {
        getCurrentMessageId();
        return true;
      } catch {
        return false;
      }
    });

    createApp(App).mount('#app');
  })();
});
