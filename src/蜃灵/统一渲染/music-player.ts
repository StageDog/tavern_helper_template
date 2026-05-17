// 全局单例音乐播放器
// 监听 .sl-music-btn 点击,跨消息只保留一个 audio,避免多个同时响

declare global {
  interface Window {
    _slMusicAudio?: HTMLAudioElement;
    _slMusicState?: {
      keyword: string;
      btn: HTMLButtonElement | null;
    };
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

function getAudio(w: Window & typeof globalThis): HTMLAudioElement {
  if (!w._slMusicAudio) {
    const audio = new w.Audio();
    audio.loop = true;
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
    const state = w._slMusicState || (w._slMusicState = { keyword: '', btn: null });

    if (state.keyword === keyword && audio.src) {
      if (audio.paused) {
        try {
          await audio.play();
          state.btn = btn;
          setBtnText(btn, '⏸');
        } catch {
          setBtnText(btn, '▶');
        }
      } else {
        audio.pause();
        setBtnText(btn, '▶');
      }
      return;
    }

    resetOtherButtons(w, btn);
    audio.pause();
    audio.src = '';
    state.keyword = keyword;
    state.btn = btn;
    btn.disabled = true;
    setBtnText(btn, '…');

    try {
      const url = await tryGD(keyword).catch(() => tryVK(keyword));
      audio.src = url;
      btn.disabled = false;
      try {
        await audio.play();
        setBtnText(btn, '⏸');
      } catch {
        setBtnText(btn, '▶');
      }
    } catch {
      btn.disabled = false;
      setBtnText(btn, '✕');
      setTimeout(() => {
        if (state.btn === btn) setBtnText(btn, '▶');
      }, 1500);
    }
  };

  w.document.addEventListener('click', onClick, true);
  console.info('[蜃灵统一渲染][music] bound');
  return {
    destroy: () => {
      w.document.removeEventListener('click', onClick, true);
      const audio = w._slMusicAudio;
      if (audio) {
        try {
          audio.pause();
        } catch {
          // noop
        }
        audio.src = '';
      }
      console.info('[蜃灵统一渲染][music] unbound');
    },
  };
}
