/* Screens: reading and writing progress in the browser's storage.
   Version 4 lives under blably_v4. The older keys (turkce_v3, turkce_v2, turkce_v1) are only read,
   to carry old progress over, and stay untouched as a backup. */
import { restore } from '../core/progress.js';

const KEY = 'blably_v4';
const get = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
export const loadState = day => restore({ v4: get(KEY), v3: get('turkce_v3'), older: get('turkce_v2') || get('turkce_v1') }, day);
export function saveState(G) { try { localStorage.setItem(KEY, JSON.stringify(G)); } catch (e) {} }
