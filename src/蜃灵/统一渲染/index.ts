import { teleportStyle } from '@util/script';
import { initRenderer, bindBranchClickAppender } from './render';
import { bindMusicPlayer } from './music-player';
import { ensureCleanupRegex, disableCleanupRegex } from './regex-bootstrap';
import { getThemeSelection } from './state';
import { toggleThemeModal } from './theme-modal';
import { applyThemeVars, removeThemeVars } from './theme-style';
import type { RenderContext } from './types';
import './styles/index.css';

const BUTTON_NAME = '蜃灵 · 主题';

$(async () => {
  console.info('[蜃灵统一渲染][boot] script start', {
    scriptId: getScriptId(),
    scriptName: getScriptName(),
    iframeName: getIframeName(),
    url: window.location.href,
  });

  const teleported = teleportStyle(window.parent.document.head);
  const parentHasCss = window.parent.document.head.querySelectorAll('style').length;
  console.info('[蜃灵统一渲染][boot] teleportStyle done', {
    parentHeadStyleCount: parentHasCss,
  });

  // 注册并启用预设清理正则；同时禁用旧版美化正则避免冲突。
  // 已是最终态时内部跳过 update,不会触发 CHAT_CHANGED。
  await ensureCleanupRegex();

  let context: RenderContext = {
    selection: getThemeSelection(),
  };
  console.info('[蜃灵统一渲染][boot] selection loaded', context.selection);
  applyThemeVars(context.selection);

  const renderer = initRenderer(() => context);
  const clickBinding = bindBranchClickAppender();
  const musicBinding = bindMusicPlayer();
  console.info('[蜃灵统一渲染][boot] renderer initialized');

  appendInexistentScriptButtons([{ name: BUTTON_NAME, visible: true }]);
  console.info('[蜃灵统一渲染][boot] button registered', { button: BUTTON_NAME });
  eventOn(getButtonEvent(BUTTON_NAME), () => {
    console.info('[蜃灵统一渲染][ui] button clicked');
    toggleThemeModal(next => {
      context = next;
      console.info('[蜃灵统一渲染][ui] selection changed', context.selection);
      applyThemeVars(context.selection);
      renderer.rerenderAll();
    });
  });

  toastr.success('蜃灵统一渲染已加载（固定位置）');

  $(window).on('pagehide', e => {
    // persisted=true 表示页面被放进 BFCache(临时挂起,可能恢复),不应该禁用正则。
    // persisted=false 才是真正销毁(脚本被禁用 / 关浏览器),才禁用正则。
    const persisted = (e.originalEvent as PageTransitionEvent | undefined)?.persisted ?? false;
    console.info('[蜃灵统一渲染][boot] pagehide cleanup', { persisted });
    if (!persisted) {
      // fire-and-forget: postMessage 已同步入队到父窗口,即使 iframe 销毁请求也已发出
      void disableCleanupRegex();
    }
    renderer.destroy();
    clickBinding.destroy();
    musicBinding.destroy();
    removeThemeVars();
    teleported.destroy();
    const w = window.parent || window;
    w.document.getElementById('sl-theme-modal')?.remove();
  });
});
