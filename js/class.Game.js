//class.Game.js
function Game(_id, _chatid) {
	// Game properties
	this.id = _id;
	this.playerId = null;
	this.players = null;
	this.turn = null;
	this.dealer = null;
	this.hand = null;
	this.handTotal = 0;
	this.cutCard = null;
	this.count = 0;
	this.playableHand = null;
	this.score = 0;
	this.crib = null;
	this.stack = null;

	// Public methods
	this.setPlayers = Game_setPlayers;
	this.getPlayer = Game_getPlayer;
	this.setPlayerId = Game_setPlayerId;
	this.setDealer = Game_setDealer;
	this.isDealer = Game_isDealer;
	this.getScore = Game_getScore;
	this.setScore = Game_setScore;
	this.getNumberOfPlayers = Game_getNumberOfPlayers;
	this.setTurn = Game_setTurn;
	this.getTurn = Game_getTurn;
	this.getCount = Game_getCount;
	this.setCount = Game_setCount;
	this.canPlay = Game_canPlay;
	this.isTurn = Game_isTurn;
	this.dealHand = Game_dealHand;
	this.getHand = Game_getHand;
	this.removeCardFromHand = Game_removeCardFromHand;
	this.getHandTotal = Game_getHandTotal;
	this.setCutCard = Game_setCutCard;
	this.getCutCard = Game_getCutCard;
	this.setCrib = Game_setCrib;
	this.getCribTotal = Game_getCribTotal;
	this.setStack = Game_setStack;
	this.getStack = Game_getStack;
	this.calculateStack = Game_calculateStack;

	// Private methods
	this.checkFlush = Game_checkFlush;
	this.checkFifteen = Game_checkFifteen;
	this.checkPairs = Game_checkPairs;
}

// Get stack
function Game_getStack() {
	return this.stack;
}

// Calculate stack
function Game_calculateStack() {
	var total = 0;
	
	total += this.checkFifteen(this.stack);
	total += this.checkFlush(this.stack, 3, false);
	total += this.checkPairs(this.stack);

	return total;
}

// Set stack
function Game_setStack(_stack) {
	this.stack = _stack;
	for(var card in this.stack) {
		this.stack[card] = parseInt(this.stack[card]);
	}
}

// Set Crib
function Game_setCrib(_crib) {
	this.crib = _crib;
	for(var card in this.crib) {
		this.crib[card] = parseInt(this.crib[card]);
	}
}

// Calculate crib
function Game_getCribTotal() {
	var total = 0;
	
	total += this.checkFifteen(this.crib);
	total += this.checkFlush(this.crib, 3, false);
	total += this.checkPairs(this.crib);

	return total;
}

// Remove card from playable hand
function Game_removeCardFromHand(_card) {
	for(var i=0; i<this.playableHand.length; i++) {
		if(this.playableHand[i].getNumericalIdentifier() == _card.getNumericalIdentifier())
			this.playableHand.splice(i,1);
	}
}

// Set the players score
function Game_setScore(_score) {
	this.score = _score;
}

// Get the players score
function Game_getScore() {
	return this.score;
}

// Set count
function Game_setCount(_count) {
	this.count = _count;
}

// Get count
function Game_getCount() {
	return this.count;
}

// Can the user play?
function Game_canPlay() {
	for(var card in this.playableHand) {
		if((this.playableHand[card].getValue()+this.count) <= 31)
			return true;
	}

	return false;
}

// Add player to game
function Game_setPlayers(_players) {
	this.players = _players.split(",");
}

// Get player by index
function Game_getPlayer(_index) {
	return this.players[_index];
}

// Set player id
function Game_setPlayerId(_id) {
	this.playerId = _id;
}

// Set dealer
function Game_setDealer(_dealer) {
	this.dealer = _dealer;
}

// Are you the dealer?
function Game_isDealer() {
	return (this.playerId == this.dealer) ? true : false;
}

// Get number of players
function Game_getNumberOfPlayers() {
	return this.players.length;
}

// Change turn
function Game_setTurn(_turn) {
	this.turn = _turn;
}

// Get which turn
function Game_getTurn() {
	return this.turn;
}

// Deal a hand to a player
function Game_dealHand() {
	var newHand = new Array();
	for(var i=0; i<6; i++) {
		newHand.push(new Card(deck.getCard()));
		display.createCard(newHand[i], (i*80)+52, 430, 70, true);
	}
	this.hand = newHand;
	this.playableHand = newHand;
}

// Retrieve hand
function Game_getHand() {
	return this.hand;
}

// Calculate points in hand
function Game_getHandTotal() {
	// Reset hand total
	var total = 0;

	total += this.checkPairs(this.hand);
	total += this.checkFifteen(this.hand);
	total += this.checkFlush(this.hand, 4, true);

	return total;
}

// Is turn
function Game_isTurn() {
	return (this.playerId == this.turn) ? true : false;
}

// Set cut card
function Game_setCutCard(_card) {
	this.cutCard = new Card(_card);
}

// Get cut card
function Game_getCutCard() {
	return this.cutCard;
}

// Check same kind
function Game_checkPairs(_array) {
	var returnTotal = 0;

	var tempArray = new Array();
	for(var card in _array) {
		tempArray.push(new Card(_array[card]));
	}

	for(var i=0; i<tempArray.length; i++) {
		var match = 0;
		for(var n=i+1; n<tempArray.length; n++) {
			if(tempArray[i].getValue() == tempArray[n].getValue())
				match++;
		}
		if(match == 2)		returnTotal += 2;
		else if(match == 3)	returnTotal += 6;
		else if(match == 4)	returnTotal += 12;
	}

	return returnTotal;
}

// Check fifteens
function Game_checkFifteen(_array) {
	var returnTotal = 0;

	for(var i=0; i<_array.length-1; i++) {
		for(var n=i+1; n<_array.length; n++) {
			if(_array[i]+_array[n] == 15)
				returnTotal += 2;
		}
	}

	return returnTotal;
}

// Check flush
function Game_checkFlush(_array, _minamount, _usecut) {
	var hearts = 0;
	var spades = 0;
	var clubs = 0;
	var diamonds = 0;

	var returnTotal = 0;

	for(var card in _array) {
		switch(_array[card].getSuit()) {
			case "hearts":
				hearts++;
			break;
			case "spades":
				spades++;
			break;
			case "clubs":
				clubs++;
			break;
			case "diamonds":
				diamonds++;
			break;
		}
	}
	if(_usecut == true) {
		switch(this.cutCard.getSuit()) {
			case "hearts":
				hearts++;
			break;
			case "spades":
				spades++;
			break;
			case "clubs":
				clubs++;
			break;
			case "diamonds":
				diamonds++;
			break;
		}
	}
	
	if(hearts >= _minamount)
		returnTotal += hearts;
	else if(spades >= _minamount)
		returnTotal += spades;
	else if(clubs >= _minamount)
		returnTotal += clubs;
	else if(diamonds >= _minamount)
		returnTotal += diamonds;

	return returnTotal;
}
