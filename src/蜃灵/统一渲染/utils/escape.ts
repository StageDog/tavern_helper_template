const HTML_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(input: string): string {
  return String(input).replace(/[&<>"']/g, char => HTML_MAP[char] ?? char);
}

export function nl2br(input: string): string {
  return escapeHtml(input).replace(/\n/g, '<br>');
}
