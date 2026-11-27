/* Screens: the core wired to this device. Progress from storage, the course, repetition,
   session builders and the session runner. Every screen imports from here. */
import * as content from '../data.js';
import { dayNumber } from '../core/progress.js';
import { indexCourse } from '../core/course.js';
import { createSRS } from '../core/srs.js';
import { createSessions } from '../core/sessions.js';
import { createRunner } from '../core/run.js';
import { loadState, saveState } from './storage.js';

export const now = () => new Date();
export const today = () => dayNumber(now());
export const S = loadState(today());
export const save = () => saveState(S);
export const course = indexCourse(content);
export const srs = createSRS(S, { today, has: k => course.DICT.has(k) });
export const sessions = createSessions({ S, course, srs });
export const runner = createRunner({ S, srs, now });
