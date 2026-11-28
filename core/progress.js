/* Core: the learner's progress, version 4. Shape of the saved state, restoring it from saved text
   (carrying over the three older formats), experience, streak and the daily plan marks.
   The screens read and write the storage; here we only turn text into state and back.

   G = { v: 4, lang?, course, days: {date: xp}, xp, goal, courses: { id: course progress } }
     common to all courses: interface language, chosen course, days and experience (one streak, one goal)
   course progress = { done, stats, srs, mist, sel, mode, track, daily }
     its own for every course: lessons done, repetition, grammar stats and mistakes, chosen topics, today's plan */
import { speakKey } from './text.js';

/* Progress saved before there were courses is Turkish for Russian speakers */
export const LEGACY_COURSE = 'tr-ru';
const GLOBAL = ['days', 'xp', 'goal', 'lang'];
const COURSE = ['done', 'stats', 'srs', 'mist', 'sel', 'mode', 'track', 'daily'];

export const freshGlobal = () => ({ v: 4, course: null, days: {}, xp: 0, goal: 50, courses: {} });
export const freshCourse = (topics = []) => ({ done: {}, stats: {}, srs: {}, mist: [], sel: [...topics], mode: 'choice', track: 'talk', daily: {} });
/* The progress of one course, created on first use */
export function courseProgress(G, id, topics) {
  if (!G.courses[id]) G.courses[id] = freshCourse(topics);
  return G.courses[id];
}

/* The format before version 4 (turkce_v3), and v2 / v1 before it: one flat object */
const LEGACY_FRESH = () => ({ ...freshCourse(['plural', 'loc', 'dat', 'pres']), days: {}, xp: 0, goal: 50 });
function legacy(v3, older, day) {
  const S = LEGACY_FRESH();
  try {
    if (v3) { Object.assign(S, JSON.parse(v3)); return S; }
    const old = JSON.parse(older || 'null');
    if (old) {
      ['done', 'stats', 'days', 'xp', 'track', 'mist'].forEach(k => { if (old[k] != null) S[k] = old[k]; });
      Object.keys(old.known || {}).forEach(w => { S.srs[speakKey(w)] = { b: 4, d: day + 16 }; });
      return S;
    }
  } catch (e) { return S; }
  return null;                                   // nothing saved at all
}

/* Saved texts: v4 = blably_v4, v3 = turkce_v3, older = turkce_v2 or turkce_v1.
   v4 wins; otherwise the older progress moves into course «tr-ru». Unknown or broken text gives a fresh state.
   The old keys are only read, never written: they stay as a backup. */
export function restore({ v4, v3, older } = {}, day) {
  try {
    const G = v4 && JSON.parse(v4);
    if (G && G.v === 4 && G.courses && typeof G.courses === 'object') return Object.assign(freshGlobal(), G);
  } catch (e) {}
  const G = freshGlobal(), S = legacy(v3, older, day);
  if (!S) return G;
  GLOBAL.forEach(k => { if (S[k] !== undefined) G[k] = S[k]; });
  G.course = LEGACY_COURSE;
  G.courses[LEGACY_COURSE] = Object.fromEntries(COURSE.map(k => [k, S[k]]));
  return G;
}

/* Start over: every course and all experience. The interface language and the chosen course stay.
   The current course keeps the same object, so everything holding it sees the change. */
export function resetState(G, topics) {
  const lang = G.lang, id = G.course, cur = G.courses[id];
  Object.keys(G).forEach(k => { delete G[k]; });
  Object.assign(G, freshGlobal(), { course: id });
  if (lang !== undefined) G.lang = lang;
  if (cur) {
    Object.keys(cur).forEach(k => { delete cur[k]; });
    G.courses[id] = Object.assign(cur, freshCourse(topics));
  }
  return G;
}

/* Days are counted in the learner's own time zone */
export const dayNumber = d => Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 864e5);
export const dateKey = d => d.toLocaleDateString('sv');
/* Experience and the streak are common to all courses (G); the daily plan is per course */
export function addXP(G, n, now) { if (n > 0) { G.days[dateKey(now)] = (G.days[dateKey(now)] || 0) + n; G.xp += n; } }
export function streak(G, now) {
  const d = new Date(now.getTime());
  if (!G.days[dateKey(d)]) d.setDate(d.getDate() - 1);
  let n = 0;
  while (G.days[dateKey(d)]) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
export function daily(S, day) { if (S.daily.day !== day) S.daily = { day }; return S.daily; }
/* Part of the day for the greeting */
export const daySlot = hour => hour < 5 || hour >= 23 ? 'night' : hour < 12 ? 'morning' : hour < 18 ? 'day' : 'evening';
