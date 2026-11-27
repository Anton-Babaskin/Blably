/* Screens: small page helpers */
export const $ = (sel, root) => (root || document).querySelector(sel);
export const $$ = (sel, root) => [...(root || document).querySelectorAll(sel)];
export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const focusQuiet = el => { try { el.focus({ preventScroll: true }); } catch (e) {} };
/* Russian word endings for numbers: 1 день, 2 дня, 5 дней */
export const plural = (n, one, few, many) => {
  const a = n % 10, b = n % 100;
  return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 10 || b >= 20) ? few : many;
};
