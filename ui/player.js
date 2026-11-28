/* Screens: the full-screen lesson player. Draws each step, collects the answer,
   asks the core whether it is right, and shows the result. The rules live in core/run.js. */
import { $, $$, esc, focusQuiet } from './dom.js';
import { ICON } from './icons.js';
import { Sound } from './audio.js';
import { playBtn, speak, letterKeys, wireKeys, lang } from './common.js';
import { shownText, gqPrompt } from './prompts.js';
import { save, runner, course } from './state.js';
import { t } from './i18n.js';
import { pick, cmp } from '../core/text.js';

/* Words for the codes the core uses */
const ASK = { meaning: () => t('player.askMeaning'), translate: () => t('player.askTranslate', lang()) };
const NOTE = { listenRepeat: () => t('player.listenRepeat') };
const LISTEN_NOTE = { letters: () => t('player.letters', { letters: [...course.META.letters].join(' ') }) };
const LISTEN_TITLE = { mc: 'player.listenMc', build: 'player.listenBuild', type: 'player.listenType' };
/* Praise in the interface language and in the language being learned */
const praise = () => [...t('player.praise'), ...course.META.praise];

const root = $('#player');
let P = null;                       // the session in progress, owned by the core runner
let onClose = () => {};
const ui = { sel: null, line: [], checked: false, locked: false };   // what the learner has picked on this step

function start(cfg) {
  if (!cfg || !runner.start(cfg)) return;
  P = runner.run;
  Sound.preload(runner.phrases());
  document.body.classList.add('playing');
  window.scrollTo(0, 0);
  show();
}
function close() { document.body.classList.remove('playing'); root.innerHTML = ''; runner.stop(); P = null; onClose(); window.scrollTo(0, 0); }

function frame(body, cta, enabled) {
  const pct = Math.round(P.i / P.queue.length * 100);
  root.innerHTML = `<div class="pl">
    <div class="pl-top"><button class="pl-x" id="plx" aria-label="${esc(t('player.close'))}">${ICON.x}</button>
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
  sh.innerHTML = `<div class="sh-in"><div class="sh-h">${t('player.quitTitle')}</div><div class="sh-note">${t('player.quitNote')}</div>
    <div class="pair-btn"><button class="btn soft" id="leave">${t('player.quit')}</button><button class="btn" id="stay">${t('player.stay')}</button></div></div>`;
  $('#stay').onclick = () => { sh.className = 'sheet'; $('#scrim').classList.remove('show'); };
  $('#scrim').onclick = $('#stay').onclick;
  $('#leave').onclick = close;
}
const enable = on => { const c = $('#cta'); if (c) c.disabled = !on; };
const field = (placeholder, label) => `<input class="field" id="field" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="${esc(placeholder)}" aria-label="${esc(label)}">${letterKeys()}`;
const yourAnswer = given => `<div class="sh-note">${t('player.yourAnswer')} <s>${esc(given)}</s></div>`;

/* Each step type: render(step) draws it, check(step) returns {ok, html, say} or null if nothing to check yet */
const TYPES = {
  learn: {
    render(s) {
      const b = s.b || (NOTE[s.note] ? NOTE[s.note]() : '');
      frame(`<div class="learn"><div class="kicker">${ICON.sparkle}${t('player.new')}</div><h2 class="l-t">${s.t}</h2>${b ? `<div class="l-b">${b}</div>` : ''}
        ${s.ex.length ? `<div class="card ex">${s.ex.map(e => `<button class="ex-row" data-say="${esc(e[0])}"><span><b>${esc(e[0])}</b><i>${esc(e[1])}</i></span><span class="say soft">${ICON.play}</span></button>`).join('')}</div><p class="hint">${t('player.learnHint')}</p>` : ''}</div>`, t('common.next'), true);
      $('#cta').onclick = next;
    }
  },
  mc: {
    render(s) {
      runner.prepare(s);
      const short = s._o.every(o => o.length < 15);
      frame(`<h2 class="q-t">${s.ask ? ASK[s.ask]() : t('player.askChoose')}</h2>
        <div class="q-card"><div class="q-main">${s.show ? shownText(s.show) : s.q}</div>${s.say ? playBtn(s.say, 'lg') : ''}</div>
        <div class="opts ${short ? 'two' : ''}">${s._o.map((o, i) => `<button class="opt ${s.trOpts ? 'tr' : ''}" data-i="${i}">${esc(o)}</button>`).join('')}</div>`, t('common.check'), false);
      wireOpts();
      if (s.say && s.auto) speak(s.say, 1, $('.q-card .say', root));
    },
    check(s) {
      const r = runner.check(s, { sel: ui.sel });
      if (!r) return null;
      paintOpts(r.correct);
      return { ok: r.ok, html: (r.ok ? '' : `<div class="sh-ans"><span>${esc(r.answer)}</span>${r.answerIsTarget ? playBtn(r.answer) : ''}</div>`) + (r.why ? `<div class="sh-note">${r.why}</div>` : ''), say: r.say };
    }
  },
  gq: {
    render(s) {
      runner.prepare(s);
      Sound.preload([s.q.answer]);
      const typing = P.mode === 'type';
      frame(`<h2 class="q-t">${typing ? t('player.gqType') : t('player.gqChoose')}</h2><div class="q-card"><div class="q-main">${gqPrompt(s.q.prompt)}</div></div>
        ${typing ? field(t('player.gqPlaceholder'), t('player.answer'))
          : `<div class="opts two">${s.q.options.map((o, i) => `<button class="opt tr" data-i="${i}">${esc(o)}</button>`).join('')}</div>`}`, t('common.check'), false);
      if (typing) { const f = $('#field'); focusQuiet(f); wireKeys(f, () => enable(f.value.trim())); $('#cta').onclick = check; }
      else wireOpts();
    },
    check(s) {
      const typing = P.mode === 'type';
      const r = runner.check(s, { given: typing ? $('#field').value : (ui.sel == null ? undefined : s.q.options[ui.sel]) });
      if (!r) return null;
      if (typing) $('#field').readOnly = true; else paintOpts(r.correct);
      return { ok: r.ok, say: r.say, html: `${!r.ok && typing ? yourAnswer(r.given) : ''}
        <div class="sh-ans"><span class="morph">${r.parts.map((p, i) => `<span class="m${Math.min(i, 3)}">${esc(p)}</span>`).join('')}</span>${playBtn(r.answer)}</div>
        <details ${r.ok ? '' : 'open'}><summary>${t('player.why')}</summary><ul>${r.why.map(w => `<li>${w}</li>`).join('')}</ul></details>` };
    }
  },
  build: {
    render(s) {
      runner.prepare(s);
      ui.line = [];
      frame(`<h2 class="q-t">${t('player.build')}</h2><div class="q-card"><div class="q-main big-ru">${esc(s.ru)}</div></div><div class="line" id="line"></div><div class="bank" id="bank"></div>`, t('common.check'), false);
      drawBuild(s, true); $('#cta').onclick = check;
    },
    check(s) {
      const r = runner.check(s, { line: ui.line });
      if (!r) return null;
      ui.locked = true; drawBuild(s, true);
      return { ok: r.ok, say: r.say, html: `<div class="sh-ans"><span>${esc(r.answer)}</span>${playBtn(r.answer)}</div>` };
    }
  },
  match: {
    render(s) {
      const { L, R } = runner.prepare(s);
      const st = { l: null, r: null, done: 0, err: 0 };
      frame(`<h2 class="q-t">${t('player.match')}</h2><div class="match"><div>${L.map(x => `<button class="mt tr" data-side="l" data-i="${x.i}">${esc(x.t)}</button>`).join('')}</div><div>${R.map(x => `<button class="mt" data-side="r" data-i="${x.i}">${esc(x.t)}</button>`).join('')}</div></div>`, t('common.next'), false);
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
      $('#cta').onclick = () => { runner.matchDone(st.err); next(); };
    }
  },
  listen: {
    render(s) {
      runner.prepare(s);
      let inner;
      if (s.m === 'mc') inner = `<div class="opts">${s._o.map((o, i) => `<button class="opt" data-i="${i}">${esc(o)}</button>`).join('')}</div>`;
      else if (s.m === 'build') { ui.line = []; inner = '<div class="line" id="line"></div><div class="bank" id="bank"></div>'; }
      else inner = field(t('player.typeIn', lang()), t('player.whatYouHear'));
      frame(`<h2 class="q-t">${t(LISTEN_TITLE[s.m])}</h2>
        <div class="hear"><button class="hear-main" id="hear" data-say="${esc(s.tr)}" aria-label="${esc(t('player.again'))}">${ICON.speaker}</button>
        <button class="hear-slow" data-say="${esc(s.tr)}" data-rate="0.65">${t('player.slower')}</button></div>${inner}`, t('common.check'), false);
      if (s.m === 'mc') wireOpts();
      else if (s.m === 'build') { drawBuild(s, false); $('#cta').onclick = check; }
      else { const f = $('#field'); wireKeys(f, () => enable(f.value.trim())); $('#cta').onclick = check; }
      speak(s.tr, 1, $('#hear'));
    },
    check(s) {
      const r = runner.check(s, s.m === 'mc' ? { sel: ui.sel } : s.m === 'build' ? { line: ui.line } : { given: $('#field').value });
      if (!r) return null;
      if (s.m === 'mc') paintOpts(r.correct);
      else if (s.m === 'build') { ui.locked = true; drawBuild(s, false); }
      else $('#field').readOnly = true;
      return { ok: r.ok, say: r.say, html: `<div class="sh-ans"><span>${esc(r.answer)}</span>${playBtn(r.answer)}</div><div class="sh-note">${esc(r.meaning)}</div>${r.note ? `<div class="sh-note">${LISTEN_NOTE[r.note]()}</div>` : ''}${!r.ok && r.given ? yourAnswer(r.given) : ''}` };
    }
  },
  speak: {
    render(s) {
      frame(`<h2 class="q-t">${t('player.speakTitle', lang())}</h2><div class="q-card tall"><div class="mic-badge">${ICON.mic}</div><div class="q-main big-ru center">${esc(s.ru)}</div></div>
        <div id="reveal"><p class="hint center">${t('player.speakHint')}</p></div>`, t('player.reveal'), true);
      $('#cta').onclick = () => {
        $('#reveal').innerHTML = `<div class="card answer step-in"><div><b>${esc(s.tr)}</b></div>${playBtn(s.tr, 'lg')}</div><p class="hint center">${t('player.speakAgain')}</p>`;
        $('.pl-foot', root).innerHTML = `<div class="pair-btn"><button class="btn soft" id="no">${t('player.stillLearning')}</button><button class="btn" id="yes">${t('player.gotIt')}</button></div>`;
        speak(s.tr, 1, $('.answer .say', root));
        $('#yes').onclick = () => { settle(s, true); next(); };
        $('#no').onclick = () => { settle(s, false); next(); };
      };
    }
  }
};

function wireOpts() {
  $$('.opt', root).forEach(b => b.onclick = () => {
    if (ui.checked) return;
    $$('.opt', root).forEach(x => x.classList.remove('sel'));
    b.classList.add('sel'); ui.sel = +b.dataset.i; enable(true);
  });
  $('#cta').onclick = check;
}
function paintOpts(correct) {
  $$('.opt', root).forEach(b => {
    const i = +b.dataset.i; b.disabled = true;
    if (correct.includes(i)) b.classList.add('ok'); else if (i === ui.sel) b.classList.add('no');
    b.classList.remove('sel');
  });
}
function drawBuild(s, speakTiles) {
  const word = id => s._t.find(x => x.i === id).w;
  $('#line').innerHTML = ui.line.map(id => `<button class="tile" data-id="${id}">${esc(word(id))}</button>`).join('');
  $('#bank').innerHTML = s._t.map(x => `<button class="tile ${ui.line.includes(x.i) ? 'used' : ''}" data-id="${x.i}" ${ui.line.includes(x.i) ? 'tabindex="-1" aria-hidden="true"' : ''}>${esc(x.w)}</button>`).join('');
  if (ui.locked) return;
  $$('#line .tile').forEach(b => b.onclick = () => { ui.line = ui.line.filter(x => x !== +b.dataset.id); drawBuild(s, speakTiles); });
  $$('#bank .tile:not(.used)').forEach(b => b.onclick = () => { ui.line.push(+b.dataset.id); if (speakTiles) speak(cmp(word(+b.dataset.id))); drawBuild(s, speakTiles); });
  enable(ui.line.length > 0);
}

function show() {
  const s = runner.current();
  ui.sel = null; ui.checked = false; ui.locked = false;
  TYPES[s.k].render(s);
}
function settle(s, ok) { runner.settle(s, ok); save(); }
function check() {
  if (ui.checked) return;
  const s = runner.current(), r = TYPES[s.k].check(s);
  if (!r) return;
  ui.checked = true;
  settle(s, r.ok);
  const sh = $('#sheet');
  sh.className = 'sheet show ' + (r.ok ? 'good' : 'bad');
  sh.innerHTML = `<div class="sh-in"><div class="sh-h"><span class="sh-ic">${r.ok ? ICON.ok : ICON.x}</span>${r.ok ? pick(praise()) : t('player.wrong')}${r.ok && P.combo >= 3 ? `<span class="sh-combo">${t('player.combo', { n: P.combo })}</span>` : ''}</div>${r.html || ''}<button class="btn ${r.ok ? 'good' : 'bad'}" id="cont">${t('common.continue')}</button></div>`;
  $('#cont').onclick = next; focusQuiet($('#cont'));
  const c = $('#cta'); if (c) c.style.visibility = 'hidden';
  if (r.say) speak(r.say, 1, $('.sh-ans .say', sh));
}
function next() { if (runner.next()) { show(); window.scrollTo(0, 0); } else finish(); }

function finish() {
  const f = runner.finish();
  save();
  const { acc, xp, added, streak: st } = f;
  const result = acc === 100 ? `${t('fin.perfect')} ${course.META.perfect}` : acc >= 80 ? t('fin.good') : t('fin.hard');
  const bits = Array.from({ length: 26 }, (_, i) => `<i style="--x:${Math.cos(i / 26 * 6.283) * (90 + (i % 3) * 30)}px;--y:${Math.sin(i / 26 * 6.283) * (90 + (i % 3) * 30)}px;--d:${(i % 5) * 40}ms;--s:${6 + (i % 3) * 3}px"></i>`).join('');
  root.innerHTML = `<div class="pl"><div class="fin"><div class="fin-burst">${bits}</div><div class="fin-mark">${ICON.ok}</div>
    <h2>${f.lesson ? t('fin.lesson') : t('fin.done')}</h2>
    <p>${result}${added ? ` ${t('fin.added', { n: added })}` : ''}</p>
    <div class="fin-stats"><div class="card"><span class="fs-ic">${ICON.bolt}</span><b>+${xp}</b><i>${t('fin.xp')}</i></div><div class="card"><span class="fs-ic">${ICON.target}</span><b>${acc}%</b><i>${t('fin.accuracy')}</i></div><div class="card"><span class="fs-ic">${ICON.flame}</span><b>${st}</b><i>${t('common.streakDays', { n: st })}</i></div></div></div>
    <div class="pl-foot"><button class="btn" id="fin">${t('common.continue')}</button></div></div>`;
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

export const Player = { start, onClose: fn => { onClose = fn; } };
