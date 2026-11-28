/* Screens: start the app. Progress is read when the modules load (see state.js);
   then the interface dictionary and the list of courses are fetched, then the course package, and the first screen drawn.
   With several courses and none chosen yet, the first screen is the course choice. */
import { App } from './screens.js';
import { Player } from './player.js';
import { G, loadCatalog, loadCourse } from './state.js';
import { useLang, startLang, t } from './i18n.js';
import { esc } from './dom.js';
import { startCourse } from '../core/catalog.js';

const [langDone, listDone] = await Promise.allSettled([useLang(startLang(G.lang)), loadCatalog()]);
function fail(e) {
  console.error(e);
  const note = langDone.status === 'fulfilled' ? `<p class="lead">${esc(t('app.loadError'))}</p>` : '';
  document.querySelector('#app').innerHTML = `<header class="head"><h1>Blably</h1>${note}</header>`;
}
Player.onClose(() => App.render());
if (listDone.status === 'rejected') fail(listDone.reason);
else {
  const id = startCourse(listDone.value, G.course);
  if (!id) App.choose();
  else {
    try { await loadCourse(id); App.go('today'); } catch (e) { fail(e); }
  }
}
