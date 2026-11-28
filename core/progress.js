/* Core: the learner's progress. Shape of the saved state, restoring it from saved text
   (including two older formats), experience, streak and the daily plan marks.
   The screens read and write the storage; here we only turn text into state and back. */
import { speakKey } from './text.js';

export const fresh = () => ({ done: {}, stats: {}, srs: {}, mist: [], sel: ['plural', 'loc', 'dat', 'pres'], mode: 'choice', days: {}, xp: 0, track: 'talk', goal: 50, daily: {} });

/* currentText: saved state in the current format (turkce_v3), olderText: turkce_v2 or turkce_v1.
   Unknown or broken text gives a fresh state; nothing is ever thrown. */
export function restore(currentText, olderText, day) {
  const S = fresh();
  try {
    if (currentText) { Object.assign(S, JSON.parse(currentText)); return S; }
    const old = JSON.parse(olderText || 'null');
    if (old) {                                   // carry progress over from earlier versions
      ['done', 'stats', 'days', 'xp', 'track', 'mist'].forEach(k => { if (old[k] != null) S[k] = old[k]; });
      Object.keys(old.known || {}).forEach(w => { S.srs[speakKey(w)] = { b: 4, d: day + 16 }; });
    }
  } catch (e) {}
  return S;
}
/* Start over, keeping the same object so everyone holding it sees the change.
   Settings that are not progress (the interface language) stay. */
const KEEP = ['lang'];
export function resetState(S) {
  const kept = Object.fromEntries(KEEP.filter(k => k in S).map(k => [k, S[k]]));
  Object.keys(S).forEach(k => { delete S[k]; });
  return Object.assign(S, fresh(), kept);
}

/* Days are counted in the learner's own time zone */
export const dayNumber = d => Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 864e5);
export const dateKey = d => d.toLocaleDateString('sv');
export function addXP(S, n, now) { if (n > 0) { S.days[dateKey(now)] = (S.days[dateKey(now)] || 0) + n; S.xp += n; } }
export function streak(S, now) {
  const d = new Date(now.getTime());
  if (!S.days[dateKey(d)]) d.setDate(d.getDate() - 1);
  let n = 0;
  while (S.days[dateKey(d)]) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
export function daily(S, day) { if (S.daily.day !== day) S.daily = { day }; return S.daily; }
/* Part of the day for the greeting */
export const daySlot = hour => hour < 5 || hour >= 23 ? 'night' : hour < 12 ? 'morning' : hour < 18 ? 'day' : 'evening';
