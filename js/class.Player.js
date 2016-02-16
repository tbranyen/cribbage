//class.Person.js
function Player(_id, _name) {
	// Properties
	this.id = _id;
	this.name = _name;
	this.hand = null;

	// Public methods
	this.getId = Player_getId;
	this.getName = Player_getName;
	this.setHand = Player_setHand;
}

// Return id
function Player_getId() {
	return this.id;
}

// Return name
function Player_getName() {
	return this.name;
}

// Set hand
function Player_setHand(_hand) {
	this.hand = _hand;
}
