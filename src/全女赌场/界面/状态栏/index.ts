import App from './App.vue';
import './global.css';
import { prepareMvuInterface, renderInterfaceError } from '../boot';

$(async () => {
  try {
    await prepareMvuInterface();
    createApp(App).use(createPinia()).mount('#app');
  } catch (error) {
    console.error('[全女赌场/状态栏] 前端启动失败', error);
    renderInterfaceError(error);
  }
});
