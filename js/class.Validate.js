// class.Validate.js
function Validate() {
	// Public Methods
	this.registration = Validate_registration;
	this.login = Validate_login;

	// Private methods
	this.checkLength = Validate_checkLength;
	this.checkRegex = Validate_checkRegex;
}

// Check field lengths
function Validate_checkLength(_element, _name) {
	if(_element.value.length < 1) {
		spanErrorMessage.appendChild(document.createTextNode("* " + _name + " length"));
		spanErrorMessage.appendChild(document.createElementNS(xhtmlns, "br"));
		
		return false;
	}

	return true;
}

// Check string against regular expression
function Validate_checkRegex(_regex, _string, _msg) {
	if(!_regex.test(_string)) {
		spanErrorMessage.appendChild(document.createTextNode("* " + _msg));
		spanErrorMessage.appendChild(document.createElementNS(xhtmlns, "br"));
		
		return false;
	}
	return true;
}

// Validate registration input
function Validate_registration() {
	display.clearErrors();

	// Inputs
	var username = document.getElementById("inputUsername");
	var password = document.getElementById("inputPassword");
	var email = document.getElementById("inputEmail");
	var securitycode = document.getElementById("inputSecurityCode");
	var errors = 0;

	// Check lengths
	errors += (this.checkLength(username, "Username")) ? 0 : 1;
	errors += (this.checkLength(password, "Password")) ? 0 : 1;
	if(!this.checkLength(email, "Email address")) {
		errors += 1;
	}
	else {
		// Check email address format
		errors += (this.checkRegex(/\w+@\w+\.+\w{2,4}/, email.value, "Invalid email address")) ? 0 : 1;
	}
	errors += (this.checkLength(securitycode, "Security code")) ? 0 : 1;

	// Errors
	if(errors > 0) {
		spanErrorMessage.appendChild(document.createElementNS(xhtmlns, "br"));

		return false;
	}
	
	return true;
}

// Validate login input
function Validate_login() {
	display.clearErrors();

	// Inputs
	var username = document.getElementById("inputUsername");
	var password = document.getElementById("inputPassword");
	var errors = false;

	// Check lengths
	errors = (this.checkLength(username, "Username")) ? false : true;
	errors = (this.checkLength(password, "Password")) ? false : true;

	if(errors) {
		spanErrorMessage.appendChild(document.createElementNS(xhtmlns, "br"));

		return false;
	}
	
	return true;
}
