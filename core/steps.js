/* Core: exercise steps built from phrase items {tr, ru}. A step is plain data;
   the screens decide how to draw it and which words to use for titles.
   ask: 'meaning' (what does it mean?) or 'translate' (how do you say it?);
   show: {text, lang: 'target' | 'base'} is the text in the question card. */
import { shuffle, uniq, lc } from './text.js';

export const uniqItems = a => { const seen = new Set(); return a.filter(x => !seen.has(x.tr) && seen.add(x.tr)); };
const others = (it, pool, n, field) => uniq(shuffle(pool.filter(x => x.tr !== it.tr && x.ru !== it.ru)).map(x => x[field])).slice(0, n);

export const Step = {
  recognize: (it, pool) => ({ k: 'mc', ask: 'meaning', show: { text: it.tr, lang: 'target' }, say: it.tr, auto: true, o: [it.ru, ...others(it, pool, 3, 'ru')], key: it.tr }),
  recall: (it, pool) => ({ k: 'mc', ask: 'translate', show: { text: it.ru, lang: 'base' }, o: [it.tr, ...others(it, pool, 3, 'tr')], trOpts: true, key: it.tr }),
  /* m: 'mc' pick the meaning, 'build' put the words in order, 'type' write what you hear */
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
  intro: (items, title) => ({ k: 'learn', t: title, note: 'listenRepeat', ex: items.map(x => [x.tr, x.ru]) }),
  match: items => ({ k: 'match', p: items.map(x => [x.tr, x.ru]) })
};
