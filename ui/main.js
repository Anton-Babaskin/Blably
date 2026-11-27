/* Screens: start the app. Loading the modules reads progress and builds the course (see state.js). */
import { App } from './screens.js';
import { Player } from './player.js';

Player.onClose(() => App.render());
App.go('today');
