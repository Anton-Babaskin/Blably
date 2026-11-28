// Progress version 4: carrying over the older formats without loss, separate progress per course,
// shared experience and streak, reset, and the list of courses.
// Run: node --test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { restore, courseProgress, resetState, addXP, streak, freshCourse } from '../core/progress.js';
import { createSRS } from '../core/srs.js';
import { checkCatalog, startCourse, bases, targetsFor, firstBase } from '../core/catalog.js';
import { courseIds } from '../tools/packs.js';

const DAY = 20784;                                   // 27.11.2026
const V3 = {
  done: { t1: 100, g2: 70 }, stats: { plural: { n: 5, c: 3 } }, srs: { 'Merhaba': { b: 2, d: DAY } },
  mist: [{ t: 'loc', prompt: '<div class="gq-task">old html</div>', answer: 'evde', parts: ['ev', 'de'], why: [], from: 1 }],
  sel: ['loc'], mode: 'type', days: { '2026-11-26': 30 }, xp: 120, track: 'gram', goal: 30, daily: { day: DAY, lesson: 1 }, lang: 'uk'
};
/* v4 back to the old flat shape, to compare field by field */
const flat = G => { const { v, course, courses, ...rest } = G; return { ...rest, ...courses[course] }; };

test('turkce_v3 moves into course tr-ru without losing anything', () => {
  const G = restore({ v3: JSON.stringify(V3) }, DAY);
  assert.equal(G.v, 4);
  assert.equal(G.course, 'tr-ru');
  assert.deepEqual(Object.keys(G.courses), ['tr-ru']);
  assert.deepEqual(flat(G), V3);
  assert.equal(G.lang, 'uk');
  assert.equal(G.courses['tr-ru'].mist[0].prompt, V3.mist[0].prompt, 'old mistakes keep their HTML prompt');
});

test('the two oldest formats are carried over as before', () => {
  const G = restore({ older: JSON.stringify({ xp: 5, done: { t2: 90 }, known: { 'Selam': 1, '(çok) güzel': 1 } }) }, 100);
  assert.equal(G.xp, 5);
  const S = G.courses['tr-ru'];
  assert.deepEqual(S.done, { t2: 90 });
  assert.deepEqual(S.srs, { 'Selam': { b: 4, d: 116 }, 'güzel': { b: 4, d: 116 } });
  assert.deepEqual(S.sel, ['plural', 'loc', 'dat', 'pres']);
});

test('nothing saved, broken or newer: the right starting point', () => {
  const none = restore({}, DAY);
  assert.equal(none.course, null);
  assert.deepEqual(none.courses, {});
  const broken = restore({ v3: '{broken', older: JSON.stringify({ xp: 7 }) }, DAY);
  assert.equal(broken.xp, 0, 'a broken v3 is not mixed with v2');
  assert.deepEqual(broken.courses['tr-ru'], freshCourse(['plural', 'loc', 'dat', 'pres']));
  const v4 = { v: 4, course: 'tr-ru', days: {}, xp: 9, goal: 50, courses: { 'tr-ru': freshCourse() } };
  assert.equal(restore({ v4: JSON.stringify(v4), v3: JSON.stringify(V3) }, DAY).xp, 9, 'v4 wins over v3');
  assert.equal(restore({ v4: '{broken', v3: JSON.stringify(V3) }, DAY).xp, 120, 'a broken v4 falls back to v3');
});

test('each course has its own progress; experience and streak are shared', () => {
  const G = restore({ v3: JSON.stringify(V3) }, DAY);
  const a = courseProgress(G, 'tr-ru'), b = courseProgress(G, 'tr-uk', ['plural']);
  assert.notEqual(a, b);
  assert.equal(courseProgress(G, 'tr-ru'), a, 'the same object every time');
  createSRS(b, { today: () => DAY, has: () => true }).mark('Selam', true);
  assert.equal(a.srs['Selam'], undefined);
  assert.deepEqual(b.sel, ['plural']);
  const now = new Date(2026, 10, 27, 12);
  addXP(G, 10, now);
  assert.equal(G.xp, 130);
  assert.equal(streak(G, now), 2);
});

test('reset clears every course and all experience, keeps language, course and the course object', () => {
  const G = restore({ v3: JSON.stringify(V3) }, DAY), cur = courseProgress(G, 'tr-ru');
  courseProgress(G, 'tr-uk');
  resetState(G, ['plural']);
  assert.equal(G.lang, 'uk');
  assert.equal(G.course, 'tr-ru');
  assert.equal(G.xp, 0);
  assert.deepEqual(Object.keys(G.courses), ['tr-ru']);
  assert.equal(G.courses['tr-ru'], cur);
  assert.deepEqual(cur, freshCourse(['plural']));
});

test('the list of courses matches the folders and chooses well', () => {
  const list = JSON.parse(fs.readFileSync(new URL('../courses/index.json', import.meta.url), 'utf8'));
  assert.deepEqual(checkCatalog(list), []);
  assert.deepEqual(list.map(c => c.id).sort(), courseIds(), 'every course folder is listed, and only those');
  const two = [{ id: 'tr-ru', target: 'tr', base: 'ru' }, { id: 'tr-uk', target: 'tr', base: 'uk' }];
  assert.equal(startCourse(list, null), 'tr-ru', 'one course: no question');
  assert.equal(startCourse(two, null), null, 'several and none chosen: ask');
  assert.equal(startCourse(two, 'tr-uk'), 'tr-uk');
  assert.deepEqual(bases(two), ['ru', 'uk']);
  assert.deepEqual(targetsFor(two, 'uk').map(c => c.id), ['tr-uk']);
  assert.equal(firstBase(two, null, 'uk'), 'uk');
  assert.equal(firstBase(two, 'tr-ru', 'uk'), 'ru');
  assert.ok(checkCatalog([{ id: 'tr-ru', target: 'tr', base: 'uk' }]).length > 0);
});
