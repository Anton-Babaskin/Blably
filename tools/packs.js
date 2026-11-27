// Reading course packages from disk, for the tools and the tests (the app fetches them in ui/state.js).
import fs from 'node:fs';
import { PACK_FILES } from '../core/pack.js';

const COURSES = new URL('../courses/', import.meta.url);
export const courseIds = () => fs.readdirSync(COURSES).filter(d => fs.existsSync(new URL(`${d}/course.json`, COURSES))).sort();
export const readPack = id => Object.fromEntries(PACK_FILES.map(f => [f, JSON.parse(fs.readFileSync(new URL(`${id}/${f}.json`, COURSES), 'utf8'))]));
/* All courses that teach this language: they share one voice */
export const packsFor = lang => courseIds().map(readPack).filter(p => p.course.voice === lang);
