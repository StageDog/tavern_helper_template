// 全局单例音乐播放器
// 监听 .sl-music-btn 点击,跨消息只保留一个 audio,避免多个同时响

interface SlMusicState {
  keyword: string;
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
    w._slMusicState = { keyword: '', playId: 0 };
  }
  return w._slMusicState;
}

function findBtns(w: Window & typeof globalThis, keyword: string): HTMLButtonElement[] {
  if (!keyword) return [];
  return Array.from(
    w.document.querySelectorAll<HTMLButtonElement>(
      `.sl-music-btn[data-sl-music-keyword="${CSS.escape(keyword)}"]`,
    ),
  );
}

function setBtnsText(btns: HTMLButtonElement[], text: string): void {
  btns.forEach(b => {
    b.textContent = text;
  });
}

function setBtnsDisabled(btns: HTMLButtonElement[], disabled: boolean): void {
  btns.forEach(b => {
    b.disabled = disabled;
  });
}

function getAudio(w: Window & typeof globalThis): HTMLAudioElement {
  if (!w._slMusicAudio) {
    const audio = new w.Audio();
    audio.loop = true;
    // 实时按 keyword 查 DOM 同步 UI,避免缓存 btn 引用在 re-render 后变成幽灵节点
    // 守卫 audio.src:加载新歌时 audio.src='' 引发的过渡 pause/emptied 不该当作用户暂停
    audio.addEventListener('pause', () => {
      const s = w._slMusicState;
      if (!s?.keyword || !audio.src) return;
      setBtnsText(findBtns(w, s.keyword), '▶');
    });
    audio.addEventListener('play', () => {
      const s = w._slMusicState;
      if (!s?.keyword) return;
      setBtnsText(findBtns(w, s.keyword), '⏸');
    });
    w._slMusicAudio = audio;
  }
  return w._slMusicAudio;
}

function resetButtonsNotOfKeyword(w: Window & typeof globalThis, keepKeyword: string): void {
  const all = w.document.querySelectorAll<HTMLButtonElement>('.sl-music-btn[data-sl-music-keyword]');
  all.forEach(b => {
    const k = b.getAttribute('data-sl-music-keyword') ?? '';
    if (k !== keepKeyword) {
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

    console.info(
      `[蜃灵统一渲染][music] click keyword="${keyword}" stateKeyword="${state.keyword}" hasSrc=${!!audio.src} paused=${audio.paused} errorCode=${audio.error?.code ?? 'none'} networkState=${audio.networkState}`,
    );

    // 同首歌:暂停/继续。若 audio 处于错误/失效状态(URL 过期 404 等),清掉残留 src 走 "新歌" 路径重新 fetch
    if (state.keyword === keyword && audio.src) {
      const invalid = audio.error || audio.networkState === HTMLMediaElement.NETWORK_NO_SOURCE;
      if (invalid) {
        console.info('[蜃灵统一渲染][music] same keyword but audio invalid → refetch');
        audio.src = '';
        state.keyword = '';
        // 不 return,继续走下面的 "新歌" 路径
      } else {
        if (audio.paused) {
          try {
            await audio.play(); // 'play' 事件设 ⏸
          } catch (e) {
            console.warn('[蜃灵统一渲染][music] resume failed', e);
            setBtnsText(findBtns(w, keyword), '▶');
          }
        } else {
          audio.pause(); // 'pause' 事件设 ▶
        }
        return;
      }
    }

    // 新歌:占用 playId 序号,后续 await 后用它守卫,丢弃迟到的旧请求
    const myId = ++state.playId;

    resetButtonsNotOfKeyword(w, keyword);
    // 临时清空 keyword,避免 audio.pause()/src='' 引发的事件回调误改 UI
    state.keyword = '';
    try {
      audio.pause();
    } catch {
      // noop
    }
    audio.src = '';
    state.keyword = keyword;
    const btns = findBtns(w, keyword);
    setBtnsDisabled(btns, true);
    setBtnsText(btns, '…');

    try {
      const url = await tryGD(keyword).catch(() => tryVK(keyword));
      if (myId !== state.playId) return; // 已被更新的点击取代,丢弃
      console.info(`[蜃灵统一渲染][music] fetched id=${myId} url=${String(url).slice(0, 120)}`);
      audio.src = url;
      setBtnsDisabled(findBtns(w, keyword), false);
      try {
        await audio.play(); // 'play' 事件设 ⏸
        if (myId !== state.playId) return;
      } catch (e) {
        if (myId !== state.playId) return;
        console.warn(`[蜃灵统一渲染][music] play failed id=${myId}`, e);
        setBtnsText(findBtns(w, keyword), '▶');
        // 防御:清掉 src 让下次点击走 "新歌" 路径重新 fetch,即使 audio.error 暂未设置
        audio.src = '';
      }
    } catch (e) {
      if (myId !== state.playId) return; // 旧请求的失败不该污染新 UI
      console.warn(`[蜃灵统一渲染][music] fetch failed id=${myId}`, e);
      const errBtns = findBtns(w, keyword);
      setBtnsDisabled(errBtns, false);
      setBtnsText(errBtns, '✕');
      setTimeout(() => {
        if (myId === state.playId) setBtnsText(findBtns(w, keyword), '▶');
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
