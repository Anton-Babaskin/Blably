/* Screens: reading and writing progress in the browser's storage.
   The key and the shape of the data stay as they were: people already have progress saved. */
import { restore } from '../core/progress.js';

const KEY = 'turkce_v3';
const get = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
export const loadState = day => restore(get(KEY), get('turkce_v2') || get('turkce_v1'), day);
export function saveState(S) { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
