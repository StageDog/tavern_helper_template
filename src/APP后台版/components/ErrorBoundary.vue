<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-content">
      <i class="fas fa-exclamation-triangle"></i>
      <h3>页面出现错误</h3>
      <p>{{ errorMessage }}</p>
      <button class="retry-btn" @click="retry"><i class="fas fa-redo"></i> 重新加载</button>
    </div>
  </div>
  <slot v-else></slot>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured, onMounted, onUnmounted } from 'vue';

const hasError = ref(false);
const errorMessage = ref('');
const error = ref<Error | null>(null);

// 捕获子组件错误
onErrorCaptured((err: Error) => {
  console.error('[错误边界] 捕获到组件错误:', err);
  error.value = err;
  hasError.value = true;
  errorMessage.value = err.message || '发生了未知错误';
  console.log('[系统提示] 页面出现错误，已自动恢复');
  return false; // 阻止错误继续传播
});

function onFatalErrorEvent(event: any) {
  try {
    const detail = event?.detail || {};
    const msg =
      detail?.message ||
      detail?.error?.message ||
      detail?.reason?.message ||
      (typeof detail?.reason === 'string' ? detail.reason : '') ||
      '发生了未知错误';
    console.error('[错误边界] 捕获到全局错误:', detail);
    error.value = detail?.error || detail?.reason || new Error(msg);
    hasError.value = true;
    errorMessage.value = msg;
  } catch (e) {
    // ignore
  }
}

onMounted(() => {
  window.addEventListener('app-fatal-error', onFatalErrorEvent as any);
});

onUnmounted(() => {
  window.removeEventListener('app-fatal-error', onFatalErrorEvent as any);
});

// 重试函数
const retry = () => {
  hasError.value = false;
  error.value = null;
  errorMessage.value = '';
  // 强制重新渲染
  window.location.reload();
};
</script>

<style lang="scss" scoped>
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: var(--bg-primary);
  padding: 40px 20px;

  .error-content {
    text-align: center;
    color: var(--text-secondary);

    i {
      font-size: 4rem;
      color: var(--accent-primary);
      margin-bottom: 20px;
      display: block;
    }

    h3 {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0 0 12px 0;
      color: var(--text-primary);
    }

    p {
      font-size: 0.9rem;
      color: var(--text-secondary);
      margin: 0 0 24px 0;
    }

    .retry-btn {
      background: linear-gradient(135deg, var(--accent-primary), var(--accent-dark));
      color: white;
      border: none;
      padding: 12px 32px;
      border-radius: 25px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s;
      display: inline-flex;
      align-items: center;
      gap: 8px;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(255, 195, 0, 0.4);
      }

      i {
        font-size: 1rem;
        margin: 0;
      }
    }
  }
}
</style>
