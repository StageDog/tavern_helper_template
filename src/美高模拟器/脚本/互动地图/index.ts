// ============================================================================
// 互动地图 —— 脚本入口
// ============================================================================
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import { createScriptIdIframe, teleportStyle } from '@util/script';
import App from './components/App.vue';
import { useMapStore } from './store';

$(() => {
  const pinia = createPinia();
  const app = createApp(App).use(pinia);

  // ── 创建 QR 式脚本按钮 ─────────────────────────────
  appendInexistentScriptButtons([{ name: '互动地图', visible: true }]);

  // ── 创建 iframe 并挂载 Vue ─────────────────────────
  const $iframe = createScriptIdIframe()
    .css({
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      border: 'none',
      'z-index': '20000',
      'pointer-events': 'none',
      display: 'none',
    })
    .appendTo(window.parent.document.body)
    .on('load', async () => {
      const doc = $iframe[0].contentDocument!;
      teleportStyle(doc.head);

      // 设置 iframe body 基础样式
      $(doc.body).css({
        margin: '0',
        padding: '0',
        overflow: 'hidden',
        background: 'transparent',
        'font-family': "'Inter', 'Noto Sans SC', sans-serif",
      });

      app.mount(doc.body);

      // 初始化 store
      const store = useMapStore();
      store.init();

      // ── 自定义 CSS 注入 ────────────────────────────
      // 必须把 <style> 注入到 iframe 的 document.head 中，
      // 注入到主窗口 head 是无效的（作用不到 iframe 里的 DOM）
      const styleEl = doc.createElement('style');
      styleEl.id = 'imap-custom-style';
      doc.head.appendChild(styleEl);
      watchEffect(() => {
        styleEl.textContent = store.customCSS || '';
      });
    });

  // ── 按钮点击 → 切换面板 ─────────────────────────────
  eventOn(getButtonEvent('互动地图'), () => {
    const store = useMapStore();
    store.togglePanel();

    if (store.panelVisible) {
      $iframe.css({ display: 'block', 'pointer-events': 'auto' });
    } else {
      $iframe.css({ display: 'none', 'pointer-events': 'none' });
    }
  });

  // 当面板 state 变化时同步 iframe 显隐
  watchEffect(() => {
    const store = useMapStore();
    if (store.panelVisible) {
      $iframe.css({ display: 'block', 'pointer-events': 'auto' });
    } else {
      $iframe.css({ display: 'none', 'pointer-events': 'none' });
    }
  });

  // ── 卸载 ───────────────────────────────────────────
  $(window).on('pagehide', () => {
    app.unmount();
    $iframe.remove();
  });
});
