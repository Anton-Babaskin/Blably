/* Screens: start the app. Loading the modules reads progress and builds the course (see state.js),
   then the interface dictionary is fetched and the first screen drawn. */
import { App } from './screens.js';
import { Player } from './player.js';
import { S } from './state.js';
import { useLang, startLang } from './i18n.js';

await useLang(startLang(S.lang));
Player.onClose(() => App.render());
App.go('today');
