/* Core: interface languages. Which language to show and how to fill a dictionary phrase.
   The dictionaries themselves are i18n/<lang>.json; the screens load them. */

export const UI_LANGS = ['ru', 'uk', 'en'];
/* Each language is named in itself, the same in every dictionary */
export const LANG_NAMES = { ru: 'Русский', uk: 'Українська', en: 'English' };
export const FALLBACK = 'en';

/* The first language that we have: the address (?lang=uk), the learner's own choice, then the browser's list */
export function pickLang({ url, saved, browser } = {}) {
  const ok = l => UI_LANGS.includes(l);
  if (ok(url)) return url;
  if (ok(saved)) return saved;
  for (const b of browser || []) {
    const l = String(b).toLowerCase().split(/[-_]/)[0];
    if (ok(l)) return l;
  }
  return FALLBACK;
}

/* A phrase with forms by number looks like {"one": "…", "few": "…", "many": "…", "other": "…"} */
const CATS = ['zero', 'one', 'two', 'few', 'many', 'other'];
export const isPlural = v => !!v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length > 0 && Object.keys(v).every(k => CATS.includes(k));

/* t('today.due', {n: 5}) → «5 фраз ждут повторения». {name} is filled from the parameters;
   the form by number is chosen with the language's own rules (Intl.PluralRules).
   A missing key comes back as the key itself, so it is easy to spot on screen. */
export function translator(dict, lang) {
  const rules = new Intl.PluralRules(lang);
  const get = key => key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), dict);
  return function t(key, p = {}) {
    let v = get(key);
    if (v == null) return key;
    if (isPlural(v)) v = v[rules.select(p.n)] ?? v.other;
    if (typeof v !== 'string') return v;
    return v.replace(/\{(\w+)\}/g, (m, k) => (k in p ? String(p[k]) : m));
  };
}
