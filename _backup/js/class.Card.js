// class.Card.js
function Card(_identifier) {
	// SVG properties
	this.svgns = "http://www.w3.org/2000/svg";
	this.xlinkns = "http://www.w3.org/1999/xlink";
	this.xhtmlns = "http://www.w3.org/1999/xhtml";
	this.svgDocument = document;
	this.root = document.getElementById("displayContainer");

	// Card variables
	this.numericalIdentifier = _identifier+1;
	this.identifier = (_identifier % 13)+1;
	switch(Math.floor((_identifier/52)*4)) {
		case 0:
			this.suit = "heart";
		break;
		case 1:
			this.suit = "spade";
		break;
		case 2:
			this.suit = "diamond";
		break;
		case 3:
			this.suit = "club";
		break;
	}

	// Set card value
	this.value = this.identifier;

	// Fix alphabetical cards
	switch (this.identifier) {
		case 1:
			this.identifier = "A";
			this.value = 1;
			break;
		case 11:
			this.identifier = "J";
			this.value = 10;
			break;
		case 12:
			this.identifier = "Q";
			this.value = 10;
			break;
		case 13:
			this.identifier = "K";
			this.value = 10;
			break;
	}

	// Public methods
	this.getCard = Card_getCard;
	this.getValue = Card_getValue;
	this.getSuit = Card_getSuit;
	this.getIdentifier = Card_getIdentifier;
	this.getNumericalIdentifier = Card_getNumericalIdentifier;
}

// Get the card letter/number
function Card_getIdentifier() {
	return this.identifier;
}

// Get numerical identifier
function Card_getNumericalIdentifier() {
	return this.numericalIdentifier;
}

// Return a card array
function Card_getCard() {
	return new Array(this.identifier, this.suit);
}

// Return card value
function Card_getValue() {
	return this.value;
}

// Return card suit
function Card_getSuit() {
	return this.suit;
}
