// Lists every phrase the app can say in one language, from all courses that teach it, grouped into audio packs.
// Output: tools/keys.json = {lang, packs: {pack: [[key, text], ...]}}
// Usage: node tools/list-phrases.js [lang]      (default: tr)
import fs from 'node:fs';
import { listPhrases } from '../core/phrases.js';
import { packsFor } from './packs.js';

const lang = process.argv[2] || 'tr';
const packs = packsFor(lang);
if (!packs.length) { console.error(`no course with voice «${lang}» in courses/`); process.exit(1); }
const out = listPhrases(packs);
fs.writeFileSync(new URL('keys.json', import.meta.url), JSON.stringify({ lang, packs: out }));
console.log(lang, 'from', packs.map(p => p.course.id).join(', '));
for (const k in out) console.log(k, out[k].length);
