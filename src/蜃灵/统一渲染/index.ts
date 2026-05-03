import { teleportStyle } from '@util/script';
import { initRenderer, bindBranchClickAppender } from './render';
import { getThemeSelection } from './state';
import { toggleThemeModal } from './theme-modal';
import { applyThemeVars, removeThemeVars } from './theme-style';
import type { RenderContext } from './types';
import './styles/index.css';

const BUTTON_NAME = '蜃灵 · QR主题';

$(() => {
  const teleported = teleportStyle(window.parent.document.head);
  let context: RenderContext = {
    selection: getThemeSelection(),
  };
  applyThemeVars(context.selection);

  const renderer = initRenderer(() => context);
  const clickBinding = bindBranchClickAppender();

  appendInexistentScriptButtons([{ name: BUTTON_NAME, visible: true }]);
  eventOn(getButtonEvent(BUTTON_NAME), () => {
    toggleThemeModal(next => {
      context = next;
      applyThemeVars(context.selection);
      renderer.rerenderAll();
    });
  });

  toastr.success('蜃灵统一渲染已加载（原位渲染）');

  $(window).on('pagehide', () => {
    renderer.destroy();
    clickBinding.destroy();
    removeThemeVars();
    teleported.destroy();
    const w = window.parent || window;
    w.document.getElementById('sl-theme-modal')?.remove();
  });
});
