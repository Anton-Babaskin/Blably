/* Screens: the core wired to this device. Progress from storage, the course package from courses/<id>/,
   repetition, session builders and the session runner. Every screen imports from here.
   course, srs, sessions and runner are set by loadCourse() before the first screen is drawn. */
import { dayNumber } from '../core/progress.js';
import { PACK_FILES, checkPack } from '../core/pack.js';
import { indexCourse } from '../core/course.js';
import { createSRS } from '../core/srs.js';
import { createSessions } from '../core/sessions.js';
import { createRunner } from '../core/run.js';
import { loadState, saveState } from './storage.js';
import { Sound } from './audio.js';

export const now = () => new Date();
export const today = () => dayNumber(now());
export const S = loadState(today());
export const save = () => saveState(S);
export let course = null, srs = null, sessions = null, runner = null;

/* The four files of a package; a broken package stops here with every problem listed */
async function fetchPack(id) {
  const files = await Promise.all(PACK_FILES.map(async f => {
    const r = await fetch(`courses/${id}/${f}.json`);
    if (!r.ok) throw new Error(`courses/${id}/${f}.json: ${r.status}`);
    return r.json();
  }));
  const pack = Object.fromEntries(PACK_FILES.map((f, i) => [f, files[i]]));
  const bad = checkPack(pack);
  if (bad.length) throw new Error(`courses/${id}:\n${bad.join('\n')}`);
  return pack;
}
export async function loadCourse(id) {
  const pack = await fetchPack(id);
  course = indexCourse(pack);
  srs = createSRS(S, { today, has: k => course.DICT.has(k) });
  sessions = createSessions({ S, course, srs });
  runner = createRunner({ S, srs, now, grammar: pack.grammar });
  Sound.load(pack.course.voice, pack.course.audioStart);
}
