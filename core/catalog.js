/* Core: the list of courses (courses/index.json) and choosing one: «Я говорю на… → хочу учить…».
   Each entry is {id, target, base}; the course itself is the package courses/<id>/. */

export function checkCatalog(list) {
  const bad = [], ids = new Set();
  if (!Array.isArray(list) || !list.length) return ['courses/index.json: a list of courses'];
  list.forEach(c => {
    if (!c || c.id !== `${c.target}-${c.base}`) bad.push(`courses/index.json: «${c && c.id}» must be «target-base»`);
    if (ids.has(c.id)) bad.push(`courses/index.json: «${c.id}» is listed twice`);
    ids.add(c.id);
  });
  return bad;
}
/* The course to open: the one chosen before, or the only one there is. null means: ask the learner */
export const startCourse = (list, saved) => list.some(c => c.id === saved) ? saved : list.length === 1 ? list[0].id : null;
/* Languages one can learn from, and what one can learn from a given language */
export const bases = list => [...new Set(list.map(c => c.base))];
export const targetsFor = (list, base) => list.filter(c => c.base === base);
/* The first language to offer: of the current course, else the interface language if there is a course in it */
export const firstBase = (list, current, uiLang) => {
  const cur = list.find(c => c.id === current);
  return cur ? cur.base : bases(list).includes(uiLang) ? uiLang : bases(list)[0];
};
