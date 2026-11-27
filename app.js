/* Blably: state, spaced repetition, session builders, lesson player, screens */
'use strict';

/* ───────────────────────── State ───────────────────────── */
const KEY = 'turkce_v3';
const FRESH = () => ({ done: {}, stats: {}, srs: {}, mist: [], sel: ['plural', 'loc', 'dat', 'pres'], mode: 'choice', days: {}, xp: 0, track: 'talk', goal: 50, daily: {} });
let S = FRESH();
(function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { Object.assign(S, JSON.parse(raw)); return; }
    const old = JSON.parse(localStorage.getItem('turkce_v2') || localStorage.getItem('turkce_v1') || 'null');
    if (old) {                                   // carry progress over from earlier versions
      ['done', 'stats', 'days', 'xp', 'track', 'mist'].forEach(k => { if (old[k] != null) S[k] = old[k]; });
      Object.keys(old.known || {}).forEach(w => { S.srs[speakKey(w)] = { b: 4, d: today() + 16 }; });
    }
  } catch (e) {}
})();
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

function today() { const d = new Date(); return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 864e5); }
const dkey = (d = new Date()) => d.toLocaleDateString('sv');
function addXP(n) { if (n > 0) { S.days[dkey()] = (S.days[dkey()] || 0) + n; S.xp += n; save(); } }
function streak() {
  const d = new Date();
  if (!S.days[dkey(d)]) d.setDate(d.getDate() - 1);
  let n = 0;
  while (S.days[dkey(d)]) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
function daily() { if (S.daily.day !== today()) S.daily = { day: today() }; return S.daily; }

/* ───────────────── Spaced repetition (Leitner boxes) ─────────────────
   A phrase comes back after 1, 3, 7, 16, 35, 90 days. A miss sends it back to tomorrow. */
const SRS = {
  GAPS: [0, 1, 3, 7, 16, 35, 90],
  get: k => S.srs[k],
  enroll(k) { if (!S.srs[k]) S.srs[k] = { b: 1, d: today() + 1 }; },
  mark(k, ok) {
    const it = S.srs[k] || { b: 0, d: 0 };
    it.b = ok ? Math.min(it.b + 1, 6) : 1;
    it.d = today() + (ok ? this.GAPS[it.b] : 1);
    S.srs[k] = it;
  },
  due() { const t = today(); return Object.keys(S.srs).filter(k => S.srs[k].d <= t && DICT.has(k)).sort((a, b) => S.srs[a].d - S.srs[b].d); },
  known: k => !!S.srs[k] && S.srs[k].b >= 3,
  count: () => Object.keys(S.srs).length
};

/* ───────────────────────── Content index ───────────────────────── */
const okPair = e => !/[=]/.test(e[1]) && speakKey(e[0]).length > 1;
const toItem = e => ({ tr: speakKey(e[0]), ru: e[1] });
const lessonItems = l => l.steps.filter(s => s.k === 'learn').flatMap(s => s.ex).filter(okPair).map(toItem);
const ALLCATS = WG.flatMap(g => g.cats);
const catById = id => ALLCATS.find(c => c.id === id);
const catItems = c => c.it.filter(okPair).map(toItem);
const TALK_ITEMS = TALK.flatMap(u => u.ls.flatMap(lessonItems));
const BASE_ITEMS = WG[0].cats.flatMap(catItems);
const DICT = new Map();
[...ALLCATS.flatMap(catItems), ...TALK_ITEMS].forEach(it => DICT.set(it.tr, it.ru));
const itemOf = k => ({ tr: k, ru: DICT.get(k) });
function uniqItems(a) { const seen = new Set(); return a.filter(x => !seen.has(x.tr) && seen.add(x.tr)); }
const LISTEN_POOL = uniqItems([...TALK_ITEMS, ...['pron', 'ask', 'here', 'dir', 'when', 'yes', 'phr'].flatMap(id => catItems(catById(id)))]);

const units = tr => tr === 'talk' ? TALK : GRAM;
const flat = tr => units(tr).flatMap((u, ui) => u.ls.map(l => ({ ...l, u, ui })));
const ALL_LESSONS = [...flat('talk'), ...flat('gram')];
const nextLesson = tr => flat(tr).find(l => !(l.id in S.done)) || null;
const doneCount = tr => flat(tr).filter(l => l.id in S.done).length;

/* ───────────────────────── Step factories ───────────────────────── */
const others = (it, pool, n, field) => uniq(shuffle(pool.filter(x => x.tr !== it.tr && x.ru !== it.ru)).map(x => x[field])).slice(0, n);
const Step = {
  recognize: (it, pool) => ({ k: 'mc', title: 'Что это значит?', q: `<div class="big-tr">${esc(it.tr)}</div>`, say: it.tr, auto: true, o: [it.ru, ...others(it, pool, 3, 'ru')], key: it.tr }),
  recall: (it, pool) => ({ k: 'mc', title: 'Как это по-турецки?', q: `<div class="big-ru">${esc(it.ru)}</div>`, o: [it.tr, ...others(it, pool, 3, 'tr')], trOpts: true, key: it.tr }),
  listen(it, pool, m) {
    const words = it.tr.split(' ');
    if (m === 'build' && (words.length < 2 || words.length > 6)) m = 'mc';
    if (m === 'type' && (words.length > 3 || it.tr.length > 24)) m = 'mc';
    const s = { k: 'listen', m, tr: it.tr, ru: it.ru, key: it.tr };
    if (m === 'mc') s.o = [it.ru, ...others(it, pool, 3, 'ru')];
    if (m === 'build') { const own = words.map(lc); s.x = shuffle(uniq(pool.flatMap(x => x.tr.split(' '))).filter(t => !own.includes(lc(t)))).slice(0, 2); }
    return s;
  },
  speak: it => ({ k: 'speak', tr: it.tr, ru: it.ru, key: it.tr }),
  intro: (items, title) => ({ k: 'learn', t: title, b: 'Послушай каждое слово и повтори вслух.', ex: items.map(x => [x.tr, x.ru]) }),
  match: items => ({ k: 'match', p: items.map(x => [x.tr, x.ru]) })
};

/* Each conversation lesson ends with listening and saying things aloud */
TALK.forEach(u => u.ls.forEach(l => {
  const items = shuffle(lessonItems(l));
  if (items.length < 4) return;
  l.steps.push(Step.listen(items[0], TALK_ITEMS, 'mc'), Step.listen(items[1], TALK_ITEMS, 'build'), Step.speak(items[2]), Step.speak(items[3]));
}));

/* ───────────────────────── Session builders ───────────────────────── */
const Sessions = {
  lesson(id) {
    const l = ALL_LESSONS.find(x => x.id === id);
    if (l) Player.start({ title: l.t, steps: l.steps, lessonId: id, enroll: lessonItems(l).map(x => x.tr), kind: 'lesson' });
  },
  review() {
    const due = SRS.due().slice(0, 12).map(itemOf);
    if (!due.length) return;
    const pool = uniqItems([...due, ...LISTEN_POOL]);
    const steps = due.map(it => {
      const b = SRS.get(it.tr).b;
      if (b <= 1) return Step.recognize(it, pool);
      if (b === 2) return Math.random() < .5 ? Step.recall(it, pool) : Step.listen(it, pool, 'mc');
      if (b === 3) return Step.listen(it, pool, pick(['build', 'type']));
      return Step.speak(it);
    });
    Player.start({ title: 'Повторение', steps: shuffle(steps), kind: 'rev' });
  },
  words(items, title) {
    items = uniqItems(items);
    const fresh = shuffle(items.filter(x => !SRS.known(x.tr)));
    const set = (fresh.length >= 4 ? fresh : shuffle(items.slice())).slice(0, 6);
    if (set.length < 4) return;
    const pool = items.length >= 8 ? items : uniqItems([...items, ...BASE_ITEMS]);
    const steps = [Step.intro(set, title), Step.match(set.slice(0, 5)),
      ...shuffle(set.map(it => Step.recognize(it, pool))),
      ...shuffle(set.map(it => Step.recall(it, pool))),
      ...shuffle(set.slice(0, 3).map(it => Step.listen(it, pool, 'type'))),
      ...shuffle(set.slice(3).map(it => Step.speak(it)))];
    Player.start({ title, steps, enroll: set.map(x => x.tr), kind: 'words' });
  },
  listening(items, title) {
    const pool = items.length >= 8 ? items : LISTEN_POOL;
    const plan = ['mc', 'build', 'type', 'mc', 'build', 'type', 'mc', 'build', 'mc', 'type'];
    const set = shuffle(uniqItems(items).slice()).slice(0, plan.length);
    Player.start({ title: title || 'Аудирование', steps: set.map((it, i) => Step.listen(it, pool, plan[i])), kind: 'listen' });
  },
  speaking() {
    const mine = Object.keys(S.srs).filter(k => DICT.has(k)).map(itemOf);
    const set = shuffle(mine.length >= 6 ? mine : TALK_ITEMS.slice(0, 30)).slice(0, 10);
    Player.start({ title: 'Скажи вслух', steps: set.map(Step.speak), kind: 'speak' });
  },
  grammar(topics, n) { Player.start({ title: 'Грамматика', steps: [{ k: 'gen', topics, n: n || 10 }], mode: S.mode, kind: 'gram' }); },
  quickGrammar() {
    const ts = new Set();
    flat('gram').forEach(l => { if (l.id in S.done) l.steps.forEach(s => { if (s.k === 'gen') s.topics.forEach(t => ts.add(t)); }); });
    this.grammar(ts.size ? [...ts] : ['plural', 'poss1', 'loc', 'pres', 'past']);
  },
  mistakes() {
    if (S.mist.length) Player.start({ title: 'Мои ошибки', steps: shuffle(S.mist.slice()).slice(0, 10).map(q => ({ k: 'gq', q: { ...q } })), mode: S.mode, clearMist: true, kind: 'gram' });
  }
};

/* ───────────────────────── Icons ─────────────────────────
   One line family: 24px grid, 1.8 stroke, round caps. Coloured by CSS (currentColor). */
const svg = (d, extra) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra || ''}>${d}</svg>`;
const ICON = {
  home: svg('<path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z"/>'),
  path: svg('<circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="6" r="2.2"/><path d="M8.2 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.8"/>'),
  target: svg('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".6" fill="currentColor"/>'),
  book: svg('<path d="M12 6.5C10.5 5.2 8.3 4.5 5 4.5v13c3.3 0 5.5.7 7 2 1.5-1.3 3.7-2 7-2v-13c-3.3 0-5.5.7-7 2z"/><path d="M12 6.5v13"/>'),
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10.6-6.4a1 1 0 0 0 0-1.72L9.5 4.74A1 1 0 0 0 8 5.6z" fill="currentColor"/></svg>',
  speaker: svg('<path d="M4.5 9.5h3l4.5-4v13l-4.5-4h-3z" fill="currentColor" stroke-width="1.4"/><path d="M15.5 9a4 4 0 0 1 0 6M18.2 6.5a7.5 7.5 0 0 1 0 11"/>'),
  x: svg('<path d="M6 6l12 12M18 6 6 18"/>', 'stroke-width="2.2"'),
  ok: svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>', 'stroke-width="2.6"'),
  back: svg('<path d="m15 5-7 7 7 7"/>', 'stroke-width="2.2"'),
  chev: svg('<path d="m9 6 6 6-6 6"/>', 'stroke-width="2"'),
  flame: svg('<path d="M12 21c-3.9 0-6.5-2.6-6.5-6.2 0-3.2 2.2-5.4 3.6-7 .4 1.8 1.4 3 2.6 3.4C11.3 8 12.4 5 14.6 3c.3 2.7 1.6 4.3 2.8 5.8 1.2 1.4 1.6 3.3 1.6 5.2C19 18.3 16 21 12 21z"/>'),
  bolt: svg('<path d="M13 3 5.5 13.2h5.3L10 21l8.5-11h-5.4z"/>'),
  layers: svg('<path d="m12 4 8.5 4.5L12 13 3.5 8.5z"/><path d="m3.5 12.5 8.5 4.5 8.5-4.5"/><path d="m3.5 16.5 8.5 4.5 8.5-4.5" opacity=".5"/>'),
  repeat: svg('<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.7"/><path d="M20 4v4.7h-4.7"/><path d="M20 12a8 8 0 0 1-13.7 5.6L4 15.3"/><path d="M4 20v-4.7h4.7"/>'),
  lesson: svg('<rect x="4" y="3.5" width="16" height="17" rx="3"/><path d="M8.5 8.5h7M8.5 12h7M8.5 15.5h4"/>'),
  headphones: svg('<path d="M4 14v-1.5a8 8 0 0 1 16 0V14"/><rect x="3.5" y="13.5" width="4.5" height="6.5" rx="2"/><rect x="16" y="13.5" width="4.5" height="6.5" rx="2"/>'),
  mic: svg('<rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v2.5"/>'),
  alert: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.8v5M12 16.2v.1"/>'),
  grammar: svg('<path d="M5 19 9.5 5h1L15 19M6.6 14h7.3"/><path d="M17 9.5h3.5M18.75 7.75v3.5"/>'),
  sparkle: svg('<path d="M12 3.5c.6 3.9 2.6 5.9 6.5 6.5-3.9.6-5.9 2.6-6.5 6.5-.6-3.9-2.6-5.9-6.5-6.5 3.9-.6 5.9-2.6 6.5-6.5z"/><path d="M18.5 15.5c.25 1.6 1 2.35 2.5 2.5-1.5.25-2.25 1-2.5 2.5-.25-1.5-1-2.25-2.5-2.5 1.5-.15 2.25-.9 2.5-2.5z"/>'),
  lock: svg('<rect x="5.5" y="10.5" width="13" height="9.5" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>')
};
/* The brand mark, drawn inline so it scales cleanly */
const MARK = `<svg class="mark" viewBox="0 0 512 512" aria-hidden="true"><defs><linearGradient id="mk-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5FA2FF"/><stop offset=".55" stop-color="#3A72FA"/><stop offset="1" stop-color="#2652E8"/></linearGradient></defs><rect width="512" height="512" rx="116" fill="url(#mk-bg)"/><path d="M150 112H362A78 78 0 0 1 440 190V282A78 78 0 0 1 362 360H232L168 410C158 418 146 410 149 398L158 360H150A78 78 0 0 1 72 282V190A78 78 0 0 1 150 112Z" fill="#fff"/><path d="M318 176C286 160 214 158 200 196C186 236 312 226 312 270C312 312 236 316 194 298" fill="none" stroke="#2F6BFF" stroke-width="34" stroke-linecap="round"/></svg>`;

/* ───────────────────────── Shared UI bits ───────────────────────── */
const playBtn = (t, cls) => `<button class="say ${cls || ''}" data-say="${esc(t)}" aria-label="Послушать">${ICON.play}</button>`;
let speakingBtn = null;
Sound.onState(on => { if (speakingBtn) speakingBtn.classList.toggle('playing', on); if (!on) speakingBtn = null; });
function speak(text, rate, btn) {
  if (speakingBtn && speakingBtn !== btn) speakingBtn.classList.remove('playing');
  speakingBtn = btn || null;
  Sound.say(text, rate);
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-say]');
  if (b) { e.stopPropagation(); speak(b.dataset.say, b.dataset.rate ? +b.dataset.rate : 1, b.querySelector('.say') || b); }
}, true);
const TR_KEYS = `<div class="keys">${[...'çğıöşü'].map(c => `<button class="key" data-c="${c}" tabindex="-1">${c}</button>`).join('')}</div>`;
function wireKeys(input, onChange) {
  $$('.key').forEach(k => {
    k.onmousedown = e => e.preventDefault();
    k.onclick = () => {
      const a = input.selectionStart ?? input.value.length, b = input.selectionEnd ?? a;
      input.value = input.value.slice(0, a) + k.dataset.c + input.value.slice(b);
      input.setSelectionRange(a + 1, a + 1); input.focus(); onChange();
    };
  });
  input.oninput = onChange;
}
const focusQuiet = el => { try { el.focus({ preventScroll: true }); } catch (e) {} };
function ring(value, max, size) {
  const r = (size - 10) / 2, C = 2 * Math.PI * r, p = Math.min(1, max ? value / max : 0);
  return `<svg class="ring" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true">
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ring-bg"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ring-fg" style="--c:${C};--o:${C * (1 - p)}" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - p)}"/></svg>`;
}

/* ───────────────────────── Lesson player ───────────────────────── */
const Player = (() => {
  const root = $('#player');
  const PRAISE = ['Верно!', 'Отлично!', 'Doğru!', 'Aferin!', 'Harika!', 'Точно!'];
  let P = null;

  function start(cfg) {
    const queue = [];
    cfg.steps.forEach(s => {
      if (s.k === 'gen') for (let i = 0; i < s.n; i++) queue.push({ k: 'gq', topic: pick(s.topics) });
      else queue.push({ ...s });
    });
    if (!queue.length) return;
    P = { ...cfg, queue, i: 0, ok: 0, tot: 0, xp: 0, combo: 0, mode: cfg.mode || 'choice', seen: new Set() };
    Sound.preload(queue.flatMap(s => [s.tr, s.say, s.a, ...(s.ex || []).map(e => e[0]), ...(s.p || []).map(e => e[0])].filter(Boolean)));
    document.body.classList.add('playing');
    window.scrollTo(0, 0);
    show();
  }
  function close() { document.body.classList.remove('playing'); root.innerHTML = ''; P = null; App.render(); window.scrollTo(0, 0); }

  function frame(body, cta, enabled) {
    const pct = Math.round(P.i / P.queue.length * 100);
    root.innerHTML = `<div class="pl">
      <div class="pl-top"><button class="pl-x" id="plx" aria-label="Закрыть">${ICON.x}</button>
        <div class="pl-bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${Math.max(pct, 3)}%"></i></div>
        ${P.combo >= 3 ? `<span class="combo">${ICON.bolt}${P.combo}</span>` : ''}</div>
      <div class="pl-body step-in">${body}</div>
      <div class="pl-foot">${cta ? `<button class="btn" id="cta" ${enabled ? '' : 'disabled'}>${cta}</button>` : ''}</div>
    </div><div class="scrim" id="scrim"></div><div class="sheet" id="sheet" aria-live="polite"></div>`;
    $('#plx').onclick = askQuit;
  }
  function askQuit() {
    if (!P.tot && !P.i) return close();
    const sh = $('#sheet');
    $('#scrim').classList.add('show');
    sh.className = 'sheet show plain';
    sh.innerHTML = `<div class="sh-in"><div class="sh-h">Выйти из занятия?</div><div class="sh-note">Прогресс этого занятия не сохранится.</div>
      <div class="pair-btn"><button class="btn soft" id="leave">Выйти</button><button class="btn" id="stay">Остаться</button></div></div>`;
    $('#stay').onclick = () => { sh.className = 'sheet'; $('#scrim').classList.remove('show'); };
    $('#scrim').onclick = $('#stay').onclick;
    $('#leave').onclick = close;
  }
  const enable = on => { const c = $('#cta'); if (c) c.disabled = !on; };

  /* Each step type: render(step) draws it, check(step) returns {ok, html, say} or null if nothing to check yet */
  const TYPES = {
    learn: {
      render(s) {
        frame(`<div class="learn"><div class="kicker">${ICON.sparkle}Новое</div><h2 class="l-t">${s.t}</h2>${s.b ? `<div class="l-b">${s.b}</div>` : ''}
          ${s.ex.length ? `<div class="card ex">${s.ex.map(e => `<button class="ex-row" data-say="${esc(e[0])}"><span><b>${esc(e[0])}</b><i>${esc(e[1])}</i></span><span class="say soft">${ICON.play}</span></button>`).join('')}</div><p class="hint">Нажми на фразу, чтобы послушать, и повтори вслух.</p>` : ''}</div>`, 'Дальше', true);
        $('#cta').onclick = next;
      }
    },
    mc: {
      render(s) {
        if (!s._o) s._o = shuffle(s.o.slice());
        const short = s._o.every(o => o.length < 15);
        frame(`<h2 class="q-t">${s.title || 'Выбери ответ'}</h2>
          <div class="q-card"><div class="q-main">${s.q}</div>${s.say ? playBtn(s.say, 'lg') : ''}</div>
          <div class="opts ${short ? 'two' : ''}">${s._o.map((o, i) => `<button class="opt ${s.trOpts ? 'tr' : ''}" data-i="${i}">${esc(o)}</button>`).join('')}</div>`, 'Проверить', false);
        wireOpts();
        if (s.say && s.auto) speak(s.say, 1, $('.q-card .say', root));
      },
      check(s) {
        if (P.sel == null) return null;
        const ok = s._o[P.sel] === s.o[0];
        paintOpts(i => s._o[i] === s.o[0]);
        const trAns = !hasCyr(s.o[0]);
        return { ok, html: (ok ? '' : `<div class="sh-ans"><span>${esc(s.o[0])}</span>${trAns ? playBtn(s.o[0]) : ''}</div>`) + (s.why ? `<div class="sh-note">${s.why}</div>` : ''), say: trAns ? s.o[0] : (s.say && !s.auto ? s.say : null) };
      }
    },
    gq: {
      render(s) {
        if (!s.q) { let q, g = 0; do { q = genQ(s.topic); } while (P.seen.has(q.answer) && g++ < 25); s.q = q; }
        P.seen.add(s.q.answer);
        if (!s.q.options) s.q.options = mkOptions(s.q);
        Sound.preload([s.q.answer]);
        const typing = P.mode === 'type';
        frame(`<h2 class="q-t">${typing ? 'Напиши нужную форму' : 'Выбери нужную форму'}</h2><div class="q-card"><div class="q-main">${s.q.prompt}</div></div>
          ${typing ? `<input class="field" id="field" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Слово целиком" aria-label="Ответ">${TR_KEYS}`
            : `<div class="opts two">${s.q.options.map((o, i) => `<button class="opt tr" data-i="${i}">${esc(o)}</button>`).join('')}</div>`}`, 'Проверить', false);
        if (typing) { const f = $('#field'); focusQuiet(f); wireKeys(f, () => enable(f.value.trim())); $('#cta').onclick = check; }
        else wireOpts();
      },
      check(s) {
        const typing = P.mode === 'type', q = s.q;
        const given = typing ? $('#field').value : q.options[P.sel];
        if (!given || !String(given).trim()) return null;
        const ok = norm(given) === norm(q.answer);
        if (typing) $('#field').readOnly = true; else paintOpts(i => q.options[i] === q.answer);
        const st = S.stats[q.t] || (S.stats[q.t] = { n: 0, c: 0 }); st.n++; if (ok) st.c++;
        const plain = { t: q.t, prompt: q.prompt, answer: q.answer, parts: q.parts, why: q.why, from: q.from };
        if (!ok) { S.mist = [plain, ...S.mist.filter(m => m.answer !== q.answer)].slice(0, 50); }
        else if (P.clearMist) S.mist = S.mist.filter(m => m.answer !== q.answer);
        return { ok, say: q.answer, html: `${!ok && typing ? `<div class="sh-note">Ты написал: <s>${esc(given)}</s></div>` : ''}
          <div class="sh-ans"><span class="morph">${q.parts.map((p, i) => `<span class="m${Math.min(i, 3)}">${esc(p)}</span>`).join('')}</span>${playBtn(q.answer)}</div>
          <details ${ok ? '' : 'open'}><summary>Почему так</summary><ul>${q.why.map(w => `<li>${w}</li>`).join('')}</ul></details>` };
      }
    },
    build: {
      render(s) {
        if (!s._t) s._t = shuffle([...s.a.split(' '), ...(s.x || [])].map((w, i) => ({ w, i })));
        P.line = [];
        frame(`<h2 class="q-t">Собери фразу</h2><div class="q-card"><div class="q-main big-ru">${esc(s.ru)}</div></div><div class="line" id="line"></div><div class="bank" id="bank"></div>`, 'Проверить', false);
        drawBuild(s, true); $('#cta').onclick = check;
      },
      check(s) {
        if (!P.line.length) return null;
        const ok = cmp(P.line.map(id => s._t.find(t => t.i === id).w).join(' ')) === cmp(s.a);
        P.locked = true; drawBuild(s, true);
        return { ok, say: s.a, html: `<div class="sh-ans"><span>${esc(s.a)}</span>${playBtn(s.a)}</div>` };
      }
    },
    match: {
      render(s) {
        const L = shuffle(s.p.map((p, i) => ({ t: p[0], i }))), R = shuffle(s.p.map((p, i) => ({ t: p[1], i })));
        const st = { l: null, r: null, done: 0, err: 0 };
        frame(`<h2 class="q-t">Найди пары</h2><div class="match"><div>${L.map(x => `<button class="mt tr" data-side="l" data-i="${x.i}">${esc(x.t)}</button>`).join('')}</div><div>${R.map(x => `<button class="mt" data-side="r" data-i="${x.i}">${esc(x.t)}</button>`).join('')}</div></div>`, 'Дальше', false);
        $$('.mt', root).forEach(b => b.onclick = () => {
          if (b.classList.contains('done')) return;
          $$(`.mt[data-side="${b.dataset.side}"]`, root).forEach(x => x.classList.remove('sel'));
          b.classList.add('sel'); st[b.dataset.side] = b;
          if (b.dataset.side === 'l') speak(b.textContent);
          if (!st.l || !st.r) return;
          const pair = [st.l, st.r]; st.l = st.r = null;
          if (pair[0].dataset.i === pair[1].dataset.i) {
            pair.forEach(x => { x.classList.remove('sel'); x.classList.add('done'); x.disabled = true; });
            if (++st.done === s.p.length) { enable(true); focusQuiet($('#cta')); }
          } else {
            st.err++; pair.forEach(x => { x.classList.remove('sel'); x.classList.add('no'); });
            setTimeout(() => pair.forEach(x => x.classList.remove('no')), 450);
          }
        });
        $('#cta').onclick = () => { P.tot++; if (!st.err) { P.ok++; P.combo++; } else P.combo = 0; P.xp += 10; next(); };
      }
    },
    listen: {
      TITLE: { mc: 'Послушай и выбери перевод', build: 'Послушай и собери фразу', type: 'Напиши, что услышал' },
      render(s) {
        let inner;
        if (s.m === 'mc') { if (!s._o) s._o = shuffle(s.o.slice()); inner = `<div class="opts">${s._o.map((o, i) => `<button class="opt" data-i="${i}">${esc(o)}</button>`).join('')}</div>`; }
        else if (s.m === 'build') { if (!s._t) s._t = shuffle([...s.tr.split(' '), ...s.x].map((w, i) => ({ w, i }))); P.line = []; inner = '<div class="line" id="line"></div><div class="bank" id="bank"></div>'; }
        else inner = `<input class="field" id="field" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Пиши по-турецки" aria-label="Что ты услышал">${TR_KEYS}`;
        frame(`<h2 class="q-t">${this.TITLE[s.m]}</h2>
          <div class="hear"><button class="hear-main" id="hear" data-say="${esc(s.tr)}" aria-label="Прослушать ещё раз">${ICON.speaker}</button>
          <button class="hear-slow" data-say="${esc(s.tr)}" data-rate="0.65">Медленнее · 0.65×</button></div>${inner}`, 'Проверить', false);
        if (s.m === 'mc') wireOpts();
        else if (s.m === 'build') { drawBuild(s, false); $('#cta').onclick = check; }
        else { const f = $('#field'); wireKeys(f, () => enable(f.value.trim())); $('#cta').onclick = check; }
        speak(s.tr, 1, $('#hear'));
      },
      check(s) {
        let ok, note = '', given = '';
        if (s.m === 'mc') { if (P.sel == null) return null; ok = s._o[P.sel] === s.o[0]; paintOpts(i => s._o[i] === s.o[0]); }
        else if (s.m === 'build') { if (!P.line.length) return null; ok = cmp(P.line.map(id => s._t.find(t => t.i === id).w).join(' ')) === cmp(s.tr); P.locked = true; drawBuild(s, false); }
        else {
          given = $('#field').value; if (!given.trim()) return null;
          const a = cmp(given), b = cmp(s.tr); ok = a === b;
          if (!ok && fold(a) === fold(b)) { ok = true; note = 'Засчитано. Обрати внимание на турецкие буквы: ç ğ ı ö ş ü.'; }
          $('#field').readOnly = true;
        }
        const st = S.stats.listen || (S.stats.listen = { n: 0, c: 0 }); st.n++; if (ok) st.c++;
        return { ok, say: ok ? null : s.tr, html: `<div class="sh-ans"><span>${esc(s.tr)}</span>${playBtn(s.tr)}</div><div class="sh-note">${esc(s.ru)}</div>${note ? `<div class="sh-note">${note}</div>` : ''}${!ok && given ? `<div class="sh-note">Ты написал: <s>${esc(given)}</s></div>` : ''}` };
      }
    },
    speak: {
      render(s) {
        frame(`<h2 class="q-t">Скажи вслух по-турецки</h2><div class="q-card tall"><div class="mic-badge">${ICON.mic}</div><div class="q-main big-ru center">${esc(s.ru)}</div></div>
          <div id="reveal"><p class="hint center">Произнеси фразу вслух, потом проверь себя. Вспоминать самому труднее, чем узнавать, зато так слова остаются в памяти.</p></div>`, 'Показать ответ', true);
        $('#cta').onclick = () => {
          $('#reveal').innerHTML = `<div class="card answer step-in"><div><b>${esc(s.tr)}</b></div>${playBtn(s.tr, 'lg')}</div><p class="hint center">Послушай и повтори ещё раз. Получилось сказать правильно?</p>`;
          $('.pl-foot', root).innerHTML = '<div class="pair-btn"><button class="btn soft" id="no">Ещё учу</button><button class="btn" id="yes">Сказал верно</button></div>';
          speak(s.tr, 1, $('.answer .say', root));
          $('#yes').onclick = () => { settle(s, true); next(); };
          $('#no').onclick = () => { settle(s, false); next(); };
        };
      }
    }
  };

  function wireOpts() {
    $$('.opt', root).forEach(b => b.onclick = () => {
      if (P.checked) return;
      $$('.opt', root).forEach(x => x.classList.remove('sel'));
      b.classList.add('sel'); P.sel = +b.dataset.i; enable(true);
    });
    $('#cta').onclick = check;
  }
  function paintOpts(isRight) {
    $$('.opt', root).forEach(b => {
      const i = +b.dataset.i; b.disabled = true;
      if (isRight(i)) b.classList.add('ok'); else if (i === P.sel) b.classList.add('no');
      b.classList.remove('sel');
    });
  }
  function drawBuild(s, speakTiles) {
    const word = id => s._t.find(t => t.i === id).w;
    $('#line').innerHTML = P.line.map(id => `<button class="tile" data-id="${id}">${esc(word(id))}</button>`).join('');
    $('#bank').innerHTML = s._t.map(t => `<button class="tile ${P.line.includes(t.i) ? 'used' : ''}" data-id="${t.i}" ${P.line.includes(t.i) ? 'tabindex="-1" aria-hidden="true"' : ''}>${esc(t.w)}</button>`).join('');
    if (P.locked) return;
    $$('#line .tile').forEach(b => b.onclick = () => { P.line = P.line.filter(x => x !== +b.dataset.id); drawBuild(s, speakTiles); });
    $$('#bank .tile:not(.used)').forEach(b => b.onclick = () => { P.line.push(+b.dataset.id); if (speakTiles) speak(cmp(word(+b.dataset.id))); drawBuild(s, speakTiles); });
    enable(P.line.length > 0);
  }

  function show() {
    const s = P.queue[P.i];
    P.sel = null; P.checked = false; P.locked = false;
    TYPES[s.k].render(s);
  }
  /* Record a result: score, spaced repetition, and a second try at the end of the session */
  function settle(s, ok) {
    P.tot++;
    if (ok) { P.ok++; P.xp += 10; P.combo++; } else P.combo = 0;
    if (s.key) SRS.mark(s.key, ok);
    if (!ok && !s._re) { const again = { ...s, _re: true }; delete again._o; delete again._t; P.queue.push(again); }
    save();
  }
  function check() {
    if (P.checked) return;
    const s = P.queue[P.i], r = TYPES[s.k].check(s);
    if (!r) return;
    P.checked = true;
    settle(s, r.ok);
    const sh = $('#sheet');
    sh.className = 'sheet show ' + (r.ok ? 'good' : 'bad');
    sh.innerHTML = `<div class="sh-in"><div class="sh-h"><span class="sh-ic">${r.ok ? ICON.ok : ICON.x}</span>${r.ok ? pick(PRAISE) : 'Правильный ответ'}${r.ok && P.combo >= 3 ? `<span class="sh-combo">${P.combo} подряд</span>` : ''}</div>${r.html || ''}<button class="btn ${r.ok ? 'good' : 'bad'}" id="cont">Продолжить</button></div>`;
    $('#cont').onclick = next; focusQuiet($('#cont'));
    const c = $('#cta'); if (c) c.style.visibility = 'hidden';
    if (r.say) speak(r.say, 1, $('.sh-ans .say', sh));
  }
  function next() { P.i++; if (P.i < P.queue.length) { show(); window.scrollTo(0, 0); } else finish(); }

  function finish() {
    const acc = P.tot ? Math.round(P.ok / P.tot * 100) : 100, xp = P.xp + (P.lessonId ? 10 : 0);
    addXP(xp);
    if (P.lessonId) S.done[P.lessonId] = Math.max(S.done[P.lessonId] || 0, acc);
    (P.enroll || []).forEach(k => SRS.enroll(k));
    const d = daily();
    if (P.kind === 'rev') d.rev = 1; if (P.kind === 'lesson') d.lesson = 1; if (P.kind === 'listen') d.listen = 1;
    save();
    const added = (P.enroll || []).length, st = streak();
    const bits = Array.from({ length: 26 }, (_, i) => `<i style="--x:${Math.cos(i / 26 * 6.283) * (90 + (i % 3) * 30)}px;--y:${Math.sin(i / 26 * 6.283) * (90 + (i % 3) * 30)}px;--d:${(i % 5) * 40}ms;--s:${6 + (i % 3) * 3}px"></i>`).join('');
    root.innerHTML = `<div class="pl"><div class="fin"><div class="fin-burst">${bits}</div><div class="fin-mark">${ICON.ok}</div>
      <h2>${P.lessonId ? 'Урок пройден' : 'Готово'}</h2>
      <p>${acc === 100 ? 'Без единой ошибки. Mükemmel!' : acc >= 80 ? 'Хороший результат, так держать.' : 'Трудные места вернутся в повторении.'}${added ? ` ${added} ${plural(added, 'фраза добавлена', 'фразы добавлены', 'фраз добавлено')} в повторение на завтра.` : ''}</p>
      <div class="fin-stats"><div class="card"><span class="fs-ic">${ICON.bolt}</span><b>+${xp}</b><i>опыт</i></div><div class="card"><span class="fs-ic">${ICON.target}</span><b>${acc}%</b><i>точность</i></div><div class="card"><span class="fs-ic">${ICON.flame}</span><b>${st}</b><i>${plural(st, 'день', 'дня', 'дней')} подряд</i></div></div></div>
      <div class="pl-foot"><button class="btn" id="fin">Продолжить</button></div></div>`;
    $('#fin').onclick = close; focusQuiet($('#fin'));
  }

  document.addEventListener('keydown', e => {
    if (!P || e.isComposing) return;
    if (e.key === 'Enter') {
      const b = $('#fin') || ($('#sheet.show:not(.plain)') && $('#cont')) || $('#yes') || $('#cta');
      if (b && !b.disabled) { e.preventDefault(); b.click(); }
    } else if (/^[1-4]$/.test(e.key) && document.activeElement?.id !== 'field') {
      const b = $(`.opt[data-i="${+e.key - 1}"]`, root);
      if (b && !b.disabled) b.click();
    }
  });
  return { start };
})();

/* ───────────────────────── Screens ───────────────────────── */
const App = (() => {
  const app = $('#app');
  const V = { tab: 'today', cat: null };
  const ZIG = [0, 56, 84, 56, 0, -56, -84, -56];

  function wordOfDay() {
    const pool = BASE_ITEMS.concat(catItems(catById('phr')), catItems(catById('links'))).filter(x => x.tr.length > 3);
    return pool[today() % pool.length];
  }
  const topbar = () => `<div class="topbar"><div class="brand">${MARK}<span>Blably</span></div><div class="chip-streak" title="Дней подряд">${ICON.flame}<b>${streak()}</b></div></div>`;
  const tileIcon = (ic, cls) => `<span class="ic-tile ${cls || ''}">${ic}</span>`;

  const screens = {
    today() {
      const h = new Date().getHours();
      const g = h < 5 || h >= 23 ? ['İyi geceler', 'Доброй ночи'] : h < 12 ? ['Günaydın', 'Доброе утро'] : h < 18 ? ['İyi günler', 'Добрый день'] : ['İyi akşamlar', 'Добрый вечер'];
      const d = daily(), due = SRS.due().length, nl = nextLesson(S.track) || nextLesson(S.track === 'talk' ? 'gram' : 'talk');
      const xp = S.days[dkey()] || 0, st = streak(), w = wordOfDay();
      const plan = [
        { id: 'rev', ic: ICON.repeat, t: 'Повторение', s: due ? `${due} ${plural(due, 'фраза ждёт', 'фразы ждут', 'фраз ждут')} повторения` : (SRS.count() ? 'На сегодня всё повторено' : 'Появится после первого урока'), done: d.rev || (!due && SRS.count() > 0), off: !due },
        { id: 'lesson', ic: ICON.lesson, t: 'Новый урок', s: nl ? nl.t : 'Все уроки пройдены', done: d.lesson, off: !nl },
        { id: 'listen', ic: ICON.headphones, t: 'Аудирование', s: '10 фраз на слух', done: d.listen }
      ];
      const first = plan.find(p => !p.done && !p.off), doneN = plan.filter(p => p.done).length;
      return `${topbar()}
      <header class="head"><div class="eyebrow">${new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
        <h1 class="greet"><span>${g[0]}</span>${playBtn(g[0], 'soft lg')}</h1><p class="lead">${g[1]}. Десять минут в день дают больше, чем час раз в неделю.</p></header>
      <section class="card goal rise">
        <div class="goal-top"><div class="goal-ring">${ring(xp, S.goal, 76)}<span><b>${xp}</b><i>из ${S.goal}</i></span></div>
          <div><div class="eyebrow blue">Цель на сегодня</div><div class="goal-t">${doneN === 3 ? 'План выполнен' : xp >= S.goal ? 'Цель достигнута' : `Осталось ${Math.max(0, S.goal - xp)} XP`}</div><div class="goal-s">${doneN} из 3 шагов</div></div></div>
        <ol class="plan">${plan.map(p => `<li><button class="plan-row ${p.done ? 'done' : ''}" data-plan="${p.id}" ${p.off ? 'disabled' : ''}>${tileIcon(p.done ? ICON.ok : p.ic, p.done ? 'done' : '')}<span class="plan-t"><b>${p.t}</b><i>${esc(p.s)}</i></span><span class="chev">${ICON.chev}</span></button></li>`).join('')}</ol>
        ${first ? `<button class="btn" data-plan="${first.id}">${doneN ? 'Продолжить' : 'Начать занятие'}</button>` : '<div class="goal-done">Yarın görüşürüz! Увидимся завтра.</div>'}</section>
      <section class="stats rise">
        <div class="card stat">${tileIcon(ICON.flame)}<b>${st}</b><i>${plural(st, 'день', 'дня', 'дней')} подряд</i></div>
        <div class="card stat">${tileIcon(ICON.layers)}<b>${SRS.count()}</b><i>фраз в памяти</i></div>
        <div class="card stat">${tileIcon(ICON.bolt)}<b>${S.xp}</b><i>опыта всего</i></div></section>
      <h2 class="sec">Слово дня</h2>
      <button class="card wod rise" data-say="${esc(w.tr)}"><span><b>${esc(w.tr)}</b><i>${esc(w.ru)}</i></span><span class="say lg">${ICON.play}</span></button>
      <div class="foot" id="resetbox"><button class="link muted" id="reset">Сбросить прогресс</button></div>`;
    },
    course() {
      const tr = S.track, nx = nextLesson(tr);
      let n = 0;
      return `${topbar()}<header class="head"><h1>Курс</h1></header>
      <div class="seg"><button data-track="talk" class="${tr === 'talk' ? 'on' : ''}">Разговорный</button><button data-track="gram" class="${tr === 'gram' ? 'on' : ''}">Грамматика</button></div>
      <p class="lead">${tr === 'talk' ? 'Готовые фразы для жизни: слушаешь, собираешь, говоришь вслух. Правил минимум.' : 'Как устроены слова: гармония гласных, окончания, времена. Объясняет, почему говорят именно так.'}</p>
      <div class="track-prog"><span>Пройдено ${doneCount(tr)} из ${flat(tr).length}</span><span class="meter"><i style="width:${doneCount(tr) / flat(tr).length * 100}%"></i></span></div>
      ${units(tr).map((u, ui) => { const ud = u.ls.filter(l => l.id in S.done).length; return `<section class="unit">
        <div class="unit-card"><div><div class="eyebrow">Раздел ${ui + 1} · ${ud} из ${u.ls.length}</div><h2 class="unit-t">${u.u}</h2><p class="unit-d">${u.d}</p></div></div>
        <div class="path">${u.ls.map((l, li) => { n++; const done = l.id in S.done, isNext = nx && nx.id === l.id;
          return `<div class="node-wrap ${isNext ? 'tip' : ''}" style="--x:${ZIG[li % 8]}px">${isNext ? '<span class="node-tip">Начать</span>' : ''}<button class="node ${done ? 'done' : ''} ${isNext ? 'next' : ''}" data-lesson="${l.id}" aria-label="Урок ${n}: ${esc(l.t)}">${done ? ICON.ok : `<span>${n}</span>`}</button><span class="node-l">${l.t}${done ? `<i>${S.done[l.id]}% верно</i>` : ''}</span></div>`; }).join('')}</div></section>`; }).join('')}`;
    },
    practice() {
      const groups = {};
      Object.entries(TOPICS).forEach(([k, t]) => (groups[t.g] = groups[t.g] || []).push([k, t]));
      return `${topbar()}<header class="head"><h1>Тренировка</h1><p class="lead">Отдельные навыки: понять на слух, сказать самому, собрать правильную форму.</p></header>
      <div class="card rows rise">
        <button class="row" id="p-listen">${tileIcon(ICON.headphones)}<span class="row-t"><b>Аудирование</b><i>Слушаешь фразу, выбираешь перевод или пишешь её</i></span><span class="chev">${ICON.chev}</span></button>
        <button class="row" id="p-speak">${tileIcon(ICON.mic)}<span class="row-t"><b>Скажи вслух</b><i>Видишь русскую фразу, говоришь по-турецки</i></span><span class="chev">${ICON.chev}</span></button>
        <button class="row" id="p-mist" ${S.mist.length ? '' : 'disabled'}>${tileIcon(ICON.alert)}<span class="row-t"><b>Мои ошибки</b><i>${S.mist.length ? `${S.mist.length} ${plural(S.mist.length, 'форма', 'формы', 'форм')} на повтор` : 'Ошибок в грамматике пока нет'}</i></span><span class="chev">${ICON.chev}</span></button>
      </div>
      <h2 class="sec">Грамматика</h2>
      <p class="sec-d">Вопросы собираются заново каждый раз, так что запомнить ответы не выйдет, только правило.</p>
      <div class="card pad rise">
        ${Object.entries(groups).map(([g, a]) => `<div class="label">${g}</div><div class="chips">${a.map(([k, t]) => `<button class="chip ${S.sel.includes(k) ? 'on' : ''}" data-topic="${k}" aria-pressed="${S.sel.includes(k)}">${t.n}</button>`).join('')}</div>`).join('')}
        <div class="links"><button class="link" id="t-all">Выбрать все</button><button class="link" id="t-none">Снять все</button></div>
        <div class="label">Как отвечать</div>
        <div class="seg"><button data-mode="choice" class="${S.mode === 'choice' ? 'on' : ''}">Выбирать</button><button data-mode="type" class="${S.mode === 'type' ? 'on' : ''}">Писать самому</button></div>
        <button class="btn" id="p-gram" ${S.sel.length ? '' : 'disabled'}>Начать: 10 вопросов</button>
      </div>`;
    },
    words() {
      if (V.cat) return screens.cat();
      const total = ALLCATS.reduce((a, c) => a + c.it.length, 0);
      return `${topbar()}<header class="head"><h1>Слова</h1><p class="lead">${total} слов и фраз с озвучкой. Выученное само возвращается на повторение через день, три, неделю.</p></header>
      ${WG.map(g => `<h2 class="sec">${g.g}</h2><p class="sec-d">${g.d}</p><div class="tiles">${g.cats.map(c => {
        const its = catItems(c), k = its.filter(x => SRS.known(x.tr)).length;
        return `<button class="card tile-c" data-cat="${c.id}"><b>${esc(c.s)}</b><span>${c.n}</span><i>${k} из ${its.length}</i><span class="meter"><i style="width:${k / its.length * 100}%"></i></span></button>`; }).join('')}</div>`).join('')}`;
    },
    cat() {
      const c = catById(V.cat), its = catItems(c), k = its.filter(x => SRS.known(x.tr)).length;
      return `<div class="topbar"><button class="back" id="back">${ICON.back}Слова</button></div>
      <header class="head tight"><h1>${c.n}</h1><p class="lead">Знаешь ${k} из ${its.length}. Нажми на слово, чтобы послушать.</p></header>
      <div class="pair-btn"><button class="btn" id="c-learn">Учить</button><button class="btn soft" id="c-listen">${ICON.headphones}Слушать</button></div>
      <div class="card rows words rise">${c.it.map(x => {
        const key = speakKey(x[0]), st = SRS.get(key), known = st && st.b >= 3;
        return `<div class="row"><button class="row-t w" data-say="${esc(x[0])}"><span class="say sm soft">${ICON.play}</span><span><b>${esc(x[0])}</b><i>${esc(x[1])}</i>${x[2] ? `<em>${esc(x[2])}</em>` : ''}</span></button><button class="lvl ${known ? 'on' : st ? 'mid' : ''}" data-know="${esc(key)}" aria-label="Отметить, знаю или нет">${known ? 'знаю' : st ? 'учу' : 'знаю?'}</button></div>`; }).join('')}</div>`;
    }
  };

  function render() {
    app.innerHTML = screens[V.tab]();
    $$('.tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === V.tab));
    wire();
  }
  function go(tab) { V.tab = tab; V.cat = null; render(); window.scrollTo(0, 0); }
  const on = (sel, fn) => $$(sel, app).forEach(el => el.onclick = () => fn(el));

  function wire() {
    on('[data-plan]', el => ({ rev: () => Sessions.review(), lesson: () => { const l = nextLesson(S.track) || nextLesson(S.track === 'talk' ? 'gram' : 'talk'); if (l) Sessions.lesson(l.id); }, listen: () => Sessions.listening(LISTEN_POOL) })[el.dataset.plan]());
    on('[data-lesson]', el => Sessions.lesson(el.dataset.lesson));
    on('[data-track]', el => { S.track = el.dataset.track; save(); render(); });
    on('[data-topic]', el => { const t = el.dataset.topic; S.sel = S.sel.includes(t) ? S.sel.filter(x => x !== t) : [...S.sel, t]; save(); render(); });
    on('[data-mode]', el => { S.mode = el.dataset.mode; save(); render(); });
    on('#t-all', () => { S.sel = Object.keys(TOPICS); save(); render(); });
    on('#t-none', () => { S.sel = []; save(); render(); });
    on('#p-gram', () => Sessions.grammar(S.sel));
    on('#p-listen', () => Sessions.listening(LISTEN_POOL));
    on('#p-speak', () => Sessions.speaking());
    on('#p-mist', () => Sessions.mistakes());
    on('[data-cat]', el => { V.cat = el.dataset.cat; render(); window.scrollTo(0, 0); });
    on('#back', () => { V.cat = null; render(); window.scrollTo(0, 0); });
    on('#c-learn', () => { const c = catById(V.cat); Sessions.words(catItems(c), c.n); });
    on('#c-listen', () => { const c = catById(V.cat); Sessions.listening(catItems(c), c.n); });
    on('[data-know]', el => { const k = el.dataset.know; if (SRS.known(k)) delete S.srs[k]; else S.srs[k] = { b: 4, d: today() + 16 }; save(); render(); });
    on('#reset', () => {
      $('#resetbox').innerHTML = `<div class="card pad center"><b>Сбросить весь прогресс?</b><p class="sec-d">Уроки, опыт и выученные фразы удалятся с этого устройства.</p><div class="pair-btn"><button class="btn soft" id="r-no">Отмена</button><button class="btn bad" id="r-yes">Сбросить</button></div></div>`;
      $('#r-no').onclick = render;
      $('#r-yes').onclick = () => { S = FRESH(); save(); render(); };
    });
  }

  $$('.tabs button').forEach(b => { b.insertAdjacentHTML('afterbegin', ICON[b.dataset.icon]); b.onclick = () => go(b.dataset.tab); });
  return { render, go };
})();

App.go('today');
