import type { Ref } from 'vue';

/**
 * 数字滚动：源值变化时在 ~500ms 内滚动到新值。
 * 返回 { text: 格式化显示串, cls: 'win'|'lose'|'' 反馈类（绿闪/红抖，动画由 theme.css 关键帧提供） }
 */
export function useCountUp(source: () => number): { text: Ref<string>; cls: Ref<string> } {
  const display = ref(source());
  const cls = ref('');
  let rafId = 0;
  let clsTimer = 0;

  watch(source, (to, from) => {
    cancelAnimationFrame(rafId);
    const start = performance.now();
    const begin = display.value;
    const duration = 500;

    cls.value = to > from ? 'win' : to < from ? 'lose' : '';
    clearTimeout(clsTimer);
    clsTimer = window.setTimeout(() => (cls.value = ''), 700);

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      display.value = Math.round(begin + (to - begin) * eased);
      if (t < 1) rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
  });

  onUnmounted(() => {
    cancelAnimationFrame(rafId);
    clearTimeout(clsTimer);
  });

  return { text: computed(() => display.value.toLocaleString()) as unknown as Ref<string>, cls };
}
