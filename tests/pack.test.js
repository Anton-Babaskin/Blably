// Course packages: every package in courses/ is valid, broken ones are caught, every phrase has a recording.
// Run: node --test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { checkPack } from '../core/pack.js';
import { indexCourse } from '../core/course.js';
import { listPhrases } from '../core/phrases.js';
import { courseIds, readPack, packsFor } from '../tools/packs.js';

const copy = v => JSON.parse(JSON.stringify(v));

test('every course package is valid', () => {
  assert.ok(courseIds().includes('tr-ru'));
  for (const id of courseIds()) {
    const p = readPack(id);
    assert.deepEqual(checkPack(p), [], id);
    assert.equal(p.course.id, id, `${id}: folder name and id`);
  }
});

test('the tr-ru package holds the whole course', () => {
  const c = indexCourse(readPack('tr-ru'));
  assert.equal(c.flat('talk').length, 20);
  assert.equal(c.flat('gram').length, 14);
  assert.equal(c.totalWords, 403);
  assert.equal(c.META.target, 'tr');
  assert.equal(c.META.base, 'ru');
});

test('a broken package is reported, with where the problem is', () => {
  const ok = readPack('tr-ru');
  const broken = (fn, re) => { const p = copy(ok); fn(p); assert.ok(checkPack(p).some(m => re.test(m)), `expected ${re}, got ${checkPack(p).join(' | ')}`); };
  broken(p => { p.lessons.talk[0].ls[1].id = p.lessons.talk[0].ls[0].id; }, /lesson id «t1» is missing or repeated/);
  broken(p => { p.lessons.talk[0].ls[0].steps[0].k = 'dance'; }, /lesson «t1», step 1: unknown step type «dance»/);
  broken(p => { delete p.lessons.gram[0].ls[0].steps[0].ex; }, /lesson «g1», step 1 \(learn\): missing «ex»/);
  broken(p => { p.lessons.gram[0].ls[0].steps[2].topics = ['flying']; }, /unknown grammar topic/);
  broken(p => { p.course.id = 'tr-xx'; }, /course.json: id «tr-xx» must be «target-base»/);
  broken(p => { p.course.listen.push('nope'); }, /listen names unknown word group «nope»/);
  broken(p => { p.words[0].cats[1].id = 'pron'; }, /word group id «pron» is missing or repeated/);
  broken(p => { delete p.grammar; }, /grammar.json: missing/);
});

test('every phrase the app can say has a recording', () => {
  for (const lang of new Set(courseIds().map(id => readPack(id).course.voice))) {
    const index = JSON.parse(fs.readFileSync(new URL(`../audio/${lang}/index.json`, import.meta.url), 'utf8'));
    const recorded = new Set(Object.values(index).flatMap(list => list.map(([k]) => k)));
    const missing = Object.values(listPhrases(packsFor(lang))).flatMap(list => list.map(([k]) => k)).filter(k => !recorded.has(k));
    assert.deepEqual(missing, [], `audio/${lang}: not recorded`);
    for (const pack of Object.keys(index)) assert.ok(fs.existsSync(new URL(`../audio/${lang}/${pack}.mp3`, import.meta.url)), `audio/${lang}/${pack}.mp3`);
  }
});
