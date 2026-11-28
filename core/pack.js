/* Core: course packages. A package is a folder courses/<id>/ with four files:
     course.json   id, target (the language taught), base (the language of explanations), voice (audio/<voice>/),
                   which word groups feed listening and the word of the day, phrases in the target language for the screens
     lessons.json  {talk: [unit], gram: [unit]}; unit {u, d, c, ls: [lesson]}; lesson {id, t, steps: [step]}
     words.json    [group]; group {g, d, cats: [cat]}; cat {id, n, s, c, it: [[target, base, example?]]}
     grammar.json  {nouns: [{w, r, s?, p?}], verbs: [{i, s, r, sf?, sp?}], topics: {key: {n, g}}}
   Steps: learn {t, b, ex: [[target, base]]}, mc {q, o, why?, say?}, build {ru, a, x}, match {p: [[target, base]]}, gen {topics, n}.
   The screens fetch the files; here we check them. */

export const PACK_FILES = ['course', 'lessons', 'words', 'grammar'];
const STEP_FIELDS = { learn: ['t', 'ex'], mc: ['q', 'o'], build: ['ru', 'a'], match: ['p'], gen: ['topics', 'n'] };
const COURSE_FIELDS = ['id', 'target', 'base', 'voice', 'audioStart', 'defaultTopics', 'listen', 'wordOfDay', 'firstGrammar', 'greet', 'praise', 'perfect', 'bye', 'letters'];
const GREET = ['night', 'morning', 'day', 'evening'];

/* Every problem in the package as a readable line; an empty list means the package is fine */
export function checkPack(pack) {
  const bad = [], need = (ok, msg) => { if (!ok) bad.push(msg); };
  const isArr = Array.isArray, str = v => typeof v === 'string' && v.length > 0;
  const pair = v => isArr(v) && v.length >= 2 && str(v[0]) && typeof v[1] === 'string';
  for (const f of PACK_FILES) need(pack && pack[f] && typeof pack[f] === 'object', `${f}.json: missing or not JSON`);
  if (bad.length) return bad;
  const { course: c, lessons: L, words: W, grammar: G } = pack;

  /* grammar.json */
  need(isArr(G.nouns) && G.nouns.every(n => str(n.w) && str(n.r)), 'grammar.json: nouns need {w, r}');
  need(isArr(G.verbs) && G.verbs.every(v => str(v.i) && str(v.s) && str(v.r)), 'grammar.json: verbs need {i, s, r}');
  const topics = G.topics && typeof G.topics === 'object' ? G.topics : {};
  need(Object.values(topics).length > 0 && Object.values(topics).every(tp => str(tp.n) && str(tp.g)), 'grammar.json: topics need {n, g}');

  /* words.json */
  const cats = new Set();
  need(isArr(W) && W.length > 0, 'words.json: a list of word groups');
  (isArr(W) ? W : []).forEach((g, gi) => {
    need(str(g.g) && isArr(g.cats), `words.json: group ${gi + 1} needs {g, cats}`);
    (g.cats || []).forEach(cat => {
      need(str(cat.id) && !cats.has(cat.id), `words.json: word group id «${cat.id}» is missing or repeated`);
      cats.add(cat.id);
      need(str(cat.n) && isArr(cat.it) && cat.it.length > 0 && cat.it.every(pair), `words.json: «${cat.id}» needs a name and [target, base] words`);
    });
  });

  /* lessons.json */
  const ids = new Set();
  for (const track of ['talk', 'gram']) {
    need(isArr(L[track]), `lessons.json: «${track}» must be a list of units`);
    (isArr(L[track]) ? L[track] : []).forEach((u, ui) => {
      need(str(u.u) && isArr(u.ls), `lessons.json: ${track} unit ${ui + 1} needs {u, ls}`);
      (u.ls || []).forEach(l => {
        need(str(l.id) && !ids.has(l.id), `lessons.json: lesson id «${l.id}» is missing or repeated`);
        ids.add(l.id);
        need(str(l.t) && isArr(l.steps) && l.steps.length > 0, `lessons.json: lesson «${l.id}» needs a title and steps`);
        (l.steps || []).forEach((s, si) => {
          const where = `lessons.json: lesson «${l.id}», step ${si + 1}`;
          const fields = STEP_FIELDS[s.k];
          if (!fields) return need(false, `${where}: unknown step type «${s.k}»`);
          fields.forEach(f => need(s[f] != null, `${where} (${s.k}): missing «${f}»`));
          if (s.k === 'learn') need(isArr(s.ex) && s.ex.every(pair), `${where}: ex must be [target, base] pairs`);
          if (s.k === 'mc') need(isArr(s.o) && s.o.length >= 2, `${where}: needs at least two options`);
          if (s.k === 'match') need(isArr(s.p) && s.p.length >= 2 && s.p.every(pair), `${where}: p must be [target, base] pairs`);
          if (s.k === 'gen') { need(isArr(s.topics) && s.topics.every(tp => tp in topics), `${where}: unknown grammar topic in ${JSON.stringify(s.topics)}`); need(s.n > 0, `${where}: n must be above 0`); }
        });
      });
    });
  }

  /* course.json */
  COURSE_FIELDS.forEach(f => need(c[f] != null, `course.json: missing «${f}»`));
  need(c.id === `${c.target}-${c.base}`, `course.json: id «${c.id}» must be «target-base»`);
  ['listen', 'wordOfDay'].forEach(f => (c[f] || []).forEach(id => need(cats.has(id), `course.json: ${f} names unknown word group «${id}»`)));
  ['firstGrammar', 'defaultTopics'].forEach(f => (c[f] || []).forEach(tp => need(tp in topics, `course.json: ${f} names unknown topic «${tp}»`)));
  need(GREET.every(k => str((c.greet || {})[k])), `course.json: greet needs ${GREET.join(', ')}`);
  need(isArr(c.praise) && c.praise.length > 0, 'course.json: praise must be a list');
  return bad;
}
