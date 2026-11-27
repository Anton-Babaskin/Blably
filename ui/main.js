/* Screens: start the app. Progress is read when the modules load (see state.js);
   then the interface dictionary and the course package are fetched, and the first screen drawn. */
import { App } from './screens.js';
import { Player } from './player.js';
import { S, loadCourse } from './state.js';
import { useLang, startLang, t } from './i18n.js';
import { esc } from './dom.js';

const COURSE = 'tr-ru';   // the only course so far; choosing a course comes with the next task

const [langDone, courseDone] = await Promise.allSettled([useLang(startLang(S.lang)), loadCourse(COURSE)]);
if (courseDone.status === 'fulfilled') {
  Player.onClose(() => App.render());
  App.go('today');
} else {
  console.error(courseDone.reason);
  const note = langDone.status === 'fulfilled' ? `<p class="lead">${esc(t('app.loadError'))}</p>` : '';
  document.querySelector('#app').innerHTML = `<header class="head"><h1>Blably</h1>${note}</header>`;
}
