/* Screens: pieces shared by the lesson player and the tabs. Play buttons, the special-letter keys, the progress ring. */
import { $$, esc } from './dom.js';
import { ICON } from './icons.js';
import { Sound } from './audio.js';
import { t } from './i18n.js';
import { course } from './state.js';

/* Parameters for phrases that name the language being learned: «Как это {in}?» → «Как это по-турецки?» */
export const lang = () => ({ in: t(`langs.${course.META.target}.in`) });

export const playBtn = (text, cls) => `<button class="say ${cls || ''}" data-say="${esc(text)}" aria-label="${esc(t('common.listen'))}">${ICON.play}</button>`;
let speakingBtn = null;
Sound.onState(on => { if (speakingBtn) speakingBtn.classList.toggle('playing', on); if (!on) speakingBtn = null; });
export function speak(text, rate, btn) {
  if (speakingBtn && speakingBtn !== btn) speakingBtn.classList.remove('playing');
  speakingBtn = btn || null;
  Sound.say(text, rate);
}
/* Anything with data-say speaks its text when tapped */
document.addEventListener('click', e => {
  const b = e.target.closest('[data-say]');
  if (b) { e.stopPropagation(); speak(b.dataset.say, b.dataset.rate ? +b.dataset.rate : 1, b.querySelector('.say') || b); }
}, true);
/* Buttons for the letters of the language being learned that a keyboard may lack */
export const letterKeys = () => `<div class="keys">${[...course.META.letters].map(c => `<button class="key" data-c="${c}" tabindex="-1">${c}</button>`).join('')}</div>`;
export function wireKeys(input, onChange) {
  $$('.key').forEach(k => {
    k.onmousedown = e => e.preventDefault();
    k.onclick = () => {
      const a = input.selectionStart ?? input.value.length, b = input.selectionEnd ?? a;
      input.value = input.value.slice(0, a) + k.dataset.c + input.value.slice(b);
      input.setSelectionRange(a + 1, a + 1); input.focus(); onChange();
    };
  });
  input.oninput = onChange;
}
export function ring(value, max, size) {
  const r = (size - 10) / 2, C = 2 * Math.PI * r, p = Math.min(1, max ? value / max : 0);
  return `<svg class="ring" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true">
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ring-bg"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ring-fg" style="--c:${C};--o:${C * (1 - p)}" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - p)}"/></svg>`;
}
