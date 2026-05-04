import { teleportStyle } from '@util/script';
import { initRenderer, bindBranchClickAppender } from './render';
import { getThemeSelection } from './state';
import { toggleThemeModal } from './theme-modal';
import { applyThemeVars, removeThemeVars } from './theme-style';
import type { RenderContext } from './types';
import './styles/index.css';

const BUTTON_NAME = '蜃灵 · 主题';

$(() => {
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

  let context: RenderContext = {
    selection: getThemeSelection(),
  };
  console.info('[蜃灵统一渲染][boot] selection loaded', context.selection);
  applyThemeVars(context.selection);

  const renderer = initRenderer(() => context);
  const clickBinding = bindBranchClickAppender();
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

  toastr.success('蜃灵统一渲染已加载（原位渲染）');

  $(window).on('pagehide', () => {
    console.info('[蜃灵统一渲染][boot] pagehide cleanup');
    renderer.destroy();
    clickBinding.destroy();
    removeThemeVars();
    teleported.destroy();
    const w = window.parent || window;
    w.document.getElementById('sl-theme-modal')?.remove();
  });
});
