/* Small shared helpers */
'use strict';
const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => [...(root || document).querySelectorAll(sel)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const pick = a => a[Math.floor(Math.random() * a.length)];
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const uniq = a => [...new Set(a)];
const lc = s => s.toLocaleLowerCase('tr');
/* Comparison forms: norm keeps punctuation, cmp drops it, fold drops Turkish diacritics */
const norm = s => lc(String(s)).replace(/[’‘`´]/g, "'").replace(/\s+/g, ' ').trim();
const cmp = s => norm(s).replace(/[.,!?;:…]/g, '').replace(/\s+/g, ' ').trim();
const fold = s => s.replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u').replace(/â/g, 'a');
/* The spoken form of a Turkish string: this is also the key of its audio clip */
const speakKey = t => String(t).replace(/\(.*?\)/g, '').replace(/…|\.\.\./g, '').replace(/\s*\/\s*/g, ', ').replace(/\s+/g, ' ').replace(/^[\s,]+/, '').trim();
const hasCyr = s => /[а-яё]/i.test(s);
const plural = (n, one, few, many) => {
  const a = n % 10, b = n % 100;
  return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 10 || b >= 20) ? few : many;
};
