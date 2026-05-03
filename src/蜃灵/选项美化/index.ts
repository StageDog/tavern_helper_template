// ============================================================================
// 蜃灵 · 选项美化 · 脚本入口
// ----------------------------------------------------------------------------
// 工作机制：
//   1. 注册一组类别美化模块（modules/）—— 每个模块声明自己关心哪种 HTML 标签。
//   2. 监听消息渲染事件，把消息 DOM 交给所有模块 process。
//   3. 注册一个 QR 按钮「蜃灵 · 主题」，点击打开主题切换浮窗。
//   4. 把样式 teleport 到酒馆主页面 head，让脚本注入的元素能正确渲染。
//
// 添加新类别美化：
//   - 在 modules/ 下新建一个 .ts 文件，导出一个 SkinModule。
//   - 在下方 registerModule 处加一行 import + register。
// ============================================================================

import { teleportStyle } from '@util/script';
import { branchesModule } from './modules/branches';
import { registerModule } from './registry';
import { initRender } from './render';
import { applyTheme, getTheme } from './theme';
import { toggleSwitcher } from './theme-switcher';
import './styles/古卷书斋.css';

const QR_BUTTON_NAME = '蜃灵 · 主题';

$(() => {
  // ── ① 把脚本内联的 <style> 复制到酒馆主页面 head，让选择器生效 ──
  const teleported = teleportStyle(window.parent.document.head);

  // ── ② 注册类别美化模块（每加一种类别就在这儿多加一行）───────
  registerModule(branchesModule);
  // registerModule(otherModule);

  // ── ③ 监听消息渲染，把 DOM 派发给所有模块 ─────────────────
  const render = initRender();

  // ── ④ 注册 QR 按钮，点击切换主题浮窗 ──────────────────────
  appendInexistentScriptButtons([{ name: QR_BUTTON_NAME, visible: true }]);
  eventOn(getButtonEvent(QR_BUTTON_NAME), () => {
    toggleSwitcher();
  });

  // ── ⑤ 启动时把当前主题应用一次（确保已存在的元素同步色板）──
  applyTheme(getTheme());

  // ── ⑥ 卸载脚本时清理 ─────────────────────────────────────
  $(window).on('pagehide', () => {
    render.destroy();
    teleported.destroy();
    // 把脚本注入的所有元素一并清掉，避免主题样式失效后留下骨架
    const w = window.parent || window;
    w.document.querySelectorAll('[data-gjsz-skin]').forEach(el => el.remove());
  });
});
