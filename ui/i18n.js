/* Screens: the interface language. Loads i18n/<lang>.json and gives t() to every screen.
   Which language to use is decided by the core (pickLang); here we only fetch and apply it. */
import { translator, pickLang, FALLBACK } from '../core/i18n.js';

let lang = FALLBACK;
/* t('key', {n}) → text in the interface language. Replaced as soon as a dictionary loads. */
export let t = key => key;
export const currentLang = () => lang;

async function fetchDict(l) {
  const r = await fetch(`i18n/${l}.json`);
  if (!r.ok) throw new Error(`i18n/${l}.json: ${r.status}`);
  return r.json();
}
export async function useLang(l) {
  let dict;
  try { dict = await fetchDict(l); } catch (e) { l = FALLBACK; dict = await fetchDict(l); }
  lang = l;
  t = translator(dict, l);
  document.documentElement.lang = l;
  document.title = t('app.title');
  const d = document.querySelector('meta[name="description"]');
  if (d) d.content = t('app.description');
}

/* The address can ask for a language (?lang=uk) for this visit only; it is not remembered */
const urlLang = () => { try { return new URLSearchParams(location.search).get('lang'); } catch (e) { return null; } };
const browserLangs = () => navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
export const startLang = saved => pickLang({ url: urlLang(), saved, browser: browserLangs() });
export const chosenLang = saved => pickLang({ saved, browser: browserLangs() });
