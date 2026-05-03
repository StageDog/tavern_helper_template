// ============================================================================
// 蜃灵 · 选项美化 · HTML 转义小工具
// ============================================================================

const MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(s: string): string {
  return String(s).replace(/[&<>"']/g, c => MAP[c] || c);
}

export function escapeAttr(s: string): string {
  return escapeHtml(s);
}
