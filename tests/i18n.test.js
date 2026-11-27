// Interface dictionaries: the same keys everywhere, the right number forms, no texts left in the screens' code.
// Run: node --test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { UI_LANGS, pickLang, translator, isPlural } from '../core/i18n.js';

const read = f => fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
const dicts = Object.fromEntries(UI_LANGS.map(l => [l, JSON.parse(read(`i18n/${l}.json`))]));
/* Every leaf as [key, value]; a phrase with number forms and a list count as one leaf */
const leaves = (o, pre = '') => Object.entries(o).flatMap(([k, v]) =>
  v && typeof v === 'object' && !Array.isArray(v) && !isPlural(v) ? leaves(v, pre + k + '.') : [[pre + k, v]]);
const strings = v => typeof v === 'string' ? [v] : Array.isArray(v) ? v : Object.values(v);
const withoutComments = src => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
const holes = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');

test('every dictionary has the same keys', () => {
  const ref = leaves(dicts.ru).map(([k]) => k).sort();
  for (const l of UI_LANGS) assert.deepEqual(leaves(dicts[l]).map(([k]) => k).sort(), ref, `i18n/${l}.json`);
});

test('number forms match each language’s rules', () => {
  for (const l of UI_LANGS) {
    const need = new Intl.PluralRules(l).resolvedOptions().pluralCategories;
    for (const [k, v] of leaves(dicts[l])) if (isPlural(v)) assert.deepEqual(Object.keys(v).sort(), [...need].sort(), `${l}: ${k}`);
  }
});

test('the same {placeholders} in every language, no HTML in the texts', () => {
  const ref = Object.fromEntries(leaves(dicts.ru).map(([k, v]) => [k, strings(v).map(holes)]));
  for (const l of UI_LANGS) for (const [k, v] of leaves(dicts[l])) {
    const s = strings(v);
    s.forEach(x => assert.equal(typeof x, 'string', `${l}: ${k}`));
    s.forEach(x => assert.doesNotMatch(x, /[<>]/, `${l}: ${k} has markup`));
    assert.ok(s.every(x => holes(x) === ref[k][0]), `${l}: ${k} placeholders differ from ru`);
  }
});

test('every key the screens ask for exists, and no key is unused', () => {
  const code = fs.readdirSync(new URL('../ui/', import.meta.url)).map(f => withoutComments(read(`ui/${f}`))).join('\n');
  const keys = new Set(leaves(dicts.ru).map(([k]) => k));
  const used = [...code.matchAll(/\bt\('([\w.]+)'/g)].map(m => m[1]);
  const prefixes = [...code.matchAll(/\bt\(`([\w.]+)\$\{/g)].map(m => m[1]);       // t(`today.greet.${slot}`)
  const indirect = [...code.matchAll(/'((?:player|common|today|course|practice|words|fin|settings|top|tabs|app)\.[\w.]+)'/g)].map(m => m[1]);
  for (const k of used) assert.ok(keys.has(k), `missing in dictionaries: ${k}`);
  for (const k of keys) assert.ok(used.includes(k) || indirect.includes(k) || prefixes.some(p => k.startsWith(p)), `not used anywhere: ${k}`);
});

test('no interface text is written in the screens’ code', () => {
  for (const f of fs.readdirSync(new URL('../ui/', import.meta.url))) {
    const src = withoutComments(read(`ui/${f}`));
    assert.doesNotMatch(src, /[А-Яа-яЁёІіЇїЄєҐґ]/, `ui/${f} has Cyrillic text`);
  }
  const body = read('index.html').split('<body>')[1];
  assert.doesNotMatch(body, /[А-Яа-яЁёІіЇїЄєҐґ]/, 'index.html body has text');
});

test('the language: address, own choice, browser, then English', () => {
  assert.equal(pickLang({ browser: ['uk-UA', 'ru'] }), 'uk');
  assert.equal(pickLang({ browser: ['de-DE', 'en-US'] }), 'en');
  assert.equal(pickLang({ browser: ['tr-TR'] }), 'en');
  assert.equal(pickLang({ browser: [] }), 'en');
  assert.equal(pickLang({ saved: 'ru', browser: ['uk'] }), 'ru');
  assert.equal(pickLang({ url: 'en', saved: 'ru', browser: ['uk'] }), 'en');
  assert.equal(pickLang({ url: 'xx', saved: 'uk', browser: ['ru'] }), 'uk');
});

test('phrases are filled in and get the right number form', () => {
  const ru = translator(dicts.ru, 'ru'), uk = translator(dicts.uk, 'uk'), en = translator(dicts.en, 'en');
  assert.equal(ru('today.due', { n: 1 }), '1 фраза ждёт повторения');
  assert.equal(ru('today.due', { n: 3 }), '3 фразы ждут повторения');
  assert.equal(ru('today.due', { n: 11 }), '11 фраз ждут повторения');
  assert.equal(ru('today.due', { n: 21 }), '21 фраза ждёт повторения');
  assert.equal(uk('fin.added', { n: 5 }), '5 фраз додано до повторення на завтра.');
  assert.equal(en('common.streakDays', { n: 1 }), 'day in a row');
  assert.equal(en('common.streakDays', { n: 2 }), 'days in a row');
  assert.equal(ru('player.askTranslate', { in: ru('langs.tr.in') }), 'Как это по-турецки?');
  assert.equal(en('no.such.key'), 'no.such.key');
});
