/* Audio: recorded Turkish clips, packed into a few mp3 files.
   AUDIO_INDEX (audio-index.js) maps pack -> [[key, byteLength], ...] in file order.
   A clip is a byte range of its pack; we cut it out and play it as a blob.
   Falls back to seeking inside the pack, then to the device's own voice. */
'use strict';
const Sound = (() => {
  const BYTES_PER_SEC = 3000;              // packs are 24 kbps CBR
  const where = new Map();                 // key -> {pack, off, len}
  const packs = new Map();                 // pack -> Promise<ArrayBuffer|null>
  const el = new Audio();
  el.preload = 'auto';
  let unlocked = false, stopAt = 0, token = 0, lastUrl = null;

  for (const [pack, list] of Object.entries(window.AUDIO_INDEX || {})) {
    let off = 0;
    for (const [key, len] of list) {
      if (!where.has(key)) where.set(key, { pack, off, len });
      off += len;
    }
  }

  /* A tenth of a second of silence, built here so the unlock tap has something real to play */
  const SILENCE = (() => {
    const n = 800, b = new DataView(new ArrayBuffer(44 + n));
    const put = (o, t) => [...t].forEach((c, i) => b.setUint8(o + i, c.charCodeAt(0)));
    put(0, 'RIFF'); b.setUint32(4, 36 + n, true); put(8, 'WAVEfmt '); b.setUint32(16, 16, true); b.setUint16(20, 1, true); b.setUint16(22, 1, true);
    b.setUint32(24, 8000, true); b.setUint32(28, 8000, true); b.setUint16(32, 1, true); b.setUint16(34, 8, true); put(36, 'data'); b.setUint32(40, n, true);
    for (let i = 0; i < n; i++) b.setUint8(44 + i, 128);
    return URL.createObjectURL(new Blob([b.buffer], { type: 'audio/wav' }));
  })();
  /* iOS only lets a page play sound from a tap. One tap on anything unlocks this element for good. */
  function unlock() {
    if (unlocked) return;
    unlocked = true;
    try { el.src = SILENCE; const p = el.play(); if (p) p.catch(() => {}); } catch (e) {}
  }
  document.addEventListener('pointerdown', unlock, true);
  document.addEventListener('keydown', unlock, true);

  function loadPack(pack) {
    if (!packs.has(pack)) {
      packs.set(pack, fetch('audio/' + pack + '.mp3')
        .then(r => r.ok ? r.arrayBuffer() : null)
        .catch(() => null));
    }
    return packs.get(pack);
  }
  function preload(keys) {
    uniq(keys.map(k => where.get(speakKey(k))).filter(Boolean).map(w => w.pack)).forEach(loadPack);
  }

  /* Playback state for the UI: the page shows which control is speaking */
  const listeners = [];
  const emit = on => listeners.forEach(fn => { try { fn(on); } catch (e) {} });
  el.addEventListener('playing', () => { if (el.src !== SILENCE) emit(true); });
  ['pause', 'ended', 'error'].forEach(ev => el.addEventListener(ev, () => emit(false)));
  el.addEventListener('timeupdate', () => { if (stopAt && el.currentTime >= stopAt) { el.pause(); stopAt = 0; } });

  function deviceVoice(text, rate) {
    if (!('speechSynthesis' in window)) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'tr-TR'; u.rate = rate < 1 ? 0.6 : 0.9;
      const v = speechSynthesis.getVoices().find(x => /^tr/i.test(x.lang));
      if (v) u.voice = v;
      speechSynthesis.speak(u);
    } catch (e) {}
  }

  async function say(text, rate) {
    const key = speakKey(text);
    if (!key) return;
    const my = ++token;
    rate = rate || 1;
    const w = where.get(key);
    if (!w) { deviceVoice(key, rate); return; }
    stopAt = 0;
    const buf = await loadPack(w.pack);
    if (my !== token) return;
    try {
      if (buf) {
        if (lastUrl) URL.revokeObjectURL(lastUrl);
        lastUrl = URL.createObjectURL(new Blob([buf.slice(w.off, w.off + w.len)], { type: 'audio/mpeg' }));
        el.src = lastUrl;
      } else {
        el.src = 'audio/' + w.pack + '.mp3';
        const start = w.off / BYTES_PER_SEC;
        await new Promise(res => { el.addEventListener('loadedmetadata', res, { once: true }); setTimeout(res, 4000); });
        if (my !== token) return;
        el.currentTime = start;
        stopAt = start + w.len / BYTES_PER_SEC - 0.03;
      }
      el.playbackRate = rate;
      await el.play();
    } catch (e) { /* refused by the browser: the text stays on screen */ }
  }

  ['course', 'words1'].forEach(p => { if (window.AUDIO_INDEX && AUDIO_INDEX[p]) loadPack(p); });

  return { say, preload, onState: fn => listeners.push(fn), has: t => where.has(speakKey(t)) };
})();
