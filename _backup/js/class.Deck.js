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
	for (var i=0; i<this.numCards; i++) {

	var tempShuffledCards = new Array();

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