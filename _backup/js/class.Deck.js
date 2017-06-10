// class.Deck.js
function Deck(_numcards) {
	// Variables
	this.numCards = _numcards;
	this.isShuffled = false;
	this.shuffledCards = new Array();

	// Public methods
	this.shuffle = Deck_shuffle;
	this.getShuffledCards = Deck_getShuffledCards;
	this.setShuffledCards = Deck_setShuffledCards;
	this.getCard = Deck_getCard;
	this.getCardByIndex = Deck_getCardByIndex;
}

// Shuffle cards
function Deck_shuffle() {
	// Assign random very high values
	for (var i=0; i<this.numCards; i++) {		this.shuffledCards[i] = Math.round(Math.random()*10000);	}

	var tempShuffledCards = new Array();
	// Find the largest random number	var tempLargeNumber = 0;	var tempLargeNumberIndex = 0;	for (var i=0; i<this.numCards; i++) {		tempLargeNumber = 0;			for (var n=0; n<this.numCards; n++) {			if (tempLargeNumber < this.shuffledCards[n]) {				tempLargeNumber = this.shuffledCards[n];				tempLargeNumberIndex = n;			}		}		this.shuffledCards[tempLargeNumberIndex] = 0;		tempShuffledCards[i] = tempLargeNumberIndex;	}	this.shuffledCards = tempShuffledCards;
}

// Get shuffled cards
function Deck_getShuffledCards() {
	return this.shuffledCards;
}

// Set shuffled cards
function Deck_setShuffledCards(_deck) {
	this.shuffledCards = _deck.split(",");
}

// Get card from top
function Deck_getCard() {
	return parseInt(this.shuffledCards.pop());
}

// Get a card from index - does not remove
function Deck_getCardByIndex(_index) {
	return parseInt(this.shuffledCards[_index]);
}
