/* Core: which session to run and what goes into it. Each builder returns a session config
   {title | name, steps, kind, ...} or null when there is nothing to practise.
   title is a code the screens turn into words ('review', 'listening', ...); name is course text. */
import { pick, shuffle, random } from './text.js';
import { Step, uniqItems } from './steps.js';
import { daily } from './progress.js';

export function createSessions({ S, course, srs }) {
  const C = course;
  return {
    lesson(id) {
      const l = C.lesson(id);
      return l ? { name: l.t, steps: l.steps, lessonId: id, enroll: C.lessonItems(l).map(x => x.tr), kind: 'lesson' } : null;
    },
    /* Due phrases; the higher the box, the harder the exercise */
    review() {
      const due = srs.due().slice(0, 12).map(C.itemOf);
      if (!due.length) return null;
      const pool = uniqItems([...due, ...C.LISTEN_POOL]);
      const steps = due.map(it => {
        const b = srs.get(it.tr).b;
        if (b <= 1) return Step.recognize(it, pool);
        if (b === 2) return random() < .5 ? Step.recall(it, pool) : Step.listen(it, pool, 'mc');
        if (b === 3) return Step.listen(it, pool, pick(['build', 'type']));
        return Step.speak(it);
      });
      return { title: 'review', steps: shuffle(steps), kind: 'rev' };
    },
    words(items, name) {
      items = uniqItems(items);
      const fresh = shuffle(items.filter(x => !srs.known(x.tr)));
      const set = (fresh.length >= 4 ? fresh : shuffle(items.slice())).slice(0, 6);
      if (set.length < 4) return null;
      const pool = items.length >= 8 ? items : uniqItems([...items, ...C.BASE_ITEMS]);
      const steps = [Step.intro(set, name), Step.match(set.slice(0, 5)),
        ...shuffle(set.map(it => Step.recognize(it, pool))),
        ...shuffle(set.map(it => Step.recall(it, pool))),
        ...shuffle(set.slice(0, 3).map(it => Step.listen(it, pool, 'type'))),
        ...shuffle(set.slice(3).map(it => Step.speak(it)))];
      return { name, steps, enroll: set.map(x => x.tr), kind: 'words' };
    },
    listening(items, name) {
      const pool = items.length >= 8 ? items : C.LISTEN_POOL;
      const plan = ['mc', 'build', 'type', 'mc', 'build', 'type', 'mc', 'build', 'mc', 'type'];
      const set = shuffle(uniqItems(items).slice()).slice(0, plan.length);
      return { title: 'listening', name, steps: set.map((it, i) => Step.listen(it, pool, plan[i])), kind: 'listen' };
    },
    speaking() {
      const mine = Object.keys(S.srs).filter(k => C.DICT.has(k)).map(C.itemOf);
      const set = shuffle(mine.length >= 6 ? mine : C.TALK_ITEMS.slice(0, 30)).slice(0, 10);
      return { title: 'speaking', steps: set.map(Step.speak), kind: 'speak' };
    },
    grammar(topics, n) { return { title: 'grammar', steps: [{ k: 'gen', topics, n: n || 10 }], mode: S.mode, kind: 'gram' }; },
    /* Topics from the grammar lessons already done, or a starter set */
    quickGrammar() {
      const ts = new Set();
      C.flat('gram').forEach(l => { if (l.id in S.done) l.steps.forEach(s => { if (s.k === 'gen') s.topics.forEach(t => ts.add(t)); }); });
      return this.grammar(ts.size ? [...ts] : C.META.firstGrammar);
    },
    mistakes() {
      return S.mist.length ? { title: 'mistakes', steps: shuffle(S.mist.slice()).slice(0, 10).map(q => ({ k: 'gq', q: { ...q } })), mode: S.mode, clearMist: true, kind: 'gram' } : null;
    },
    /* The next lesson on the chosen track, or on the other one when this track is finished */
    nextLesson() { return C.nextLesson(S, S.track) || C.nextLesson(S, S.track === 'talk' ? 'gram' : 'talk'); },
    /* Today's plan: review, a new lesson, listening. done/off flags, the first step to offer */
    todayPlan(day) {
      const d = daily(S, day), due = srs.due().length, next = this.nextLesson();
      const rows = [
        { id: 'rev', done: d.rev || (!due && srs.count() > 0), off: !due },
        { id: 'lesson', done: d.lesson, off: !next },
        { id: 'listen', done: d.listen }
      ];
      return { due, count: srs.count(), next, rows, first: rows.find(p => !p.done && !p.off), doneN: rows.filter(p => p.done).length };
    }
  };
}
