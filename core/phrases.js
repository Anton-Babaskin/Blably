/* Core: every phrase in the target language that the app can say, grouped into audio packs.
   One voice serves all courses that teach the same language (tr-ru and tr-uk share audio/tr/).
   Used by tools/list-phrases.js to record audio, and by the tests to check nothing is left unrecorded. */
import { speakKey, hasCyr, cmp } from './text.js';
import * as tr from './morph.js';

/* Grammar engines by target language: they know which word forms the generator can produce */
const ENGINES = { tr };

/* packs: course packages with the same target language. Returns {pack: [[key, text], ...]} */
export function listPhrases(packs) {
  const out = {}, seen = new Set();
  const add = (pack, t, q) => { const k = speakKey(t); if (!k || hasCyr(k) || seen.has(k)) return; seen.add(k); (out[pack] = out[pack] || []).push([k, q ? k + '?' : k]); };
  for (const p of packs) {
    Object.values(p.course.greet).forEach(t => add('course', t));   // greeting on the Today screen
    [...p.lessons.talk, ...p.lessons.gram].forEach(u => u.ls.forEach(l => l.steps.forEach(s => {
      if (s.k === 'learn') s.ex.forEach(e => add('course', e[0]));
      if (s.k === 'mc') { if (s.say) add('course', s.say); if (!hasCyr(s.o[0]) && !/</.test(s.o[0])) add('course', s.o[0]); }
      if (s.k === 'build') { add('course', s.a); [...s.a.split(' '), ...(s.x || [])].forEach(w => add('course', cmp(w))); }
      if (s.k === 'match') s.p.forEach(x => add('course', x[0]));
    })));
    p.words.forEach((g, i) => g.cats.forEach(c => c.it.forEach(x => add('words' + (i + 1), x[0]))));
    const engine = ENGINES[p.course.target];
    if (engine) engine.formsForAudio(p.grammar).forEach(([pack, t, q]) => add(pack, t, q));
  }
  return out;
}
