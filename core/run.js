/* Core: one session in progress. The queue of steps, checking an answer, the score,
   a second try at the end for every miss, and the summary when the queue runs out.
   The screens call these in order: start → (prepare → check → settle | matchDone) → next … → finish. */
import { pick, shuffle, norm, cmp, fold, hasCyr } from './text.js';
import { genQ, mkOptions } from './morph.js';
import { addXP, daily, streak, dayNumber } from './progress.js';

/* grammar: {nouns, verbs} from the course package, for made-up grammar questions */
export function createRunner({ S, srs, now, grammar }) {
  let P = null;
  const correctOf = (opts, right) => opts.map((o, i) => o === right ? i : -1).filter(i => i >= 0);
  const lineText = (s, line) => line.map(id => s._t.find(t => t.i === id).w).join(' ');
  const stat = k => S.stats[k] || (S.stats[k] = { n: 0, c: 0 });

  return {
    get run() { return P; },
    /* cfg comes from a session builder. Grammar 'gen' steps become n single questions. */
    start(cfg) {
      const queue = [];
      cfg.steps.forEach(s => {
        if (s.k === 'gen') for (let i = 0; i < s.n; i++) queue.push({ k: 'gq', topic: pick(s.topics) });
        else queue.push({ ...s });
      });
      P = queue.length ? { ...cfg, queue, i: 0, ok: 0, tot: 0, xp: 0, combo: 0, mode: cfg.mode || 'choice', seen: new Set() } : null;
      return P;
    },
    stop() { P = null; },
    current: () => P.queue[P.i],
    /* Every phrase the session may speak, to fetch the audio early */
    phrases: () => P.queue.flatMap(s => [s.tr, s.say, s.a, ...(s.ex || []).map(e => e[0]), ...(s.p || []).map(e => e[0])].filter(Boolean)),

    /* Fix the order of options and word tiles, make up the grammar question.
       Called once each time a step is shown. For 'match' returns the two shuffled columns. */
    prepare(s) {
      if (s.k === 'mc' || (s.k === 'listen' && s.m === 'mc')) { if (!s._o) s._o = shuffle(s.o.slice()); }
      else if (s.k === 'build') { if (!s._t) s._t = shuffle([...s.a.split(' '), ...(s.x || [])].map((w, i) => ({ w, i }))); }
      else if (s.k === 'listen' && s.m === 'build') { if (!s._t) s._t = shuffle([...s.tr.split(' '), ...s.x].map((w, i) => ({ w, i }))); }
      else if (s.k === 'gq') {
        if (!s.q) { let q, g = 0; do { q = genQ(s.topic, grammar); } while (P.seen.has(q.answer) && g++ < 25); s.q = q; }
        P.seen.add(s.q.answer);
        if (!s.q.options) s.q.options = mkOptions(s.q);
      } else if (s.k === 'match') {
        return { L: shuffle(s.p.map((p, i) => ({ t: p[0], i }))), R: shuffle(s.p.map((p, i) => ({ t: p[1], i }))) };
      }
      return null;
    },

    /* input: {sel} option index, {line} tile ids in order, or {given} typed text.
       Returns null while there is nothing to check yet, otherwise data about the answer:
       ok, answer, correct (indices of right options), say (what to play), and extras per type. */
    check(s, input) {
      if (s.k === 'mc') {
        if (input.sel == null) return null;
        const answerIsTarget = !hasCyr(s.o[0]);
        return { ok: s._o[input.sel] === s.o[0], answer: s.o[0], correct: correctOf(s._o, s.o[0]), answerIsTarget, why: s.why,
          say: answerIsTarget ? s.o[0] : (s.say && !s.auto ? s.say : null) };
      }
      if (s.k === 'gq') {
        const q = s.q, given = input.given;
        if (!given || !String(given).trim()) return null;
        const ok = norm(given) === norm(q.answer);
        const st = stat(q.t); st.n++; if (ok) st.c++;
        const plain = { t: q.t, prompt: q.prompt, answer: q.answer, parts: q.parts, why: q.why, from: q.from };
        if (!ok) { S.mist = [plain, ...S.mist.filter(m => m.answer !== q.answer)].slice(0, 50); }
        else if (P.clearMist) S.mist = S.mist.filter(m => m.answer !== q.answer);
        return { ok, answer: q.answer, correct: correctOf(q.options, q.answer), given, parts: q.parts, why: q.why, say: q.answer };
      }
      if (s.k === 'build') {
        if (!input.line.length) return null;
        return { ok: cmp(lineText(s, input.line)) === cmp(s.a), answer: s.a, say: s.a };
      }
      if (s.k === 'listen') {
        let ok, note = null, given = '', correct = null;
        if (s.m === 'mc') { if (input.sel == null) return null; ok = s._o[input.sel] === s.o[0]; correct = correctOf(s._o, s.o[0]); }
        else if (s.m === 'build') { if (!input.line.length) return null; ok = cmp(lineText(s, input.line)) === cmp(s.tr); }
        else {
          given = input.given; if (!given.trim()) return null;
          const a = cmp(given), b = cmp(s.tr); ok = a === b;
          if (!ok && fold(a) === fold(b)) { ok = true; note = 'letters'; }   // right apart from the special letters
        }
        const st = stat('listen'); st.n++; if (ok) st.c++;
        return { ok, answer: s.tr, meaning: s.ru, correct, note, given, say: ok ? null : s.tr };
      }
      return null;
    },
    /* Record a result: score, spaced repetition, and a second try at the end of the session */
    settle(s, ok) {
      P.tot++;
      if (ok) { P.ok++; P.xp += 10; P.combo++; } else P.combo = 0;
      if (s.key) srs.mark(s.key, ok);
      if (!ok && !s._re) { const again = { ...s, _re: true }; delete again._o; delete again._t; P.queue.push(again); }
    },
    /* «Найди пары» counts as right when every pair was found without a miss */
    matchDone(errors) { P.tot++; if (!errors) { P.ok++; P.combo++; } else P.combo = 0; P.xp += 10; },
    next() { P.i++; return P.i < P.queue.length; },
    /* Close the session: experience, lesson result, new phrases into repetition, today's plan */
    finish() {
      const t = now(), acc = P.tot ? Math.round(P.ok / P.tot * 100) : 100, xp = P.xp + (P.lessonId ? 10 : 0);
      addXP(S, xp, t);
      if (P.lessonId) S.done[P.lessonId] = Math.max(S.done[P.lessonId] || 0, acc);
      (P.enroll || []).forEach(k => srs.enroll(k));
      const d = daily(S, dayNumber(t));
      if (P.kind === 'rev') d.rev = 1; if (P.kind === 'lesson') d.lesson = 1; if (P.kind === 'listen') d.listen = 1;
      return { acc, xp, added: (P.enroll || []).length, streak: streak(S, t), lesson: !!P.lessonId };
    }
  };
}
