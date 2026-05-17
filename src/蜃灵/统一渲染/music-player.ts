// 全局单例音乐播放器
// 监听 .sl-music-btn 点击,跨消息只保留一个 audio,避免多个同时响

interface SlMusicState {
  keyword: string;
  btn: HTMLButtonElement | null;
  playId: number;
}

declare global {
  interface Window {
    _slMusicAudio?: HTMLAudioElement;
    _slMusicState?: SlMusicState;
    _slMusicCleanup?: () => void;
  }
}

const GD_API = 'https://music-api.gdstudio.xyz/api.php';
const VK_API = 'https://api.vkeys.cn/v2/music/tencent';

function tryGD(kw: string): Promise<string> {
  return fetch(`${GD_API}?types=search&name=${encodeURIComponent(kw)}&count=1&pages=1`)
    .then(r => r.json())
    .then((data: any) => {
      if (!data || !data[0] || !data[0].id) throw new Error('no result');
      return fetch(`${GD_API}?types=url&id=${data[0].id}&br=128000`);
    })
    .then(r => r.json())
    .then((d: any) => {
      const url = d.url || (d.data && d.data.url);
      if (!url) throw new Error('no url');
      return url as string;
    });
}

function tryVK(kw: string): Promise<string> {
  return fetch(`${VK_API}?word=${encodeURIComponent(kw)}&choose=1`)
    .then(r => r.json())
    .then((d: any) => {
      const url = d.data && d.data.url;
      if (!url) throw new Error('no url');
      return url as string;
    });
}

function getState(w: Window & typeof globalThis): SlMusicState {
  if (!w._slMusicState) {
    w._slMusicState = { keyword: '', btn: null, playId: 0 };
  }
  return w._slMusicState;
}

function getAudio(w: Window & typeof globalThis): HTMLAudioElement {
  if (!w._slMusicAudio) {
    const audio = new w.Audio();
    audio.loop = true;
    // audio 状态变化时,自动同步当前激活按钮的 UI
    // 守卫 audio.src:加载新歌时 audio.src='' 引发的过渡 pause/emptied 不该当作用户暂停
    audio.addEventListener('pause', () => {
      const s = w._slMusicState;
      if (s?.btn && audio.src) s.btn.textContent = '▶';
    });
    audio.addEventListener('play', () => {
      const s = w._slMusicState;
      if (s?.btn) s.btn.textContent = '⏸';
    });
    w._slMusicAudio = audio;
  }
  return w._slMusicAudio;
}

function setBtnText(btn: HTMLButtonElement | null, text: string): void {
  if (btn) btn.textContent = text;
}

function resetOtherButtons(w: Window & typeof globalThis, currentBtn: HTMLButtonElement): void {
  const all = w.document.querySelectorAll<HTMLButtonElement>('.sl-music-btn[data-sl-music-keyword]');
  all.forEach(b => {
    if (b !== currentBtn) {
      b.textContent = '▶';
      b.disabled = false;
    }
  });
}

export function bindMusicPlayer(): { destroy: () => void } {
  const w = (window.parent || window) as Window & typeof globalThis;

  // 幂等保护:已绑定过先卸载旧 listener,避免 iframe reload 时重复触发
  if (w._slMusicCleanup) {
    try {
      w._slMusicCleanup();
    } catch {
      // noop
    }
  }

  const onClick = async (ev: Event) => {
    const target = ev.target as HTMLElement | null;
    if (!target) return;
    const btn = target.closest<HTMLButtonElement>('.sl-music-btn[data-sl-music-keyword]');
    if (!btn) return;

    ev.preventDefault();
    ev.stopPropagation();

    if (btn.disabled) return;
    const keyword = btn.getAttribute('data-sl-music-keyword') ?? '';
    if (!keyword) return;

    const audio = getAudio(w);
    const state = getState(w);

    // 同首歌:暂停/继续 或 切换激活按钮(同一 keyword 出现在多楼层时)
    if (state.keyword === keyword && audio.src) {
      const sameBtn = state.btn === btn;
      if (!sameBtn) {
        resetOtherButtons(w, btn);
      }
      state.btn = btn;
      if (audio.paused) {
        try {
          await audio.play(); // 'play' 事件设 ⏸
        } catch {
          setBtnText(btn, '▶');
        }
      } else if (sameBtn) {
        audio.pause(); // 'pause' 事件设 ▶
      } else {
        // 音乐已在响 + 用户点的是另一个同 keyword 按钮 → 只切 UI 焦点,不暂停
        setBtnText(btn, '⏸');
      }
      return;
    }

    // 新歌:占用 playId 序号,后续 await 后用它守卫,丢弃迟到的旧请求
    const myId = ++state.playId;

    resetOtherButtons(w, btn);
    // 临时让 audio 事件无目标,避免下面 audio.pause() 的事件回调把 '…' 改回 '▶'
    state.btn = null;
    try {
      audio.pause();
    } catch {
      // noop
    }
    audio.src = '';
    state.keyword = keyword;
    state.btn = btn;
    btn.disabled = true;
    setBtnText(btn, '…');

    try {
      const url = await tryGD(keyword).catch(() => tryVK(keyword));
      if (myId !== state.playId) return; // 已被更新的点击取代,丢弃
      audio.src = url;
      btn.disabled = false;
      try {
        await audio.play(); // 'play' 事件设 ⏸
        if (myId !== state.playId) return;
      } catch {
        if (myId !== state.playId) return;
        setBtnText(btn, '▶');
      }
    } catch {
      if (myId !== state.playId) return; // 旧请求的失败不该污染新 UI
      btn.disabled = false;
      setBtnText(btn, '✕');
      setTimeout(() => {
        if (myId === state.playId) setBtnText(btn, '▶');
      }, 1500);
    }
  };

  w.document.addEventListener('click', onClick, true);
  const cleanup = () => {
    w.document.removeEventListener('click', onClick, true);
    if (w._slMusicCleanup === cleanup) {
      delete w._slMusicCleanup;
    }
  };
  w._slMusicCleanup = cleanup;

  console.info('[蜃灵统一渲染][music] bound');
  return {
    destroy: () => {
      cleanup();
      // 注意:不在这里 pause / 清 src
      // iframe reload 时新 binding 会立即接管,音乐应延续而非被打断
      console.info('[蜃灵统一渲染][music] unbound');
    },
  };
}
