/* Core: spaced repetition with Leitner boxes.
   A phrase comes back after 1, 3, 7, 16, 35, 90 days. A miss sends it back to tomorrow.
   S.srs maps a phrase key to {b: box, d: day it is due}. */
export const GAPS = [0, 1, 3, 7, 16, 35, 90];

/* today() gives the current day number, has(key) says whether the course still has this phrase */
/* S: the progress of one course; S.srs is its repetition */
export function createSRS(S, { today, has }) {
  return {
    GAPS,
    get: k => S.srs[k],
    enroll(k) { if (!S.srs[k]) S.srs[k] = { b: 1, d: today() + 1 }; },
    mark(k, ok) {
      const it = S.srs[k] || { b: 0, d: 0 };
      it.b = ok ? Math.min(it.b + 1, 6) : 1;
      it.d = today() + (ok ? GAPS[it.b] : 1);
      S.srs[k] = it;
    },
    due() { const t = today(); return Object.keys(S.srs).filter(k => S.srs[k].d <= t && has(k)).sort((a, b) => S.srs[a].d - S.srs[b].d); },
    known: k => !!S.srs[k] && S.srs[k].b >= 3,
    count: () => Object.keys(S.srs).length,
    /* The «знаю» button on the word list: known words are forgotten, others go to box 4 */
    toggleKnown(k) { if (this.known(k)) delete S.srs[k]; else S.srs[k] = { b: 4, d: today() + 16 }; }
  };
}
