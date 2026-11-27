/* Core: text and randomness helpers. Pure functions, run the same in the browser and in Node. */

/* All randomness goes through random(). Tests can swap in a seeded generator. */
let rnd = null;
export const setRandom = fn => { rnd = fn || null; };
export const random = () => (rnd || Math.random)();
export const pick = a => a[Math.floor(random() * a.length)];
export function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export const uniq = a => [...new Set(a)];
export const lc = s => s.toLocaleLowerCase('tr');
/* Comparison forms: norm keeps punctuation, cmp drops it, fold drops Turkish diacritics */
export const norm = s => lc(String(s)).replace(/[’‘`´]/g, "'").replace(/\s+/g, ' ').trim();
export const cmp = s => norm(s).replace(/[.,!?;:…]/g, '').replace(/\s+/g, ' ').trim();
export const fold = s => s.replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u').replace(/â/g, 'a');
/* The spoken form of a Turkish string: this is also the key of its audio clip */
export const speakKey = t => String(t).replace(/\(.*?\)/g, '').replace(/…|\.\.\./g, '').replace(/\s*\/\s*/g, ', ').replace(/\s+/g, ' ').replace(/^[\s,]+/, '').trim();
export const hasCyr = s => /[а-яё]/i.test(s);
