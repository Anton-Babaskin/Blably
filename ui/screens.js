/* Screens: the four tabs (Сегодня, Курс, Тренировка, Слова), settings, and navigation between them.
   Numbers and plans come from the core; this file only draws them and passes taps on. Texts come from i18n/. */
import { $, $$, esc } from './dom.js';
import { ICON, MARK } from './icons.js';
import { playBtn, ring, lang } from './common.js';
import { Player } from './player.js';
import { S, save, now, today, course, srs, sessions } from './state.js';
import { t, currentLang, useLang, chosenLang } from './i18n.js';
import { speakKey } from '../core/text.js';
import { UI_LANGS, LANG_NAMES } from '../core/i18n.js';
import { streak, dateKey, daySlot, resetState } from '../core/progress.js';

const LISTEN_COUNT = 10, GRAMMAR_COUNT = 10;

export const App = (() => {
  const app = $('#app');
  const V = { tab: 'today', cat: null, back: 'today' };
  const ZIG = [0, 56, 84, 56, 0, -56, -84, -56];

  const topbar = () => `<div class="topbar"><div class="brand">${MARK}<span>Blably</span></div><div class="top-r"><div class="chip-streak" title="${esc(t('top.streak'))}">${ICON.flame}<b>${streak(S, now())}</b></div><button class="gear" id="gear" aria-label="${esc(t('top.settings'))}">${ICON.gear}</button></div></div>`;
  const backbar = label => `<div class="topbar"><button class="back" id="back">${ICON.back}${esc(label)}</button></div>`;
  const tileIcon = (ic, cls) => `<span class="ic-tile ${cls || ''}">${ic}</span>`;

  const screens = {
    today() {
      const slot = daySlot(now().getHours());
      const g = [course.META.greet[slot], t(`today.greet.${slot}`)];
      const pl = sessions.todayPlan(today()), due = pl.due, nl = pl.next;
      const xp = S.days[dateKey(now())] || 0, st = streak(S, now()), w = course.wordOfDay(today());
      const TEXT = {
        rev: { ic: ICON.repeat, t: t('today.review'), s: due ? t('today.due', { n: due }) : (pl.count ? t('today.allReviewed') : t('today.reviewLater')) },
        lesson: { ic: ICON.lesson, t: t('today.newLesson'), s: nl ? nl.t : t('today.allDone') },
        listen: { ic: ICON.headphones, t: t('today.listening'), s: t('today.listenSub', { n: LISTEN_COUNT }) }
      };
      const plan = pl.rows.map(r => ({ ...r, ...TEXT[r.id] })), first = pl.first, doneN = pl.doneN;
      return `${topbar()}
      <header class="head"><div class="eyebrow">${now().toLocaleDateString(currentLang(), { weekday: 'long', day: 'numeric', month: 'long' })}</div>
        <h1 class="greet"><span>${g[0]}</span>${playBtn(g[0], 'soft lg')}</h1><p class="lead">${g[1]}. ${t('today.lead')}</p></header>
      <section class="card goal rise">
        <div class="goal-top"><div class="goal-ring">${ring(xp, S.goal, 76)}<span><b>${xp}</b><i>${t('today.of', { n: S.goal })}</i></span></div>
          <div><div class="eyebrow blue">${t('today.goal')}</div><div class="goal-t">${doneN === 3 ? t('today.planDone') : xp >= S.goal ? t('today.goalReached') : t('today.xpLeft', { n: Math.max(0, S.goal - xp) })}</div><div class="goal-s">${t('today.steps', { done: doneN, total: 3 })}</div></div></div>
        <ol class="plan">${plan.map(p => `<li><button class="plan-row ${p.done ? 'done' : ''}" data-plan="${p.id}" ${p.off ? 'disabled' : ''}>${tileIcon(p.done ? ICON.ok : p.ic, p.done ? 'done' : '')}<span class="plan-t"><b>${p.t}</b><i>${esc(p.s)}</i></span><span class="chev">${ICON.chev}</span></button></li>`).join('')}</ol>
        ${first ? `<button class="btn" data-plan="${first.id}">${doneN ? t('common.continue') : t('today.begin')}</button>` : `<div class="goal-done">${course.META.bye} ${t('today.bye')}</div>`}</section>
      <section class="stats rise">
        <div class="card stat">${tileIcon(ICON.flame)}<b>${st}</b><i>${t('common.streakDays', { n: st })}</i></div>
        <div class="card stat">${tileIcon(ICON.layers)}<b>${srs.count()}</b><i>${t('today.inMemory', { n: srs.count() })}</i></div>
        <div class="card stat">${tileIcon(ICON.bolt)}<b>${S.xp}</b><i>${t('today.xpTotal')}</i></div></section>
      <h2 class="sec">${t('today.wordOfDay')}</h2>
      <button class="card wod rise" data-say="${esc(w.tr)}"><span><b>${esc(w.tr)}</b><i>${esc(w.ru)}</i></span><span class="say lg">${ICON.play}</span></button>
      <div class="foot" id="resetbox"><button class="link muted" id="reset">${t('today.reset')}</button></div>`;
    },
    course() {
      const tr = S.track, nx = course.nextLesson(S, tr), done = course.doneCount(S, tr), all = course.flat(tr).length;
      let n = 0;
      return `${topbar()}<header class="head"><h1>${t('course.title')}</h1></header>
      <div class="seg"><button data-track="talk" class="${tr === 'talk' ? 'on' : ''}">${t('course.talk')}</button><button data-track="gram" class="${tr === 'gram' ? 'on' : ''}">${t('course.gram')}</button></div>
      <p class="lead">${tr === 'talk' ? t('course.talkLead') : t('course.gramLead')}</p>
      <div class="track-prog"><span>${t('course.done', { done, total: all })}</span><span class="meter"><i style="width:${done / all * 100}%"></i></span></div>
      ${course.units(tr).map((u, ui) => { const ud = u.ls.filter(l => l.id in S.done).length; return `<section class="unit">
        <div class="unit-card"><div><div class="eyebrow">${t('course.unit', { n: ui + 1, done: ud, total: u.ls.length })}</div><h2 class="unit-t">${u.u}</h2><p class="unit-d">${u.d}</p></div></div>
        <div class="path">${u.ls.map((l, li) => { n++; const done = l.id in S.done, isNext = nx && nx.id === l.id;
          return `<div class="node-wrap ${isNext ? 'tip' : ''}" style="--x:${ZIG[li % 8]}px">${isNext ? `<span class="node-tip">${t('course.start')}</span>` : ''}<button class="node ${done ? 'done' : ''} ${isNext ? 'next' : ''}" data-lesson="${l.id}" aria-label="${esc(t('course.lessonLabel', { n, title: l.t }))}">${done ? ICON.ok : `<span>${n}</span>`}</button><span class="node-l">${l.t}${done ? `<i>${t('course.score', { pct: S.done[l.id] })}</i>` : ''}</span></div>`; }).join('')}</div></section>`; }).join('')}`;
    },
    practice() {
      const groups = {};
      Object.entries(course.topics).forEach(([k, tp]) => (groups[tp.g] = groups[tp.g] || []).push([k, tp]));
      return `${topbar()}<header class="head"><h1>${t('practice.title')}</h1><p class="lead">${t('practice.lead')}</p></header>
      <div class="card rows rise">
        <button class="row" id="p-listen">${tileIcon(ICON.headphones)}<span class="row-t"><b>${t('practice.listening')}</b><i>${t('practice.listeningSub')}</i></span><span class="chev">${ICON.chev}</span></button>
        <button class="row" id="p-speak">${tileIcon(ICON.mic)}<span class="row-t"><b>${t('practice.speaking')}</b><i>${t('practice.speakingSub', lang())}</i></span><span class="chev">${ICON.chev}</span></button>
        <button class="row" id="p-mist" ${S.mist.length ? '' : 'disabled'}>${tileIcon(ICON.alert)}<span class="row-t"><b>${t('practice.mistakes')}</b><i>${S.mist.length ? t('practice.mistakesSub', { n: S.mist.length }) : t('practice.noMistakes')}</i></span><span class="chev">${ICON.chev}</span></button>
      </div>
      <h2 class="sec">${t('practice.grammar')}</h2>
      <p class="sec-d">${t('practice.grammarNote')}</p>
      <div class="card pad rise">
        ${Object.entries(groups).map(([g, a]) => `<div class="label">${g}</div><div class="chips">${a.map(([k, tp]) => `<button class="chip ${S.sel.includes(k) ? 'on' : ''}" data-topic="${k}" aria-pressed="${S.sel.includes(k)}">${tp.n}</button>`).join('')}</div>`).join('')}
        <div class="links"><button class="link" id="t-all">${t('practice.selectAll')}</button><button class="link" id="t-none">${t('practice.selectNone')}</button></div>
        <div class="label">${t('practice.howToAnswer')}</div>
        <div class="seg"><button data-mode="choice" class="${S.mode === 'choice' ? 'on' : ''}">${t('practice.choose')}</button><button data-mode="type" class="${S.mode === 'type' ? 'on' : ''}">${t('practice.type')}</button></div>
        <button class="btn" id="p-gram" ${S.sel.length ? '' : 'disabled'}>${t('practice.start', { n: GRAMMAR_COUNT })}</button>
      </div>`;
    },
    words() {
      if (V.cat) return screens.cat();
      return `${topbar()}<header class="head"><h1>${t('words.title')}</h1><p class="lead">${t('words.lead', { n: course.totalWords })}</p></header>
      ${course.groups.map(g => `<h2 class="sec">${g.g}</h2><p class="sec-d">${g.d}</p><div class="tiles">${g.cats.map(c => {
        const its = course.catItems(c), k = its.filter(x => srs.known(x.tr)).length;
        return `<button class="card tile-c" data-cat="${c.id}"><b>${esc(c.s)}</b><span>${c.n}</span><i>${t('words.known', { k, n: its.length })}</i><span class="meter"><i style="width:${k / its.length * 100}%"></i></span></button>`; }).join('')}</div>`).join('')}`;
    },
    cat() {
      const c = course.catById(V.cat), its = course.catItems(c), k = its.filter(x => srs.known(x.tr)).length;
      return `${backbar(t('words.title'))}
      <header class="head tight"><h1>${c.n}</h1><p class="lead">${t('words.catLead', { k, n: its.length })}</p></header>
      <div class="pair-btn"><button class="btn" id="c-learn">${t('words.learn')}</button><button class="btn soft" id="c-listen">${ICON.headphones}${t('words.listen')}</button></div>
      <div class="card rows words rise">${c.it.map(x => {
        const key = speakKey(x[0]), st = srs.get(key), known = st && st.b >= 3;
        return `<div class="row"><button class="row-t w" data-say="${esc(x[0])}"><span class="say sm soft">${ICON.play}</span><span><b>${esc(x[0])}</b><i>${esc(x[1])}</i>${x[2] ? `<em>${esc(x[2])}</em>` : ''}</span></button><button class="lvl ${known ? 'on' : st ? 'mid' : ''}" data-know="${esc(key)}" aria-label="${esc(t('words.markKnown'))}">${known ? t('words.know') : st ? t('words.learning') : t('words.knowQ')}</button></div>`; }).join('')}</div>`;
    },
    /* Settings: for now only the interface language. «Как в браузере» follows the browser. */
    settings() {
      const choice = (id, name, sub) => { const on = (S.lang || 'auto') === id;
        return `<button class="row choice" role="radio" aria-checked="${on}" data-lang="${id}"><span class="row-t"><b>${esc(name)}</b>${sub ? `<i>${esc(sub)}</i>` : ''}</span><span class="pick">${ICON.ok}</span></button>`; };
      return `${backbar(t('top.back'))}
      <header class="head tight"><h1>${t('settings.title')}</h1></header>
      <div class="label">${t('settings.language')}</div>
      <div class="card rows rise" role="radiogroup" aria-label="${esc(t('settings.language'))}">
        ${choice('auto', t('settings.auto'), LANG_NAMES[chosenLang(null)])}
        ${UI_LANGS.map(l => choice(l, LANG_NAMES[l])).join('')}
      </div>
      <p class="sec-d note">${t('settings.languageNote')}</p>`;
    }
  };

  /* Words on the bottom bar follow the interface language */
  function label() {
    $('.tabs').setAttribute('aria-label', t('app.sections'));
    $$('.tabs button').forEach(b => { b.querySelector('.tab-l').textContent = t(`tabs.${b.dataset.tab}`); });
  }
  function render() {
    label();
    app.innerHTML = screens[V.tab]();
    $$('.tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === V.tab));
    wire();
  }
  function go(tab) { V.tab = tab; V.cat = null; render(); window.scrollTo(0, 0); }
  const on = (sel, fn) => $$(sel, app).forEach(el => el.onclick = () => fn(el));

  function wire() {
    on('[data-plan]', el => ({ rev: () => Player.start(sessions.review()), lesson: () => { const l = sessions.nextLesson(); if (l) Player.start(sessions.lesson(l.id)); }, listen: () => Player.start(sessions.listening(course.LISTEN_POOL)) })[el.dataset.plan]());
    on('[data-lesson]', el => Player.start(sessions.lesson(el.dataset.lesson)));
    on('[data-track]', el => { S.track = el.dataset.track; save(); render(); });
    on('[data-topic]', el => { const tp = el.dataset.topic; S.sel = S.sel.includes(tp) ? S.sel.filter(x => x !== tp) : [...S.sel, tp]; save(); render(); });
    on('[data-mode]', el => { S.mode = el.dataset.mode; save(); render(); });
    on('#t-all', () => { S.sel = Object.keys(course.topics); save(); render(); });
    on('#t-none', () => { S.sel = []; save(); render(); });
    on('#p-gram', () => Player.start(sessions.grammar(S.sel, GRAMMAR_COUNT)));
    on('#p-listen', () => Player.start(sessions.listening(course.LISTEN_POOL)));
    on('#p-speak', () => Player.start(sessions.speaking()));
    on('#p-mist', () => Player.start(sessions.mistakes()));
    on('[data-cat]', el => { V.cat = el.dataset.cat; render(); window.scrollTo(0, 0); });
    on('#gear', () => { V.back = V.tab; go('settings'); });
    on('#back', () => { if (V.tab === 'settings') go(V.back); else { V.cat = null; render(); window.scrollTo(0, 0); } });
    on('#c-learn', () => { const c = course.catById(V.cat); Player.start(sessions.words(course.catItems(c), c.n)); });
    on('#c-listen', () => { const c = course.catById(V.cat); Player.start(sessions.listening(course.catItems(c), c.n)); });
    on('[data-know]', el => { srs.toggleKnown(el.dataset.know); save(); render(); });
    on('[data-lang]', async el => {
      if (el.dataset.lang === 'auto') delete S.lang; else S.lang = el.dataset.lang;
      save();
      await useLang(chosenLang(S.lang));
      render();
    });
    on('#reset', () => {
      $('#resetbox').innerHTML = `<div class="card pad center"><b>${t('today.resetAsk')}</b><p class="sec-d">${t('today.resetNote')}</p><div class="pair-btn"><button class="btn soft" id="r-no">${t('today.cancel')}</button><button class="btn bad" id="r-yes">${t('today.resetYes')}</button></div></div>`;
      $('#r-no').onclick = render;
      $('#r-yes').onclick = () => { resetState(S); save(); render(); };
    });
  }

  $$('.tabs button').forEach(b => { b.insertAdjacentHTML('afterbegin', `${ICON[b.dataset.icon]}<span class="tab-l"></span>`); b.onclick = () => go(b.dataset.tab); });
  return { render, go };
})();
