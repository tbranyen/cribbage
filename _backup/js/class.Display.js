//class.Display.js
function Display() {
	// SVG properties
	this.svgns = "http://www.w3.org/2000/svg";
	this.xlinkns = "http://www.w3.org/1999/xlink";
	this.xhtmlns = "http://www.w3.org/1999/xhtml";
	this.svgDocument = document;
	this.root = document.getElementById("displayContainer");

	// Private properties
	this.inviteVisible = false;

	// Public methods
	this.buildPage = Display_buildPage;
	this.showIntro = Display_showIntro;
	this.showLogin = Display_showLogin;
	this.showForgotPassword = Display_showForgotPassword;
	this.showRegister = Display_showRegister;
	this.showThankYou = Display_showThankYou;
	this.createChatUser = Display_createChatUser;
	this.removeChatUser = Display_removeChatUser;
	this.showInviteUser = Display_showInviteUser;
	this.hideInviteUser = Display_hideInviteUser;
	this.addChatMessage = Display_addChatMessage;
	this.showCreateGame = Display_showCreateGame;
	this.showGameElements = Display_showGameElements;
	this.showInvite = Display_showInvite;
	this.hideInvite = Display_hideInvite;
	this.showGameMessage = Display_showGameMessage;
	this.removeGameMessage = Display_removeGameMessage;
	this.createCard = Display_createCard;
	this.removeCard = Display_removeCard;
	this.showErrors = Display_showErrors;
	this.clearInformation = Display_clearInformation;
	this.clearErrors = Display_clearErrors;
	this.clearAll = Display_clearAll;
	
	// Private methods
	this.clear = Display_clear;
	this.removeElement = Display_removeElement;
}

// Build basic page
function Display_buildPage() {
	// Clean out root
	this.clear(this.root);

	// Container variable to put crap in
	var displayContent = document.getElementById("displayContent");

	// Create image
	var imageMain = this.svgDocument.createElementNS(this.svgns, "image");
	imageMain.setAttributeNS(this.xlinkns, "xlink:href", "img/main.jpg");
	imageMain.setAttributeNS(null, "width", "300px");
	imageMain.setAttributeNS(null, "height", "225px");
	imageMain.setAttribute("x", "10");
	imageMain.setAttribute("y", "10");

	// Add to group
	this.root.appendChild(imageMain);

	// Create login button
	var buttonLogin = document.createElementNS(this.xhtmlns, "input");
	buttonLogin.setAttribute("id", "buttonLogin");
	buttonLogin.setAttribute("type", "button");
	buttonLogin.setAttribute("value", "Login");
	buttonLogin.setAttribute("class", "button");
	buttonLogin.setAttribute("onclick", "showLogin()");

	// Add to svg container div
	displayContent.appendChild(buttonLogin);

	// Create register button
	var buttonRegister = document.createElementNS(this.xhtmlns, "input");
	buttonRegister.setAttribute("id", "buttonRegister");
	buttonRegister.setAttribute("type", "button");
	buttonRegister.setAttribute("value", "Register");
	buttonRegister.setAttribute("class", "button");
	buttonRegister.setAttribute("onclick", "showRegister()");

	// Add to svg container div
	displayContent.appendChild(buttonRegister);
	
	// Create information background
	var rectInformation = document.createElementNS(this.svgns, "rect");
	rectInformation.setAttribute("id", "rectInformation");
	rectInformation.setAttribute("width", "420px");
	rectInformation.setAttribute("height", "329px");
	rectInformation.setAttribute("x", "320");
	rectInformation.setAttribute("y", "10");
	rectInformation.setAttribute("fill", "#FFFFFF");

	// Add to group
	this.root.appendChild(rectInformation);

	// Create information box
	var divInformation = document.createElementNS(this.xhtmlns, "div");
	divInformation.setAttribute("id", "divInformation");
	divInformation.setAttribute("x", "340");
	divInformation.setAttribute("y", "40");

	// Add to display
	displayContent.appendChild(divInformation);
}

// Describes the game, provides login, etc.
function Display_showIntro() {
	// Get div information
	var divInformation = document.getElementById("divInformation");

	// Add text
	var spanInformationHeader = document.createElementNS(this.xhtmlns, "span");
	spanInformationHeader.setAttribute("class", "spanInformationHeader");
	spanInformationHeader.appendChild(document.createTextNode("the game is cribbage!"));
	// Add to information
	divInformation.appendChild(spanInformationHeader);

	// Show rules/information
	divInformation.appendChild(document.createElementNS(this.xhtmlns, "br"));
	divInformation.appendChild(document.createTextNode("The object of the game is to peg out.  You earn points by making special combinations with your cards that allow you to achieve the maximum hand."));
	divInformation.appendChild(document.createElementNS(this.xhtmlns, "br"));
	divInformation.appendChild(document.createElementNS(this.xhtmlns, "br"));divInformation.appendChild(document.createElementNS(this.xhtmlns, "br"));
	// Dummy text
	divInformation.appendChild(document.createTextNode("Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Duis nulla mauris, pharetra ac, interdum in, tristique iaculis, lacus. Nullam vitae ante sed dui molestie facilisis. Donec tempor, metus id porta pulvinar, leo enim placerat nisi, nec dictum quam diam vitae massa. Fusce id nunc. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Mauris at massa. Curabitur magna diam, dictum quis, molestie sed, commodo aliquam, ligula. Sed consectetuer sapien id urna venenatis iaculis. Duis laoreet odio ut erat. Nulla semper tincidunt eros. Donec dolor. Cras vel massa. Nullam leo. Ut sed mauris vitae est molestie consequat. Quisque eget ante. Phasellus facilisis enim sed purus. In hac habitasse platea dictumst."));
}

// Show login
function Display_showLogin() {
	// Get div information
	var divInformation = document.getElementById("divInformation");

	// Create new header
	var spanInformationHeader = document.createElementNS(this.xhtmlns, "span");
	spanInformationHeader.setAttribute("class", "spanInformationHeader");
	spanInformationHeader.appendChild(document.createTextNode("Please log in with your username and password below."));
	// Add to information
	divInformation.appendChild(spanInformationHeader);

	// Separate from header
	divInformation.appendChild(document.createElementNS(this.xhtmlns, "br"));
	divInformation.appendChild(document.createElementNS(this.xhtmlns, "br"));

	// Error messages
	var spanErrorMessage = document.createElementNS(this.xhtmlns, "span");
	spanErrorMessage.setAttribute("id", "spanErrorMessage");
	spanErrorMessage.setAttribute("class", "spanErrorMessage");
	// Add to information
	divInformation.appendChild(spanErrorMessage);

	// Display username
	divInformation.appendChild(document.createTextNode("username "));
		// Create textbox
		var inputUsername = document.createElementNS(this.xhtmlns, "input");
		inputUsername.setAttribute("id", "inputUsername");
		inputUsername.setAttribute("maxlength", "16");
		inputUsername.setAttribute("type", "text");
		inputUsername.setAttribute("class", "inputLogin");
	// Add to information
	divInformation.appendChild(inputUsername);
	divInformation.appendChild(document.createElementNS(this.xhtmlns, "br"));

	// Display password
	divInformation.appendChild(document.createTextNode("password "));
		// Create textbox
		var inputPassword = document.createElementNS(this.xhtmlns, "input");
		inputPassword.setAttribute("id", "inputPassword");
		inputPassword.setAttribute("type", "password");
		inputPassword.setAttribute("class", "inputLogin");
	// Add to information
	divInformation.appendChild(inputPassword);
	divInformation.appendChild(document.createElementNS(this.xhtmlns, "br"));

	// Display login button
	var inputSubmit = document.createElementNS(this.xhtmlns, "input");
	inputSubmit.setAttribute("id", "inputSubmit");
	inputSubmit.setAttribute("type", "submit");
	inputSubmit.setAttribute("value", "Login");
	inputSubmit.setAttribute("onclick", "loginUser();");
	// Add to information
	divInformation.appendChild(inputSubmit);

	// Display forgot password
	var aForgot = document.createElementNS(this.xhtmlns, "a");
	aForgot.setAttribute("onclick", "showForgotPassword();");
	aForgot.setAttribute("class", "aForgot");
	aForgot.appendChild(document.createTextNode("Forgot your password?"));
	// Add to information
	divInformation.appendChild(aForgot);

	// Add line breaks
	divInformation.appendChild(document.createElementNS(this.xhtmlns, "br"));
	divInformation.appendChild(document.createElementNS(this.xhtmlns, "br"));
	divInformation.appendChild(document.createElementNS(this.xhtmlns, "br"));

	// Display return code
	var aReturn = document.createElementNS(this.xhtmlns, "a");
	aReturn.setAttribute("onclick", "showIntro();");
	aReturn.setAttribute("class", "aReturn");
	aReturn.appendChild(document.createTextNode("return to introduction."));
	// Add to information
	divInformation.appendChild(aReturn);
}

// Show forgot password
function Display_showForgotPassword() {
	// Get div information
	var divInformation = document.getElementById("divInformation");

	// Create new header
	var spanInformationHeader = document.createElementNS(this.xhtmlns, "span");
	spanInformationHeader.setAttribute("class", "spanInformationHeader");
	spanInformationHeader.appendChild(document.createTextNode("Request new password."));
	// Add to information
	divInformation.appendChild(spanInformationHeader);

	// Separate from header
	divInformation.appendChild(document.createElementNS(this.xhtmlns, "br"));
	divInformation.appendChild(document.createElementNS(this.xhtmlns, "br"));

	// Request email
	var spanEmailHeader = document.createElementNS(this.xhtmlns, "span");
	spanEmailHeader.setAttribute("class", "spanRegisterHeader");
	spanEmailHeader.appendChild(document.createTextNode("enter your registered email address "));
	// Add to information
	divInformation.appendChild(spanEmailHeader);
		// Create textbox
		var inputEmail = document.createElementNS(this.xhtmlns, "input");
		inputEmail.setAttribute("id", "inputEmail");
		inputEmail.setAttribute("type", "text");
		inputEmail.setAttribute("size", "30");
		inputEmail.setAttribute("class", "inputRegisterText");
	// Add to information
	divInformation.appendChild(inputEmail);
	divInformation.appendChild(document.createElementNS(this.xhtmlns, "br"));

	// Display request button
	var inputRequest = document.createElementNS(this.xhtmlns, "input");
	inputRequest.setAttribute("id", "inputRequest");
	inputRequest.setAttribute("type", "submit");
	inputRequest.setAttribute("value", "Send New Password");
	inputRequest.setAttribute("onclick", "sendNewPassword();");
	// Add to information
	divInformation.appendChild(inputRequest);

	// Add line breaks
	divInformation.appendChild(document.createElementNS(this.xhtmlns, "br"));
	divInformation.appendChild(document.createElementNS(this.xhtmlns, "br"));

	// Display return code
	var aReturn = document.createElementNS(this.xhtmlns, "a");
	aReturn.setAttribute("onclick", "showIntro();");
	aReturn.setAttribute("class", "aReturn");
	aReturn.appendChild(document.createTextNode("return to introduction."));
	// Add to information
	divInformation.appendChild(aReturn);	
}

// Show register
function Display_showRegister() {
	// Get div information
	var divInformation = document.getElementById("divInformation");

	// Create new header
	var spanInformationHeader = document.createElementNS(this.xhtmlns, "span");
	spanInformationHeader.setAttribute("class", "spanInformationHeader");
	spanInformationHeader.appendChild(document.createTextNode("Register a new account."));
	// Add to information
	divInformation.appendChild(spanInformationHeader);

	// Separate from header
	divInformation.appendChild(document.createElementNS(this.xhtmlns, "br"));
	divInformation.appendChild(document.createElementNS(this.xhtmlns, "br"));

	// Error messages
	var spanErrorMessage = document.createElementNS(this.xhtmlns, "span");
	spanErrorMessage.setAttribute("id", "spanErrorMessage");
	spanErrorMessage.setAttribute("class", "spanErrorMessage");
	// Add to information
	divInformation.appendChild(spanErrorMessage);


	// Request username
	var spanUsernameHeader = document.createElementNS(this.xhtmlns, "span");
	spanUsernameHeader.appendChild(document.createTextNode("choose a username "));
	// Add to information
	divInformation.appendChild(spanUsernameHeader);
		// Create textbox
		var inputUsername = document.createElementNS(this.xhtmlns, "input");
		inputUsername.setAttribute("id", "inputUsername");
		inputUsername.setAttribute("type", "text");
		inputUsername.setAttribute("maxlength", "16");
		inputUsername.setAttribute("class", "inputRegisterText");
	// Add to information
	divInformation.appendChild(inputUsername);
	divInformation.appendChild(document.createElementNS(this.xhtmlns, "br"));

	// Request password
	var spanPasswordHeader = document.createElementNS(this.xhtmlns, "span");
	spanPasswordHeader.appendChild(document.createTextNode("choose a password "));
	// Add to information
	divInformation.appendChild(spanPasswordHeader);
		// Create textbox
		var inputPassword = document.createElementNS(this.xhtmlns, "input");
		inputPassword.setAttribute("id", "inputPassword");
		inputPassword.setAttribute("type", "password");
		inputPassword.setAttribute("style", "margin-left: 7px;");
		inputPassword.setAttribute("class", "inputRegisterText");
	// Add to information
	divInformation.appendChild(inputPassword);
	divInformation.appendChild(document.createElementNS(this.xhtmlns, "br"));

	// Request email
	var spanEmailHeader = document.createElementNS(this.xhtmlns, "span");
	spanEmailHeader.appendChild(document.createTextNode("enter your email "));
	// Add to information
	divInformation.appendChild(spanEmailHeader);
		// Create textbox
		var inputEmail = document.createElementNS(this.xhtmlns, "input");
		inputEmail.setAttribute("id", "inputEmail");
		inputEmail.setAttribute("type", "text");
		inputEmail.setAttribute("style", "margin-left: 21px;");
		inputEmail.setAttribute("class", "inputRegisterText");
	// Add to information
	divInformation.appendChild(inputEmail);
	divInformation.appendChild(document.createElementNS(this.xhtmlns, "br"));
	divInformation.appendChild(document.createElementNS(this.xhtmlns, "br"));

	// Request security code
	var spanSecurityCodeHeader = document.createElementNS(this.xhtmlns, "span");
	spanSecurityCodeHeader.appendChild(document.createTextNode("enter in security code "));
	// Add to information
	divInformation.appendChild(spanSecurityCodeHeader);
	divInformation.appendChild(document.createElementNS(this.xhtmlns, "br"));
	var imgSecurityCode = document.createElementNS(this.xhtmlns, "img");
	imgSecurityCode.setAttribute("id", "imgSecurityCode");
	imgSecurityCode.setAttribute("border", "0");
	imgSecurityCode.setAttribute("src", "php/getImg.php");
	// Add to information	
	divInformation.appendChild(imgSecurityCode);
		// Create textbox
		var inputSecurityCode = document.createElementNS(this.xhtmlns, "input");
		inputSecurityCode.setAttribute("id", "inputSecurityCode");
		inputSecurityCode.setAttribute("type", "text");
		inputSecurityCode.setAttribute("size", "5");
		inputSecurityCode.setAttribute("maxlength", "5");
		inputSecurityCode.setAttribute("style", "text-transform: uppercase;");
		inputSecurityCode.setAttribute("class", "inputRegisterText");
	// Add to information
	divInformation.appendChild(inputSecurityCode);
	divInformation.appendChild(document.createElementNS(this.xhtmlns, "br"));

	// Display register button
	var inputSubmit = document.createElementNS(this.xhtmlns, "input");
	inputSubmit.setAttribute("id", "inputSubmit");
	inputSubmit.setAttribute("type", "submit");
	inputSubmit.setAttribute("value", "Register My Free Account Now");
	inputSubmit.setAttribute("onclick", "registerUser();");
	// Add to information
	divInformation.appendChild(inputSubmit);

	// Add line breaks
	divInformation.appendChild(document.createElementNS(this.xhtmlns, "br"));
	divInformation.appendChild(document.createElementNS(this.xhtmlns, "br"));

	// Display return code
	var aReturn = document.createElementNS(this.xhtmlns, "a");
	aReturn.setAttribute("onclick", "showIntro();");
	aReturn.setAttribute("class", "aReturn");
	aReturn.appendChild(document.createTextNode("return to introduction."));
	// Add to information
	divInformation.appendChild(aReturn);	
}

// Display register thank you
function Display_showThankYou() {
	// Get div information
	var divInformation = document.getElementById("divInformation");

	// Create new header
	var spanInformationHeader = document.createElementNS(this.xhtmlns, "span");
	spanInformationHeader.setAttribute("class", "spanInformationHeader");
	spanInformationHeader.appendChild(document.createTextNode("Thank you for registering."));
	// Add to information
	divInformation.appendChild(spanInformationHeader);

	// Separate from header
	divInformation.appendChild(document.createElementNS(this.xhtmlns, "br"));
	divInformation.appendChild(document.createElementNS(this.xhtmlns, "br"));

	// Display thank you information
	var divThankYouInformation = document.createElementNS(this.xhtmlns, "div");
	divThankYouInformation.style.width = "100%";
	
	divThankYouInformation.appendChild(document.createTextNode("Your account information has been emailed to you.  You are now able to login and enjoy the game of Cribbage!"));
	// Add to information
	divInformation.appendChild(divThankYouInformation);

	// Add line breaks
	divInformation.appendChild(document.createElementNS(this.xhtmlns, "br"));
	divInformation.appendChild(document.createElementNS(this.xhtmlns, "br"));

	// Display return code
	var aReturn = document.createElementNS(this.xhtmlns, "a");
	aReturn.setAttribute("onclick", "showIntro();");
	aReturn.setAttribute("class", "aReturn");
	aReturn.appendChild(document.createTextNode("return to introduction."));
	// Add to information
	divInformation.appendChild(aReturn);	
}

// Add users to the list
function Display_createChatUser(_name, _username) {
	var chatUser = document.createElementNS(xhtmlns, "div");
	chatUser.setAttribute("id", _name);
	chatUser.setAttribute("class", "chatUser");
	chatUser.onmousedown = function () {
		// Don't select yourself
		if(_name != _username) {
			display.showInviteUser(_name);
		}
	}
	chatUser.onselectstart = function() {
		return false;
	};
	chatUser.unselectable = "on";
	chatUser.style.MozUserSelect = "none";
	chatUser.appendChild(document.createTextNode(_name));

	var chatUserList = document.getElementById("chatUserList");
	chatUserList.appendChild(chatUser);
}

// Remove user from the list
function Display_removeChatUser(_id) {
	var chatUser = document.getElementById(_id);
	var chatUserList = document.getElementById("chatUserList");
	chatUserList.removeChild(chatUser);
}

// Display play and to crib buttons, also count section stack and deck
function Display_showGameElements() {
	var displayContent = document.getElementById("displayContent");

	var inputToCrib = document.createElementNS(this.xhtmlns, "input");
	inputToCrib.setAttribute("id", "inputToCrib");
	inputToCrib.setAttribute("type", "button");
	inputToCrib.setAttribute("value", "To Crib");
	inputToCrib.setAttribute("onclick", "toCrib();");

	var inputPlay = document.createElementNS(this.xhtmlns, "input");
	inputPlay.setAttribute("id", "inputPlay");
	inputPlay.setAttribute("type", "button");
	inputPlay.setAttribute("value", "Play card");

	displayContent.appendChild(inputToCrib);
	displayContent.appendChild(inputPlay);

	// Show deck and stack
	this.createCard(null, 490, 10, 120, false);
	this.createCard(null, 620, 10, 120, false);

	// Display count
	var spanCountHeader = document.createElementNS(this.xhtmlns, "span");
	spanCountHeader.setAttribute("id", "spanCountHeader");
	spanCountHeader.appendChild(document.createTextNode("Curent Play Count:"));

	var spanCount = document.createElementNS(this.xhtmlns, "span");
	spanCount.setAttribute("id", "spanCount");
	spanCount.appendChild(document.createTextNode("0"));

	var whosCrib = document.createElementNS(this.xhtmlns, "img");
	whosCrib.setAttribute("id", "whosCrib");
	whosCrib.setAttribute("src", "img/crib.png");

	displayContent.appendChild(whosCrib);
	displayContent.appendChild(spanCountHeader);
	displayContent.appendChild(spanCount);
}

// Show an invitation at the top
function Display_showInviteUser(_name) {
	if(!this.inviteVisible) {
		this.inviteVisible = true;
		var displayContent = document.getElementById("displayContent");
		// Create information box
		var divInviteBox = document.createElementNS(this.xhtmlns, "div");
		divInviteBox.setAttribute("id", "divInviteBox");
		displayContent.appendChild(divInviteBox);
		var divInviteBox = document.getElementById("divInviteBox");

		// Show invitee
		var divInviteUser = document.createElementNS(this.xhtmlns, "div");
		divInviteUser.setAttribute("id", "divInviteUser");
		divInviteUser.appendChild(document.createTextNode(_name));
		divInviteBox.appendChild(divInviteUser);

		// Show invite and cancel buttons
		var inputInvite = document.createElementNS(this.xhtmlns, "input");
		inputInvite.setAttribute("id", "inputInvite");
		inputInvite.setAttribute("class", "inviteButton");
		inputInvite.setAttribute("type", "button");
		inputInvite.setAttribute("value", "Invite This Guy!");
		inputInvite.setAttribute("onclick", "sendInvite('" + _name + "');");
		divInviteBox.appendChild(inputInvite);

		var inputCancel = document.createElementNS(this.xhtmlns, "input");
		inputCancel.setAttribute("id", "inputCancel");
		inputCancel.setAttribute("class", "inviteButton");
		inputCancel.setAttribute("type", "button");
		inputCancel.setAttribute("value", "Cancel...");
		inputCancel.setAttribute("onclick", "display.hideInviteUser();");
		divInviteBox.appendChild(inputCancel);
	}
}

// Hide invite user
function Display_hideInviteUser() {
	if(this.inviteVisible) {
		this.inviteVisible = false;
		var displayContent = document.getElementById("displayContent");
		var divInviteBox = document.getElementById("divInviteBox");
		this.clear(divInviteBox);
		this.removeElement(displayContent, divInviteBox);
	}
}

// Show create game content
function Display_showCreateGame() {
	// Create information background
	var rectInformation = document.createElementNS(this.svgns, "rect");
	rectInformation.setAttribute("id", "rectInformation");
	rectInformation.setAttribute("width", "350px");
	rectInformation.setAttribute("height", "130px");
	rectInformation.setAttribute("opacity", ".5");
	rectInformation.setAttribute("x", "10");
	rectInformation.setAttribute("y", "10");
	rectInformation.setAttribute("fill", "#FFFFFF");
	this.root.appendChild(rectInformation);

	var displayContent = document.getElementById("displayContent");
	// Create information box
	var divInstructions = document.createElementNS(this.xhtmlns, "div");
	divInstructions.setAttribute("id", "divInstructions");
	displayContent.appendChild(divInstructions);
	var divInstructions = document.getElementById("divInstructions");

	// Show text header
	var textCreateUser = document.createElementNS(this.svgns, "text");
	textCreateUser.setAttribute("id", "textCreateUser");
	textCreateUser.setAttribute("x", "25");
	textCreateUser.setAttribute("y", "30");
	textCreateUser.appendChild(document.createTextNode("Create new game:"));
	this.root.appendChild(textCreateUser);

	// Show instructions
	var textInstructions = document.createElementNS(this.xhtmlns, "div");
	textInstructions.setAttribute("id", "textInstructions");
	divInstructions.appendChild(document.createTextNode("To create a new game, click on a user in the chat list.  Invite the user by clicking the appropriate button that appears to the right."));
	divInstructions.appendChild(textInstructions);
}

// Add chat message
function Display_addChatMessage(_msg) {
	var show = _msg.split(":");
	var chatText = document.getElementById("chatText");
		var chatUserText = document.createElementNS(this.xhtmlns, "span");
		chatUserText.setAttribute("class", "chatUserText");
		chatUserText.appendChild(document.createTextNode(show[0]+": "));

		var chatMsgText = document.createElementNS(this.xhtmlns, "span");
		chatMsgText.appendChild(document.createTextNode(show[1]));
	chatText.appendChild(chatUserText);
	chatText.appendChild(chatMsgText);
	chatText.appendChild(document.createElementNS(this.xhtmlns, "br"));

	chatText.scrollTop = chatText.scrollHeight;
}

// Show invite from user
function Display_showInvite(_name) {
	// Create messagebox
	var divMessageBox = document.createElementNS(this.xhtmlns, "div");
	divMessageBox.setAttribute("id", "divMessageBox");
		// Message
		divMessageBox.appendChild(document.createTextNode("Accept Invitation From: " + _name));

	// Add some spacing
	divMessageBox.appendChild(document.createElementNS(this.xhtmlns, "br"));
	divMessageBox.appendChild(document.createElementNS(this.xhtmlns, "br"));

	// Add buttons
	var inputYes = document.createElementNS(this.xhtmlns, "input");
	inputYes.setAttribute("id", "inputYes");
	inputYes.setAttribute("class", "inviteButton");
	inputYes.setAttribute("type", "button");
	inputYes.setAttribute("value", "Yes!");
	inputYes.setAttribute("onclick", "respondToInvite('yes');");
	divMessageBox.appendChild(inputYes);

	var inputNo = document.createElementNS(this.xhtmlns, "input");
	inputNo.setAttribute("id", "inputNo");
	inputNo.setAttribute("class", "inviteButton");
	inputNo.setAttribute("type", "button");
	inputNo.setAttribute("value", "No thanks...");
	inputNo.setAttribute("onclick", "respondToInvite('awww hell naw');");
	divMessageBox.appendChild(inputNo);

	document.getElementById("divAboveAll").appendChild(divMessageBox);

	var messageBoxMove = new Animation("divMessageBox");
	messageBoxMove.onComplete = function() {}
	messageBoxMove.cssAttributeMotion("bottom", 0, "px", .75);
}

// Hide invite from user
function Display_hideInvite() {
	this.clear(document.getElementById("divAboveAll"));
}

// Show a game message
function Display_showGameMessage(_msg) {
	// Clear out previous messages
	this.clear(document.getElementById("divAboveAll"));

	// Show messagebox
	var divMessageBox = document.createElementNS(this.xhtmlns, "div");
	divMessageBox.setAttribute("id", "divMessageBox");
		// Message
		divMessageBox.appendChild(document.createTextNode(_msg));

	document.getElementById("divAboveAll").appendChild(divMessageBox);

	var messageBoxIn = new Animation("divMessageBox");
	messageBoxIn.onComplete = function() {
		var messageBoxOut = new Animation("divMessageBox");
		messageBoxOut.onComplete = function() {
			display.removeGameMessage();
		}
		messageBoxOut.cssAttributeMotion("bottom", -120, "px", 2);
	}
	messageBoxIn.cssAttributeMotion("bottom", 0, "px", .75);
}

// Remove game message
function Display_removeGameMessage() {
	this.clear(document.getElementById("divAboveAll"));
}

// Create card
function Display_createCard(_card, _x, _y, _width, _clickable) {
	// Create card
	displayCard = _card;

	// Scale variables
	var _height = _width*1.4;
	var _fontSize = Math.round(_width*.20);
	var _graphicSize = Math.round(_width*.30);
	var _fontX = Math.round(_width*.12);
	var _fontY = Math.round(_width*.24);

	if(displayCard != null) {
		
		// Create card group to store all card related shit
		var gCard = document.createElementNS(this.svgns, "g");
		gCard.setAttribute("id", displayCard.getNumericalIdentifier()+"_"+displayCard.getSuit());
		gCard.setAttribute("transform", "translate("+_x+","+_y+")");
		gCard.setAttribute("width", _width);
		gCard.setAttribute("height", _height);

			// Create card background
			var rectCardBackground = document.createElementNS(this.svgns, "rect");
			rectCardBackground.setAttribute("x", "0");
			rectCardBackground.setAttribute("y", "0");
			rectCardBackground.setAttribute("width", _width);
			rectCardBackground.setAttribute("height", _height);
			rectCardBackground.setAttribute("rx", "8");
			rectCardBackground.setAttribute("ry", "8");
			rectCardBackground.setAttribute("fill","#303030");

			// Create card foreground
			var rectCardForeground = document.createElementNS(this.svgns, "rect");
			rectCardForeground.setAttribute("x", "2");
			rectCardForeground.setAttribute("y", "2");
			rectCardForeground.setAttribute("width", _width-4);
			rectCardForeground.setAttribute("height", _height-4);
			rectCardForeground.setAttribute("rx", "8");
			rectCardForeground.setAttribute("ry", "8");
			rectCardForeground.setAttribute("fill","url(#card_bg)");

			// Show card identifier
			var textCardIdentifier = document.createElementNS(this.svgns, "text");
			textCardIdentifier.setAttribute("font-weight", "bold");
			textCardIdentifier.setAttribute("font-size", _fontSize);
			if(displayCard.getSuit() == "diamond" || displayCard.getSuit() == "heart")
				textCardIdentifier.setAttribute("fill", "#FF0000");
			else
				textCardIdentifier.setAttribute("fill", "#000000");
			textCardIdentifier.setAttribute("x", _fontX);
			textCardIdentifier.setAttribute("y", _fontY);
			textCardIdentifier.appendChild(document.createTextNode(displayCard.getIdentifier()));

			// Show card suit graphic
			var textCardSuitGraphic = document.createElementNS(this.svgns, "text");
			textCardSuitGraphic.setAttribute("font-weight", "bold");
			textCardSuitGraphic.setAttribute("font-size", _graphicSize);
			if(displayCard.getSuit() == "diamond" || displayCard.getSuit() == "heart")
				textCardSuitGraphic.setAttribute("fill", "#FF0000");
			else
				textCardSuitGraphic.setAttribute("fill", "#000000");
			textCardSuitGraphic.setAttribute("x", _fontX);
			textCardSuitGraphic.setAttribute("y", _fontY*2);

			switch(displayCard.getSuit()) {
				case "heart":
					textCardSuitGraphic.appendChild(document.createTextNode("♥"));
				break;
				case "spade":
					textCardSuitGraphic.appendChild(document.createTextNode("♠"));
				break;
				case "diamond":
					textCardSuitGraphic.appendChild(document.createTextNode("♦"));
				break;
				case "club":
					textCardSuitGraphic.appendChild(document.createTextNode("♣"));
				break;
			}

			// Show card identifier bottom
			var textCardIdentifierBottom = document.createElementNS(this.svgns, "text");
			textCardIdentifierBottom.setAttribute("font-weight", "bold");
			textCardIdentifierBottom.setAttribute("font-size", _fontSize);
			if(displayCard.getSuit() == "diamond" || displayCard.getSuit() == "heart")
				textCardIdentifierBottom.setAttribute("fill", "#FF0000");
			else
				textCardIdentifierBottom.setAttribute("fill", "#000000");
			textCardIdentifierBottom.setAttribute("x", _width-(_fontX*2.3));
			textCardIdentifierBottom.setAttribute("y", _height-(_fontY*.65));
			textCardIdentifierBottom.appendChild(document.createTextNode(displayCard.getIdentifier()));	

			// Show card suit graphic bottom
			var textCardSuitGraphicBottom = document.createElementNS(this.svgns, "text");
			textCardSuitGraphicBottom.setAttribute("font-weight", "bold");
			textCardSuitGraphicBottom.setAttribute("font-size", _graphicSize);
			if(displayCard.getSuit() == "diamond" || displayCard.getSuit() == "heart")
				textCardSuitGraphicBottom.setAttribute("fill", "#FF0000");
			else
				textCardSuitGraphicBottom.setAttribute("fill", "#000000");
			textCardSuitGraphicBottom.setAttribute("x", _width-(_fontX*2.8));
			textCardSuitGraphicBottom.setAttribute("y", _height-((_fontY*.85)*2));

			switch(displayCard.getSuit()) {
				case "heart":
					textCardSuitGraphicBottom.appendChild(document.createTextNode("♥"));
				break;
				case "spade":
					textCardSuitGraphicBottom.appendChild(document.createTextNode("♠"));
				break;
				case "diamond":
					textCardSuitGraphicBottom.appendChild(document.createTextNode("♦"));
				break;
				case "club":
					textCardSuitGraphicBottom.appendChild(document.createTextNode("♣"));
				break;
			}

		// Add mouse down event
		if(_clickable == true) {
			//if(game.getCutCard() == null || game.isTurn() == true) {
				gCard.onclick = function() {
					var display = this.id.split("_");
					var tempCard = new Card(parseInt(display[0]));

					if(this.id.indexOf("off") > -1) {
						for(var i=0; i<selectedCards.length; i++) {
							if((selectedCards[i].getNumericalIdentifier()+1) == tempCard.getNumericalIdentifier())
								selectedCards.splice(i,1);
						}
					
						this.setAttribute("id", tempCard.getNumericalIdentifier()+"_"+tempCard.getSuit()+"_"+"on");
						var transform = this.getAttribute("transform");
						transform = transform.substring(transform.indexOf("(")+1, transform.indexOf(")"));
						var coords = transform.split(", ");

						this.setAttribute("transform", "translate("+coords[0]+", "+(parseInt(coords[1])+20)+")");
					}
					else {
						selectedCards.push(tempCard);
						this.setAttribute("id", tempCard.getNumericalIdentifier()+"_"+tempCard.getSuit()+"_"+"off");
						var transform = this.getAttribute("transform");
						transform = transform.substring(transform.indexOf("(")+1, transform.indexOf(")"));
						var coords = transform.split(", ");

						this.setAttribute("transform", "translate("+coords[0]+", "+(parseInt(coords[1])-20)+")");
					}
				}
			//}
		}

	
		// Put it all together
		gCard.appendChild(rectCardBackground);
		gCard.appendChild(rectCardForeground);
		gCard.appendChild(textCardIdentifier);
		gCard.appendChild(textCardSuitGraphic);
		gCard.appendChild(textCardIdentifierBottom);
		gCard.appendChild(textCardSuitGraphicBottom);
		this.root.appendChild(gCard);
	}
	else {
		var _height = _width*1.4;

		// Create card group to store all card related shit
		var gCard = document.createElementNS(this.svgns, "g");
		gCard.setAttribute("transform", "translate("+_x+","+_y+")");
		gCard.setAttribute("width", _width);
		gCard.setAttribute("height", _height);
			// Create card background
			var rectCardBackground = document.createElementNS(this.svgns, "rect");
			rectCardBackground.setAttribute("x", "0");
			rectCardBackground.setAttribute("y", "0");
			rectCardBackground.setAttribute("width", _width);
			rectCardBackground.setAttribute("height", _height);
			rectCardBackground.setAttribute("rx", "8");
			rectCardBackground.setAttribute("ry", "8");
			rectCardBackground.setAttribute("fill","#303030");

		gCard.appendChild(rectCardBackground);
		this.root.appendChild(gCard);
	}
}

// Remove card
function Display_removeCard(_card) {
	this.removeElement(this.root, document.getElementById(_card));
}

// Show validation errors
function Display_showErrors(_errors) {
	var spanErrorMessage = document.getElementById("spanErrorMessage");
	this.clear(spanErrorMessage);

	spanErrorMessage.innerHTML = _errors;
}

// Clear information box
function Display_clearInformation() {
	var divInformation = document.getElementById("divInformation");
	this.clear(divInformation);
}

// Clear validation errors
function Display_clearErrors() {
	var spanErrorMessage = document.getElementById("spanErrorMessage");
	this.clear(spanErrorMessage);
}

// Remove an element from a parent
function Display_removeElement(_parent, _child) {
	_parent.removeChild(_child);
}

// Easier function for clearing all elements defined in here
function Display_clearAll() {
	// Get display content
	var displayContent = document.getElementById("displayContent");

	// Figure out what needs to be cleared out here
	this.clear(displayContent);

	// Clear svg doc
	this.clear(this.root);
}

// Remove child elements from the display container
function Display_clear(_element) {
	while(_element.hasChildNodes())
		_element.removeChild(_element.firstChild);
}
