/* Screens: the core wired to this device. Progress from storage, the list of courses, the course package
   from courses/<id>/, repetition, session builders and the session runner. Every screen imports from here.
   G is the progress common to all courses; S, course, srs, sessions and runner belong to the open course
   and are set by loadCourse() before the first screen is drawn. */
import { dayNumber, courseProgress } from '../core/progress.js';
import { checkCatalog } from '../core/catalog.js';
import { PACK_FILES, checkPack } from '../core/pack.js';
import { indexCourse } from '../core/course.js';
import { createSRS } from '../core/srs.js';
import { createSessions } from '../core/sessions.js';
import { createRunner } from '../core/run.js';
import { loadState, saveState } from './storage.js';
import { Sound } from './audio.js';

export const now = () => new Date();
export const today = () => dayNumber(now());
export const G = loadState(today());
export const save = () => saveState(G);
export let S = null, course = null, srs = null, sessions = null, runner = null, catalog = [];

/* courses/index.json: which courses there are */
export async function loadCatalog() {
  const r = await fetch('courses/index.json');
  if (!r.ok) throw new Error(`courses/index.json: ${r.status}`);
  const list = await r.json(), bad = checkCatalog(list);
  if (bad.length) throw new Error(bad.join('\n'));
  catalog = list;
  return list;
}

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
  G.course = id;
  S = courseProgress(G, id, pack.course.defaultTopics);
  course = indexCourse(pack);
  srs = createSRS(S, { today, has: k => course.DICT.has(k) });
  sessions = createSessions({ S, course, srs });
  runner = createRunner({ S, G, srs, now, grammar: pack.grammar });
  Sound.load(pack.course.voice, pack.course.audioStart);
}
