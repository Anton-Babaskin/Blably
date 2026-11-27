/* Screens: the four tabs (Сегодня, Курс, Тренировка, Слова) and navigation between them.
   Numbers and plans come from the core; this file only draws them and passes taps on. */
import { $, $$, esc, plural } from './dom.js';
import { ICON, MARK } from './icons.js';
import { playBtn, ring } from './common.js';
import { Player } from './player.js';
import { S, save, now, today, course, srs, sessions } from './state.js';
import { TOPICS } from '../core/morph.js';
import { speakKey } from '../core/text.js';
import { streak, dateKey, daySlot, resetState } from '../core/progress.js';

const GREET = { night: ['İyi geceler', 'Доброй ночи'], morning: ['Günaydın', 'Доброе утро'], day: ['İyi günler', 'Добрый день'], evening: ['İyi akşamlar', 'Добрый вечер'] };

export const App = (() => {
  const app = $('#app');
  const V = { tab: 'today', cat: null };
  const ZIG = [0, 56, 84, 56, 0, -56, -84, -56];
  const C = course;

  const topbar = () => `<div class="topbar"><div class="brand">${MARK}<span>Blably</span></div><div class="chip-streak" title="Дней подряд">${ICON.flame}<b>${streak(S, now())}</b></div></div>`;
  const tileIcon = (ic, cls) => `<span class="ic-tile ${cls || ''}">${ic}</span>`;

  const screens = {
    today() {
      const g = GREET[daySlot(now().getHours())];
      const pl = sessions.todayPlan(today()), due = pl.due, nl = pl.next;
      const xp = S.days[dateKey(now())] || 0, st = streak(S, now()), w = C.wordOfDay(today());
      const TEXT = {
        rev: { ic: ICON.repeat, t: 'Повторение', s: due ? `${due} ${plural(due, 'фраза ждёт', 'фразы ждут', 'фраз ждут')} повторения` : (pl.count ? 'На сегодня всё повторено' : 'Появится после первого урока') },
        lesson: { ic: ICON.lesson, t: 'Новый урок', s: nl ? nl.t : 'Все уроки пройдены' },
        listen: { ic: ICON.headphones, t: 'Аудирование', s: '10 фраз на слух' }
      };
      const plan = pl.rows.map(r => ({ ...r, ...TEXT[r.id] })), first = pl.first, doneN = pl.doneN;
      return `${topbar()}
      <header class="head"><div class="eyebrow">${now().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
        <h1 class="greet"><span>${g[0]}</span>${playBtn(g[0], 'soft lg')}</h1><p class="lead">${g[1]}. Десять минут в день дают больше, чем час раз в неделю.</p></header>
      <section class="card goal rise">
        <div class="goal-top"><div class="goal-ring">${ring(xp, S.goal, 76)}<span><b>${xp}</b><i>из ${S.goal}</i></span></div>
          <div><div class="eyebrow blue">Цель на сегодня</div><div class="goal-t">${doneN === 3 ? 'План выполнен' : xp >= S.goal ? 'Цель достигнута' : `Осталось ${Math.max(0, S.goal - xp)} XP`}</div><div class="goal-s">${doneN} из 3 шагов</div></div></div>
        <ol class="plan">${plan.map(p => `<li><button class="plan-row ${p.done ? 'done' : ''}" data-plan="${p.id}" ${p.off ? 'disabled' : ''}>${tileIcon(p.done ? ICON.ok : p.ic, p.done ? 'done' : '')}<span class="plan-t"><b>${p.t}</b><i>${esc(p.s)}</i></span><span class="chev">${ICON.chev}</span></button></li>`).join('')}</ol>
        ${first ? `<button class="btn" data-plan="${first.id}">${doneN ? 'Продолжить' : 'Начать занятие'}</button>` : '<div class="goal-done">Yarın görüşürüz! Увидимся завтра.</div>'}</section>
      <section class="stats rise">
        <div class="card stat">${tileIcon(ICON.flame)}<b>${st}</b><i>${plural(st, 'день', 'дня', 'дней')} подряд</i></div>
        <div class="card stat">${tileIcon(ICON.layers)}<b>${srs.count()}</b><i>фраз в памяти</i></div>
        <div class="card stat">${tileIcon(ICON.bolt)}<b>${S.xp}</b><i>опыта всего</i></div></section>
      <h2 class="sec">Слово дня</h2>
      <button class="card wod rise" data-say="${esc(w.tr)}"><span><b>${esc(w.tr)}</b><i>${esc(w.ru)}</i></span><span class="say lg">${ICON.play}</span></button>
      <div class="foot" id="resetbox"><button class="link muted" id="reset">Сбросить прогресс</button></div>`;
    },
    course() {
      const tr = S.track, nx = C.nextLesson(S, tr), done = C.doneCount(S, tr), all = C.flat(tr).length;
      let n = 0;
      return `${topbar()}<header class="head"><h1>Курс</h1></header>
      <div class="seg"><button data-track="talk" class="${tr === 'talk' ? 'on' : ''}">Разговорный</button><button data-track="gram" class="${tr === 'gram' ? 'on' : ''}">Грамматика</button></div>
      <p class="lead">${tr === 'talk' ? 'Готовые фразы для жизни: слушаешь, собираешь, говоришь вслух. Правил минимум.' : 'Как устроены слова: гармония гласных, окончания, времена. Объясняет, почему говорят именно так.'}</p>
      <div class="track-prog"><span>Пройдено ${done} из ${all}</span><span class="meter"><i style="width:${done / all * 100}%"></i></span></div>
      ${C.units(tr).map((u, ui) => { const ud = u.ls.filter(l => l.id in S.done).length; return `<section class="unit">
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
      return `${topbar()}<header class="head"><h1>Слова</h1><p class="lead">${C.totalWords} слов и фраз с озвучкой. Выученное само возвращается на повторение через день, три, неделю.</p></header>
      ${C.groups.map(g => `<h2 class="sec">${g.g}</h2><p class="sec-d">${g.d}</p><div class="tiles">${g.cats.map(c => {
        const its = C.catItems(c), k = its.filter(x => srs.known(x.tr)).length;
        return `<button class="card tile-c" data-cat="${c.id}"><b>${esc(c.s)}</b><span>${c.n}</span><i>${k} из ${its.length}</i><span class="meter"><i style="width:${k / its.length * 100}%"></i></span></button>`; }).join('')}</div>`).join('')}`;
    },
    cat() {
      const c = C.catById(V.cat), its = C.catItems(c), k = its.filter(x => srs.known(x.tr)).length;
      return `<div class="topbar"><button class="back" id="back">${ICON.back}Слова</button></div>
      <header class="head tight"><h1>${c.n}</h1><p class="lead">Знаешь ${k} из ${its.length}. Нажми на слово, чтобы послушать.</p></header>
      <div class="pair-btn"><button class="btn" id="c-learn">Учить</button><button class="btn soft" id="c-listen">${ICON.headphones}Слушать</button></div>
      <div class="card rows words rise">${c.it.map(x => {
        const key = speakKey(x[0]), st = srs.get(key), known = st && st.b >= 3;
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
    on('[data-plan]', el => ({ rev: () => Player.start(sessions.review()), lesson: () => { const l = sessions.nextLesson(); if (l) Player.start(sessions.lesson(l.id)); }, listen: () => Player.start(sessions.listening(C.LISTEN_POOL)) })[el.dataset.plan]());
    on('[data-lesson]', el => Player.start(sessions.lesson(el.dataset.lesson)));
    on('[data-track]', el => { S.track = el.dataset.track; save(); render(); });
    on('[data-topic]', el => { const t = el.dataset.topic; S.sel = S.sel.includes(t) ? S.sel.filter(x => x !== t) : [...S.sel, t]; save(); render(); });
    on('[data-mode]', el => { S.mode = el.dataset.mode; save(); render(); });
    on('#t-all', () => { S.sel = Object.keys(TOPICS); save(); render(); });
    on('#t-none', () => { S.sel = []; save(); render(); });
    on('#p-gram', () => Player.start(sessions.grammar(S.sel)));
    on('#p-listen', () => Player.start(sessions.listening(C.LISTEN_POOL)));
    on('#p-speak', () => Player.start(sessions.speaking()));
    on('#p-mist', () => Player.start(sessions.mistakes()));
    on('[data-cat]', el => { V.cat = el.dataset.cat; render(); window.scrollTo(0, 0); });
    on('#back', () => { V.cat = null; render(); window.scrollTo(0, 0); });
    on('#c-learn', () => { const c = C.catById(V.cat); Player.start(sessions.words(C.catItems(c), c.n)); });
    on('#c-listen', () => { const c = C.catById(V.cat); Player.start(sessions.listening(C.catItems(c), c.n)); });
    on('[data-know]', el => { srs.toggleKnown(el.dataset.know); save(); render(); });
    on('#reset', () => {
      $('#resetbox').innerHTML = `<div class="card pad center"><b>Сбросить весь прогресс?</b><p class="sec-d">Уроки, опыт и выученные фразы удалятся с этого устройства.</p><div class="pair-btn"><button class="btn soft" id="r-no">Отмена</button><button class="btn bad" id="r-yes">Сбросить</button></div></div>`;
      $('#r-no').onclick = render;
      $('#r-yes').onclick = () => { resetState(S); save(); render(); };
    });
  }

  $$('.tabs button').forEach(b => { b.insertAdjacentHTML('afterbegin', ICON[b.dataset.icon]); b.onclick = () => go(b.dataset.tab); });
  return { render, go };
})();
