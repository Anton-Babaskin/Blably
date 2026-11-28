/* Screens: icons. One line family: 24px grid, 1.8 stroke, round caps. Coloured by CSS (currentColor). */
export const svg = (d, extra) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra || ''}>${d}</svg>`;
export const ICON = {
  home: svg('<path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z"/>'),
  path: svg('<circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="6" r="2.2"/><path d="M8.2 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.8"/>'),
  target: svg('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".6" fill="currentColor"/>'),
  book: svg('<path d="M12 6.5C10.5 5.2 8.3 4.5 5 4.5v13c3.3 0 5.5.7 7 2 1.5-1.3 3.7-2 7-2v-13c-3.3 0-5.5.7-7 2z"/><path d="M12 6.5v13"/>'),
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10.6-6.4a1 1 0 0 0 0-1.72L9.5 4.74A1 1 0 0 0 8 5.6z" fill="currentColor"/></svg>',
  speaker: svg('<path d="M4.5 9.5h3l4.5-4v13l-4.5-4h-3z" fill="currentColor" stroke-width="1.4"/><path d="M15.5 9a4 4 0 0 1 0 6M18.2 6.5a7.5 7.5 0 0 1 0 11"/>'),
  x: svg('<path d="M6 6l12 12M18 6 6 18"/>', 'stroke-width="2.2"'),
  ok: svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>', 'stroke-width="2.6"'),
  back: svg('<path d="m15 5-7 7 7 7"/>', 'stroke-width="2.2"'),
  chev: svg('<path d="m9 6 6 6-6 6"/>', 'stroke-width="2"'),
  flame: svg('<path d="M12 21c-3.9 0-6.5-2.6-6.5-6.2 0-3.2 2.2-5.4 3.6-7 .4 1.8 1.4 3 2.6 3.4C11.3 8 12.4 5 14.6 3c.3 2.7 1.6 4.3 2.8 5.8 1.2 1.4 1.6 3.3 1.6 5.2C19 18.3 16 21 12 21z"/>'),
  bolt: svg('<path d="M13 3 5.5 13.2h5.3L10 21l8.5-11h-5.4z"/>'),
  layers: svg('<path d="m12 4 8.5 4.5L12 13 3.5 8.5z"/><path d="m3.5 12.5 8.5 4.5 8.5-4.5"/><path d="m3.5 16.5 8.5 4.5 8.5-4.5" opacity=".5"/>'),
  repeat: svg('<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.7"/><path d="M20 4v4.7h-4.7"/><path d="M20 12a8 8 0 0 1-13.7 5.6L4 15.3"/><path d="M4 20v-4.7h4.7"/>'),
  lesson: svg('<rect x="4" y="3.5" width="16" height="17" rx="3"/><path d="M8.5 8.5h7M8.5 12h7M8.5 15.5h4"/>'),
  headphones: svg('<path d="M4 14v-1.5a8 8 0 0 1 16 0V14"/><rect x="3.5" y="13.5" width="4.5" height="6.5" rx="2"/><rect x="16" y="13.5" width="4.5" height="6.5" rx="2"/>'),
  mic: svg('<rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v2.5"/>'),
  alert: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.8v5M12 16.2v.1"/>'),
  grammar: svg('<path d="M5 19 9.5 5h1L15 19M6.6 14h7.3"/><path d="M17 9.5h3.5M18.75 7.75v3.5"/>'),
  sparkle: svg('<path d="M12 3.5c.6 3.9 2.6 5.9 6.5 6.5-3.9.6-5.9 2.6-6.5 6.5-.6-3.9-2.6-5.9-6.5-6.5 3.9-.6 5.9-2.6 6.5-6.5z"/><path d="M18.5 15.5c.25 1.6 1 2.35 2.5 2.5-1.5.25-2.25 1-2.5 2.5-.25-1.5-1-2.25-2.5-2.5 1.5-.15 2.25-.9 2.5-2.5z"/>'),
  gear: svg('<path d="M10.38 4.98L10.68 2.59A9.5 9.5 0 0 1 13.32 2.59L13.62 4.98A7.2 7.2 0 0 1 15.82 5.89L17.72 4.41A9.5 9.5 0 0 1 19.59 6.28L18.11 8.18A7.2 7.2 0 0 1 19.02 10.38L21.41 10.68A9.5 9.5 0 0 1 21.41 13.32L19.02 13.62A7.2 7.2 0 0 1 18.11 15.82L19.59 17.72A9.5 9.5 0 0 1 17.72 19.59L15.82 18.11A7.2 7.2 0 0 1 13.62 19.02L13.32 21.41A9.5 9.5 0 0 1 10.68 21.41L10.38 19.02A7.2 7.2 0 0 1 8.18 18.11L6.28 19.59A9.5 9.5 0 0 1 4.41 17.72L5.89 15.82A7.2 7.2 0 0 1 4.98 13.62L2.59 13.32A9.5 9.5 0 0 1 2.59 10.68L4.98 10.38A7.2 7.2 0 0 1 5.89 8.18L4.41 6.28A9.5 9.5 0 0 1 6.28 4.41L8.18 5.89A7.2 7.2 0 0 1 10.38 4.98Z"/><circle cx="12" cy="12" r="3"/>'),
  lock: svg('<rect x="5.5" y="10.5" width="13" height="9.5" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>')
};
/* The brand mark, drawn inline so it scales cleanly */
export const MARK = `<svg class="mark" viewBox="100 54 362 438" aria-hidden="true"><path d="M146 108A40 40 0 0 1 226 108V168A150 150 0 1 1 214 446L132 482C118 488 108 476 116 464L146 418ZM302 236A64 64 0 1 0 302.1 236Z" fill="#2F6BFF" fill-rule="evenodd"/></svg>`;
