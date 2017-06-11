export default class Deck {
  constructor(size) {
    this.size = size;
    this.isShuffled = false;
    this.cards = [];

    this.shuffle();
  }

  shuffle() {
    const { size, cards } = this;

    // Assign random very high values
    for (let i = 0; i < size; i++) {
      cards[i] = Math.round(Math.random() * 10000);
    }

    // Find the largest random number
    const tempShuffledCards = [];
    let tempLargeNumber = 0;
    let tempLargeNumberIndex = 0;

    for (let i = 0; i < size; i++) {
      tempLargeNumber = 0;

      for (let i = 0; i < size; i++) {
        if (tempLargeNumber < cards[i]) {
          tempLargeNumber = cards[i];
          tempLargeNumberIndex = i;
        }
      }

      cards[tempLargeNumberIndex] = 0;
      tempShuffledCards[i] = tempLargeNumberIndex;
    }

    this.cards = tempShuffledCards;
  }

  draw() {
    return parseInt(this.cards.pop());
  }

  atPosition(index) {
    return parseInt(this.cards[index]);
  }
}
