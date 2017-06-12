import { use, html, innerHTML } from 'diffhtml';
import logger from 'diffhtml-middleware-logger';
import Deck from './deck';
import Card from './components/card';
import Board from './components/board';
import hmr from './hmr';

const mount = document.querySelector('svg');
const deck = new Deck(52);

use(hmr({ clearConsole: true, src: 'dist/cribbage.js' }));

const render = () => innerHTML(mount, html`
  <defs>
    <linearGradient id="card_background" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:rgb(230, 238, 243); stop-opacity:1"/>
      <stop offset="20%" style="stop-color:rgb(255, 255, 255); stop-opacity: 1"/>
      <stop offset="40%" style="stop-color:rgb(255, 255, 255); stop-opacity: 1"/>
      <stop offset="100%" style="stop-color:rgb(200, 238, 243); stop-opacity:1"/>
    </linearGradient>
  </defs>

  <g class="board">
    <${Board} width=${window.innerWidth - 150} x=${50} y=${50} />
  </g>

  <g class="card">
    <${Card} value=${deck.draw()} width=${100} x=${50} y=${400} />
    <${Card} value=${deck.draw()} width=${100} x=${175} y=${400} />
    <${Card} value=${deck.draw()} width=${100} x=${300} y=${400} />
    <${Card} value=${deck.draw()} width=${100} x=${425} y=${400} />
    <${Card} value=${deck.draw()} width=${100} x=${550} y=${400} />
    <${Card} value=${deck.draw()} width=${100} x=${675} y=${400} />
  </g>
`);

window.onresize = render;
render();
