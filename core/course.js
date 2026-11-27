/* Core: an index over one course's content. Lists of phrases, the dictionary, lessons in order,
   what to listen to, the word of the day. Built once when the course loads.
   content: {TALK, GRAM, WG, META} as exported by data.js (later: a course package). */
import { speakKey, shuffle } from './text.js';
import { Step, uniqItems } from './steps.js';

export function indexCourse({ TALK, GRAM, WG, META }) {
  const okPair = e => !/[=]/.test(e[1]) && speakKey(e[0]).length > 1;
  const toItem = e => ({ tr: speakKey(e[0]), ru: e[1] });
  const lessonItems = l => l.steps.filter(s => s.k === 'learn').flatMap(s => s.ex).filter(okPair).map(toItem);
  const ALLCATS = WG.flatMap(g => g.cats);
  const catById = id => ALLCATS.find(c => c.id === id);
  const catItems = c => c.it.filter(okPair).map(toItem);
  const TALK_ITEMS = TALK.flatMap(u => u.ls.flatMap(lessonItems));
  const BASE_ITEMS = WG[0].cats.flatMap(catItems);
  const DICT = new Map();
  [...ALLCATS.flatMap(catItems), ...TALK_ITEMS].forEach(it => DICT.set(it.tr, it.ru));
  const itemOf = k => ({ tr: k, ru: DICT.get(k) });
  const LISTEN_POOL = uniqItems([...TALK_ITEMS, ...META.listen.flatMap(id => catItems(catById(id)))]);

  /* Each conversation lesson ends with listening and saying things aloud.
     New lesson objects: the content we were given stays as it was. */
  const talk = TALK.map(u => ({ ...u, ls: u.ls.map(l => {
    const items = shuffle(lessonItems(l));
    if (items.length < 4) return l;
    return { ...l, steps: [...l.steps, Step.listen(items[0], TALK_ITEMS, 'mc'), Step.listen(items[1], TALK_ITEMS, 'build'), Step.speak(items[2]), Step.speak(items[3])] };
  }) }));

  const units = tr => tr === 'talk' ? talk : GRAM;
  const flat = tr => units(tr).flatMap((u, ui) => u.ls.map(l => ({ ...l, u, ui })));
  const ALL_LESSONS = [...flat('talk'), ...flat('gram')];
  const wordPool = BASE_ITEMS.concat(...META.wordOfDay.map(id => catItems(catById(id)))).filter(x => x.tr.length > 3);

  return {
    META, units, flat, ALL_LESSONS, lessonItems,
    lesson: id => ALL_LESSONS.find(x => x.id === id),
    groups: WG, ALLCATS, catById, catItems, TALK_ITEMS, BASE_ITEMS, DICT, itemOf, LISTEN_POOL,
    totalWords: ALLCATS.reduce((a, c) => a + c.it.length, 0),
    nextLesson: (S, tr) => flat(tr).find(l => !(l.id in S.done)) || null,
    doneCount: (S, tr) => flat(tr).filter(l => l.id in S.done).length,
    wordOfDay: day => wordPool[day % wordPool.length]
  };
}
