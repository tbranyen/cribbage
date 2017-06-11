import { use, html, innerHTML, outerHTML } from 'diffhtml';
import logger from 'diffhtml-middleware-logger';
import Deck from './deck';
import Card from './components/card';

const mount = document.querySelector('.playing-card');
const cachedTransactions = new Set();

function spiral(n) {
  var r = Math.floor((Math.sqrt(n + 1) - 1) / 2) + 1;
  var p = (8 * r * (r - 1)) / 2;
  var en = r * 2;
  var a = (1 + n - p) % (r * 8);
  var pos = [0, 0, r];

  switch (Math.floor(a / (r * 2))) {
    case 0: {
      pos[0] = a - r;
      pos[1] = -r;

      break;
    }

    case 1: {
      pos[0] = r;
      pos[1] = (a % en) - r;

      break;
    }

    case 2: {
      pos[0] = r - (a % en);
      pos[1] = r;

      break;
    }

    case 3: {
      pos[0] = -r;
      pos[1] = r - (a % en);

      break;
    }
  }

  return pos;
}

let modifier = 1;
const deck = new Deck(52);

function update(a) {
  if (a > 300) {
    modifier = -1;
  }
  else if (a === 1) {
    modifier = 1;
  }

  const cards = deck.cards.map((card, i) => ({
    width: 100 + (a * 0.5),
    value: card,
    x: 200 + (a * 0.5 * spiral(i)[0]),
    y: 200 + (a * 0.5 * spiral(i)[1]),
  }));

  render(cards);
  requestAnimationFrame(() => update(a + modifier));
}

function render(cards) {
  innerHTML(mount, html`
    ${cards.map(({ width, value, x, y }) => html`
      <${Card} width=${width} value=${value} x=${x} y=${y} facing />
    `)}
  `);
}

update(1);
