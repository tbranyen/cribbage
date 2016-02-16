// Start application
function init() {
	// Globals
	svgns = "http://www.w3.org/2000/svg";
	xlinkns = "http://www.w3.org/1999/xlink";
	xhtmlns = "http://www.w3.org/1999/xhtml";
	display = new Display();
	validate = new Validate();
	game = new Game();
	deck = new Deck(52);
	currentPage = "intro";
	currentlyAnimating = false;
	svgContainer = document.getElementById("svgContainer");
	selectedCards = new Array();

	// Chat properties
	chatroom = 0;
	userid = 0;
	user_name = "";

	// Game properties
	game_id = 0;
	game_chat_id = 0;
	opponent_name = "";
	game_user_id = 0;	// Your game user id, other id will be the opponents
	invite_user_name = "";
	inviteTimeout = null;

	// Build page frame
	display.buildPage();

	// Show introduction
	showIntro();
}

// End application
function exit() {
	// Logout user
	logoutUser();

	// End game
	endGame();
}

// End game
function endGame() {
	// End game here
	var ajaxRequest = new AjaxRequest("php/game.php", "GET", false, "endgame");
	ajaxRequest.callBack = function() {}
	ajaxRequest.connect();
}

// Show introduction
function showIntro() {
	if (currentPage != "intro" && !currentlyAnimating) {
		currentPage = "intro";
		currentlyAnimating = true;

		// Show intro page
		var divInformationOpacity = new Animation("divInformation");
		divInformationOpacity.onComplete = function() {
			// Reset information
			display.clearInformation();

			// Show intro
			display.showIntro();

			// Fade back in
			divInformationOpacity = new Animation("divInformation");
			divInformationOpacity.onComplete = function() {
				currentlyAnimating = false;
			}
			divInformationOpacity.cssAttributeMotion("opacity", 1, null, 1);
		}
		divInformationOpacity.cssAttributeMotion("opacity", 0, null, 1);
	}
	else if (currentPage == "intro" && !currentlyAnimating) {
		display.showIntro();
	}
}

// Show login
function showLogin() {
	if (currentPage != "login" && !currentlyAnimating) {
		currentPage = "login";
		currentlyAnimating = true;

		// Fade out
		var divInformationOpacity = new Animation("divInformation");
		divInformationOpacity.onComplete = function() {

			// Reset information
			display.clearInformation();

			// Show login
			display.showLogin();

			// Fade back in
			divInformationOpacity = new Animation("divInformation");
			divInformationOpacity.onComplete = function() {
				currentlyAnimating = false;
			}
			divInformationOpacity.cssAttributeMotion("opacity", 1, null, 1);
		}
		divInformationOpacity.cssAttributeMotion("opacity", 0, null, 1);
	}
}

// Show forgot password
function showForgotPassword() {
	if (currentPage != "forgot" && !currentlyAnimating) {
		currentPage = "forgot";
		currentlyAnimating = true;

		// Fade out
		var divInformationOpacity = new Animation("divInformation");
		divInformationOpacity.onComplete = function() {

			// Reset information
			display.clearInformation();

			// Show login
			display.showForgotPassword();

			// Fade back in
			divInformationOpacity = new Animation("divInformation");
			divInformationOpacity.onComplete = function() {
				currentlyAnimating = false;
			}
			divInformationOpacity.cssAttributeMotion("opacity", 1, null, 1);
		}
		divInformationOpacity.cssAttributeMotion("opacity", 0, null, 1);
	}
}

// Show register
function showRegister() {
	if (currentPage != "register" && !currentlyAnimating) {
		currentPage = "register";
		currentlyAnimating = true;

		// Fade out
		var divInformationOpacity = new Animation("divInformation");
		divInformationOpacity.onComplete = function() {

			// Reset information
			display.clearInformation();

			// Show login
			display.showRegister();

			// Fade back in
			divInformationOpacity = new Animation("divInformation");
			divInformationOpacity.onComplete = function() {
				currentlyAnimating = false;
			}
			divInformationOpacity.cssAttributeMotion("opacity", 1, null, 1);
		}
		divInformationOpacity.cssAttributeMotion("opacity", 0, null, 1);
	}
}

// Register user
function registerUser() {
	if (validate.registration()) {
		var username = document.getElementById("inputUsername");
		var password = document.getElementById("inputPassword");
		var email = document.getElementById("inputEmail");
		var securityCode = document.getElementById("inputSecurityCode");

		var ajaxRequest = new AjaxRequest("php/user.php?register", "POST", false, "username="+username.value+"&password="+password.value+"&email="+email.value+"&securitycode="+securityCode.value);

		ajaxRequest.callBack = function() {
			var responseText = arguments[0];
			try {
				var json = eval('(' + responseText + ')');
			
				if(json.status == "success")
					showThankYou();
		
				display.showErrors(json.errors);
			}
			catch(e) {
				display.showErrors(responseText + "<br />");
			}
		}

		// Establish connection
		ajaxRequest.connect();
	}
	else {
		var imgSecurityCode = document.getElementById("imgSecurityCode");
		imgSecurityCode.setAttribute("src", "about:blank");
		imgSecurityCode.setAttribute("src", "php/getImg.php");
	}
}

// Login user
function loginUser() {
	if(validate.login()) {
		var username = document.getElementById("inputUsername");
		var password = document.getElementById("inputPassword");

		var ajaxRequest = new AjaxRequest("php/user.php?login", "POST", false, "username="+username.value+"&password="+password.value);

		ajaxRequest.callBack = function() {
			var responseText = arguments[0];
			try {
				var json = eval('(' + responseText + ')');
			
				if(json.status == "success") {
					// Show logout
					document.getElementById("logout").style.display = "block";

					// Chat info
					userid = json.userid;
					user_name = json.username;

					// Game info
					game_id = json.gameid;
					game_chat_id = json.gamechatid;

					// Take to lobby
					showLobby();
				}
		
				display.showErrors(json.errors);
			}
			catch(e) {

			}
		}

		// Establish connection
		if(!ajaxRequest.connect()) {
			window.alert("Unable to communicate with server.");
		}
	}
}

// Logout user and remove from chat
function logoutUser() {
	// Remove user from chat
	var chatRemoveRequest = new AjaxRequest("php/chat.php", "GET", false, "remove");
	chatRemoveRequest.callBack = function() {}	chatRemoveRequest.connect();

	// Remove user from system
	var userRemoveRequest = new AjaxRequest("php/user.php", "GET", false, "logout");
	userRemoveRequest.callBack = function() {}	userRemoveRequest.connect();

	window.location.reload(false);
}

// Show thank you
function showThankYou() {
	if (currentPage != "thankyou" && !currentlyAnimating) {
		currentPage = "thankyou";
		currentlyAnimating = true;

		// Fade out
		var divInformationOpacity = new Animation("divInformation");
		divInformationOpacity.onComplete = function() {
			// Reset information
			display.clearInformation();

			// Show login
			display.showThankYou();

			// Fade back in
			divInformationOpacity = new Animation("divInformation");
			divInformationOpacity.onComplete = function() {
				currentlyAnimating = false;
			}
			divInformationOpacity.cssAttributeMotion("opacity", 1, null, 1);
		}
		divInformationOpacity.cssAttributeMotion("opacity", 0, null, 1);
	}
}

// Show lobby
function showLobby() {
	if(currentPage != "lobby") {
		currentPage = "lobby";

		// Hide stuff
		display.clearAll();

		// Add yourself to the chat users list
		var ajaxRequest = new AjaxRequest("php/chat.php", "GET", false, "add");
		ajaxRequest.callBack = function() {}
		ajaxRequest.connect();

		// Change svg container
		var svgAnimation = new Animation("svgContainer");
		svgAnimation.onComplete = function() {
			// Display create game crap
			display.showCreateGame();
		}
		svgAnimation.resize(null, 150, 3);

		document.getElementById("chatWrapper").style.display = "block";

		var chatOpacity = new Animation("chatWrapper");
		chatOpacity.onComplete = function() {}
		chatOpacity.cssAttributeMotion("opacity", 1, null, 2);

		var chatTextMaxHeight = new Animation("chatText");
		chatTextMaxHeight.onComplete = function() {}
		chatTextMaxHeight.cssAttributeMotion("max-height", 350, "px", 3);

		var chatUserListHeight = new Animation("chatUserList");
		chatUserListHeight.onComplete = function() {}
		chatUserListHeight.cssAttributeMotion("height", 366, "px", 3);

		var chatWindowHeight = new Animation("chatWindow");
		chatWindowHeight.onComplete = function() {}
		chatWindowHeight.cssAttributeMotion("height", 350, "px", 3);

		// Time to monitor events
		monitorEvents();
	}
}

// Parse out events and display them accordingly
function monitorEvents() {
	var eventRequest = new AjaxRequest("php/events.php", "GET", true, "chatroom="+chatroom+"&userid="+userid+"&gameid="+game_id+"&gamechatid="+game_chat_id+"&username="+user_name);

	lastEventCount = 0;
	eventRequest.callBack = function() {
		var responseText = arguments[0];
		document.getElementById("outputParsed").innerHTML = responseText;
		var events = responseText.match(/\{[^}]+\}/g);
		if(events != null) {
			for(var i=0; i<events.length; i++) {
				if(i >= lastEventCount) {
					lastEventCount++;
					parseEvent(events[i]);
					document.getElementById("output").innerHTML += events[i] + "<br />";
				}
			}
		}
	}

	eventRequest.connectComet();
}

// Parse event
function parseEvent(_event) {
	var responseText = _event;
	try {
		if(responseText.length > 1) {
			var json = eval('(' + responseText + ')');

			switch(json.type) {
				case "chat":
					switch(json.event) {
						case "users":
							usercount = json.usercount;
							display.clear(document.getElementById("chatUserList"));
							for(var i=0; i<json.users.length; i++) {
								display.createChatUser(json.users[i], user_name);
							}
						break;
						case "message":
							display.addChatMessage(json.msg);
						break;
					}
				break;
				case "game":
					switch(json.event) {
						case "invite":
							// Make these global
							invite_name = json.from;
							invite_game_id = json.gameid;
							invite_game_chat_id = json.gamechatid;
	
							// Show invite window
							display.showInvite(invite_name);

							// Timeout after 20 seconds
							inviteTimeout = setTimeout("respondToInvite('no');", 20000);
						break;
						case "invitestatus":
							if(json.status == "true") {
								game_user_id = 0;
								opponent_name = invite_user_name;

								// Remove yourself from the chat users list
								var ajaxRequest = new AjaxRequest("php/chat.php", "GET", false, "remove");
								ajaxRequest.callBack = function() {}
								ajaxRequest.connect();
							
								// Set up the game
								var setupRequest = new AjaxRequest("php/game.php", "GET", false, "setupgame&gameid="+game_id+"&gamechatid="+game_chat_id+"&player2="+opponent_name);
								setupRequest.callBack = function() {}								setupRequest.connect();

								// Shuffle cards and sync decks
								deck.shuffle();
								syncDeck();

								// Set dealer
								var dealerRequest = new AjaxRequest("php/game.php", "GET", false, "setdealer&dealer="+Math.round(Math.random(1)));
								dealerRequest.callBack = function() {}								dealerRequest.connect();

								setUpGame();
							}
							else {
								// BALLS TO THE WALLS
								display.showGameMessage("Player rejected invite.");
							}
						break;
						case "playerschanged":
							game.setPlayers(json.players);
							if(game.getPlayer(0) == user_name)
								game.setPlayerId(0);
							else
								game.setPlayerId(1);

						break;
						case "dealerchanged":
							game.setDealer(json.dealer);
							game.setTurn((json.dealer+1)%2);

							if(game.isDealer()) {
								var turnRequest = new AjaxRequest("php/game.php", "GET", false, "setturn");
								turnRequest.callBack = function() {}
								turnRequest.connect();
								display.showGameMessage("You are dealer!");
								
								document.getElementById("whosCrib").style.opacity = "1";
							}
							else {
								document.getElementById("whosCrib").style.opacity = "0";
								display.showGameMessage("Choose two cards for your crib and press To Crib!");
							}
						break;
						case "deckchanged":
							deck.setShuffledCards(json.deck);
						break;
						case "countchanged":
							game.setCount(json.count);
							displayCount();
							if(game.getCount() >= 31) {
								game.setScore(game.getScore()+1);
								syncScore();
								clearStack();
								clearCount();
								changeTurn();
							}
						break;
						case "turnchanged":
							game.setTurn(json.turn);
							performTurn();
						break;
						case "cribfull":
							cutCard();
							if(game.isDealer())
								game.setCrib = crib.split(",");
						break;
						case "stackchanged":
							var stack = json.stack.split(",");
							game.setStack(stack);
							if(stack.length != 0)
								displayLargeCard(new Card(game.getStack()[stack.length-1]));
							else
								displayLargeCard(null);

							// Check pegging points
							game.setScore(game.getScore()+game.calculateStack());

							// Sync points
							syncScore();
						break;
						case "scoreschanged":
							var scores = json.scores.split(",");
							game.setScore(scores[game.playerId]);
							board.movePlayer(game.playerId, scores);
						break;
						case "go":
							if(!game.canPlay()) {
								display.showGameMessage("You cannot play a card.  Clearing play.");
								game.setScore(game.getScore()+1);
								syncScore();
								clearStack();
								clearCount();
								changeTurn();
							}
						break;
						case "cutcardchanged":
							game.setCutCard(parseInt(json.cutcard));
							showCutCard();
							performTurn();
						break;
						case "endplay":
							clearCount();
							clearStack();
							countHand();

							document.getElementById("inputToCrib").setAttribute("onclick", "toCrib();");
						break;
						case "endgame":
							exit();
						break;
					}
				break;
			}
		}
	}
	catch(e) {

	}
}

// Display large card
function displayLargeCard(_card) {
	display.createCard(_card, 490, 10, 120, false);
}

// Display cut card
function showCutCard() {
	display.createCard(game.getCutCard(), 620, 10, 120, false);
}

// Display count
function displayCount() {
	var countDisplay = document.getElementById("spanCount");
	display.clear(countDisplay);
	countDisplay.appendChild(document.createTextNode(game.getCount()));
}

// Sync count
function syncCount() {
	var countRequest = new AjaxRequest("php/game.php", "GET", false, "setcount&count="+game.getCount());
	countRequest.callBack = function() {}
	countRequest.connect();
}

// Count hand
function countHand() {
	game.setScore(game.getScore()+game.getHandTotal());

	if(game.isDealer()) {
		game.setScore(game.getScore()+game.getCribTotal());
		game.setCrib(null);
	}

	syncScore();
}

// Clear stack
function clearStack() {
	var countRequest = new AjaxRequest("php/game.php", "GET", false, "clearstack");
	countRequest.callBack = function() {}
	countRequest.connect();
}

// Clear count
function clearCount() {
	game.setCount(0);

	var countRequest = new AjaxRequest("php/game.php", "GET", false, "setcount&count="+0);
	countRequest.callBack = function() {}
	countRequest.connect();
}

// Upload score
function syncScore() {
	var scoreRequest = new AjaxRequest("php/game.php", "GET", false, "setpoints&points="+game.getScore());
	scoreRequest.callBack = function() {}
	scoreRequest.connect();
}

// Perform a turn
function performTurn() {
	if(game.isTurn()) {
		if(game.getHand() == null) {
			game.dealHand();
			syncDeck();
			changeTurn();
		}
		else {
			if(!game.canPlay()) {
				display.showGameMessage("You cannot play, it's a go.");
				changeTurn();
				go();
			}
			else {
				display.showGameMessage("It is your turn to play a card.");
			}
		}
	}
}

// You can't play a card so go
function go() {
	var goRequest = new AjaxRequest("php/game.php", "GET", false, "go");
	goRequest.callBack = function() {}
	goRequest.connect();
}

// Cut card
function cutCard() {
	if(game.isDealer()) {
		game.setCutCard(deck.getCard());

		var cutCardRequest = new AjaxRequest("php/game.php", "GET", false, "setcutcard&cutcard="+(game.getCutCard()).getNumericalIdentifier());
		cutCardRequest.callBack = function() {}
		cutCardRequest.connect();

		syncDeck();
	}
}

// Change the turn
function changeTurn() {
	var turnRequest = new AjaxRequest("php/game.php", "GET", false, "setturn");
	turnRequest.callBack = function() {}
	turnRequest.connect();
}

// Send back the deck of cards
function syncDeck() {
	// Send back cards
	var deckRequest = new AjaxRequest("php/game.php", "GET", false, "setdeck&cards="+deck.getShuffledCards());
	deckRequest.callBack = function() {}	deckRequest.connect();
}

// Add to the stack
function addStack(_value) {
	// Send back cards
	var stackRequest = new AjaxRequest("php/game.php", "GET", false, "setstack&card="+_value);
	stackRequest.callBack = function() {}	stackRequest.connect();
}

// Start game!
function showGame() {
	if (currentPage != "game") {
		currentPage = "game";
	
		// Hide stuff
		display.clearAll();

		document.getElementById("chatWrapper").style.display = "block";

		var svgAnimation = new Animation("svgContainer");
		svgAnimation.onComplete = function() {
			board = new Board("img/boardtexture.jpg");
			board.generate();

			display.showGameElements();
		}
		svgAnimation.resize(null, 550, 3);

		var chatOpacity = new Animation("chatWrapper");
		chatOpacity.onComplete = function() {}
		chatOpacity.cssAttributeMotion("opacity", 1, null, 2);

		var chatTextMaxHeight = new Animation("chatText");
		chatTextMaxHeight.onComplete = function() {}
		chatTextMaxHeight.cssAttributeMotion("max-height", 65, "px", 3);

		var chatUserListHeight = new Animation("chatUserList");
		chatUserListHeight.onComplete = function() {}
		chatUserListHeight.cssAttributeMotion("height", 81, "px", 3);

		var chatWindowHeight = new Animation("chatWindow");
		chatWindowHeight.onComplete = function() {}
		chatWindowHeight.cssAttributeMotion("height", 65, "px", 3);
	}
}

// Say something to chat
function sayToChat(event) {
	if (event && event.which != 13)
		return false;

	var _msg = document.getElementById("msg");
	var msg = _msg.value;

	// Create chat connection
	var ajaxRequest = new AjaxRequest("php/chat.php", "GET", false, "say&msg="+msg+"&chatid="+game_chat_id);
	ajaxRequest.callBack = function() {}
	ajaxRequest.connect();

	// Clear chat box
	_msg.value = "";
}

// Send out invite
function sendInvite(_to) {
	invite_user_name = _to;
	var inviteRequest = new AjaxRequest("php/game.php", "GET", false, "invite&to="+_to);
	inviteRequest.callBack = function() {}	inviteRequest.connect();
}

// Respond to invite
function respondToInvite(_status) {
	// Clear the timeout
	clearTimeout(inviteTimeout);
	// Who invited you
	var name = invite_name;
	// Hide invite
	display.hideInvite();
	if(_status == "yes") {
		// Remove yourself from the chat users list
		var ajaxRequest = new AjaxRequest("php/chat.php", "GET", false, "remove");
		ajaxRequest.callBack = function() {}
		ajaxRequest.connect();

		// Change game variables
		game_user_id = 1;
		opponent_name = name;
		game_id = invite_game_id;
		game_chat_id = invite_game_chat_id;

		// Change game id and chat id in sessions
		var changeRequest = new AjaxRequest("php/game.php", "GET", false, "setvariables&gameid="+game_id+"&gamechatid="+game_chat_id);
		changeRequest.callBack = function() {}		changeRequest.connect();

		// Send off status | confirm
		var statusRequest = new AjaxRequest("php/game.php", "GET", false, "respond&status=yes&user="+name+"&gameid="+invite_game_id+"&gamechatid="+invite_game_chat_id);
		statusRequest.callBack = function() {}		statusRequest.connect();

		// Set up da game
		setUpGame();
	}
	else {
		// Send off status | deny
		var statusRequest = new AjaxRequest("php/game.php", "GET", false, "respond&status=no&user="+name);
		statusRequest.callBack = function() {}		statusRequest.connect();
	}
}

// Send cards to crib
function toCrib() {
	if(selectedCards.length == 2) {
		var card1 = selectedCards[0];
		var card2 = selectedCards[1];

		display.removeCard(card1.getNumericalIdentifier()+"_"+card1.getSuit()+"_"+"off");
		display.removeCard(card2.getNumericalIdentifier()+"_"+card2.getSuit()+"_"+"off");

		card1 = card1.getNumericalIdentifier();
		card2 = card2.getNumericalIdentifier();

		// Send crib
		var statusRequest = new AjaxRequest("php/game.php", "GET", false, "addcrib&card1="+card1+"&card2="+card2);
		statusRequest.callBack = function() {}		statusRequest.connect();

		selectedCards = new Array();

		// Disable button
		document.getElementById("inputToCrib").onclick = function() { return false; };
		document.getElementById("inputToCrib").style.opacity = ".3";
		document.getElementById("inputPlay").style.opacity = "1";
		document.getElementById("inputPlay").setAttribute("onclick", "playCard();");
	}
	else {
		display.showGameMessage("Need two cards selected for the crib.");
	}
}

// Play card
function playCard() {
	if(game.isTurn()) {
		if(selectedCards.length == 1) {
			var card = selectedCards[0];
			if(card.getValue()+game.getCount() <= 31) {
				game.removeCardFromHand(card);
				
				// Show big card
				displayLargeCard(card);

				display.removeCard(card.getNumericalIdentifier()+"_"+card.getSuit()+"_"+"off");

				selectedCards = new Array();

				// Update count
				game.setCount((card.getValue()+game.getCount())-1);
				syncCount();

				// Add to stack
				addStack(card.getNumericalIdentifier()-2);

				// Change turn
				changeTurn();
			}
			else {
				display.showGameMessage("You may not play that card.");
			}
		}
		else {
			display.showGameMessage("Only one card may be played.");
		}
	}
	else {
		display.showGameMessage("It is not your turn.");
	}
}

// Set up game
function setUpGame() {
	// Add yourself to the chat users list
	var ajaxRequest = new AjaxRequest("php/chat.php", "GET", false, "add");
	ajaxRequest.callBack = function() {}
	ajaxRequest.connect();

	// Create game
	game = new Game(game_id, game_chat_id);

	// Find out opponents id
	var opponent_id = (game_user_id < 1) ? 1 : 0;

	// Show game board and setup
	showGame();
}

// Global events
window.onload = init;
window.onbeforeunload = exit;
