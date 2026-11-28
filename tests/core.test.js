// The core runs in Node without a browser: the rule «ядро отдельно от экранов».
// Run: node --test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readPack } from '../tools/packs.js';

const CORE = new URL('../core/', import.meta.url);
const files = fs.readdirSync(CORE).filter(f => f.endsWith('.js'));
const withoutComments = src => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');

test('every core file loads in Node', async () => {
  assert.ok(files.length >= 7, 'core files found');
  for (const f of files) await import(new URL(f, CORE));
  assert.equal(typeof globalThis.document, 'undefined');
});

test('core does not touch the page, storage or sound', () => {
  const banned = /\b(document|window|localStorage|sessionStorage|navigator|speechSynthesis|Audio|fetch|innerHTML)\b/;
  for (const f of files) {
    const hit = withoutComments(fs.readFileSync(new URL(f, CORE), 'utf8')).match(banned);
    assert.equal(hit, null, `core/${f} uses «${hit && hit[0]}»`);
  }
});

test('a whole lesson can be played in Node', async () => {
  const pack = readPack('tr-ru');
  const { restore, dayNumber, courseProgress } = await import('../core/progress.js');
  const { indexCourse } = await import('../core/course.js');
  const { createSRS } = await import('../core/srs.js');
  const { createSessions } = await import('../core/sessions.js');
  const { createRunner } = await import('../core/run.js');
  const now = () => new Date(2026, 10, 27, 12);
  const today = () => dayNumber(now());
  const G = restore({}, today()), S = courseProgress(G, 'tr-ru', pack.course.defaultTopics);
  const course = indexCourse(pack);
  const srs = createSRS(S, { today, has: k => course.DICT.has(k) });
  const runner = createRunner({ S, G, srs, now, grammar: pack.grammar });
  const cfg = createSessions({ S, course, srs }).lesson('t1');
  assert.ok(runner.start(cfg));
  do {
    const s = runner.current(), cols = runner.prepare(s);
    if (s.k === 'match') runner.matchDone(0);
    else if (s.k === 'mc' || (s.k === 'listen' && s.m === 'mc')) runner.settle(s, runner.check(s, { sel: s._o.indexOf(s.o[0]) }).ok);
    else if (s.k === 'build') runner.settle(s, runner.check(s, { line: s.a.split(' ').map(w => s._t.find(t => t.w === w).i) }).ok);
    else if (s.k === 'listen' && s.m === 'build') runner.settle(s, runner.check(s, { line: s.tr.split(' ').map(w => s._t.find(t => t.w === w).i) }).ok);
    else if (s.k === 'speak') runner.settle(s, true);
    else assert.equal(cols, null);
  } while (runner.next());
  const f = runner.finish();
  assert.equal(f.acc, 100);
  assert.equal(S.done.t1, 100);
  assert.ok(G.xp > 0 && f.added > 0);
  assert.equal(srs.due().length, 0, 'new phrases come back tomorrow, not today');
});
