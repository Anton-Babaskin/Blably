/* Screens: question cards drawn from the data the core gives. No page access, so Node can check them too. */
import { esc } from './dom.js';

/* The text in a multiple-choice card: a Turkish phrase or its translation */
export const shownText = sh => `<div class="${sh.lang === 'target' ? 'big-tr' : 'big-ru'}">${esc(sh.text)}</div>`;

/* A grammar question. Mistakes saved by older versions keep their prompt as ready HTML. */
export function gqPrompt(p) {
  if (typeof p === 'string') return p;
  const main = p.kind === 'word' ? `<div class="gq-word">${esc(p.word)}</div>` : `<div class="gq-sent">${esc(p.lead)} <span class="blank"></span>${p.q ? ' ?' : ''}</div>`;
  const tr = p.kind === 'word' ? esc(p.tr) : `${esc(p.word)} — ${esc(p.tr)}`;
  return `<div class="gq-task">${esc(p.task)}</div>${main}<div class="gq-tr">${tr}</div>`;
}
