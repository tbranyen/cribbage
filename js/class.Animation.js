//class.Animation.js
function Animation(_elementname) {
	// Animation properties
	this.elementName = _elementname;

	// Public methods
	this.resize = Animation_resize;
	this.cssAttributeMotion = Animation_cssAttributeMotion;
	this.moveElement = Animation_moveElement;

	// Private methods	
	this.sanitizeUnit = Animation_sanitizeUnit;
	this.sanitizeCss = Animation_sanitizeCss;
	this.getExternalCss = Animation_getExternalCss;

	// Element as object
	this.elementObject = document.getElementById(this.elementName);
}

/* Resize an object in the time given, longer time = slow animation, time is in seconds, interval is in milliseconds and defauts to 50 if omitted */
function Animation_resize(_width, _height, _time, _interval) {
	
	
	// Useful information
	this.elementWidth = this.sanitizeUnit(this.elementObject.style.width, "px");
	this.elementHeight = this.sanitizeUnit(this.elementObject.style.height, "px");
	// Object reference
	var _ref = this;
	// Resize properties
	var width = (_width != null) ? _width : this.elementWidth;
	var height = (_height != null) ? _height : this.elementHeight;
	var interval = (interval > 0) ? _interval : 50;

	// Calculate pixel speed per millisecond
	var widthDiff = (width > this.elementWidth) ? (width-this.elementWidth) : (this.elementWidth-width);
	var heightDiff = (height > this.elementHeight) ? (height-this.elementHeight) : (this.elementHeight-height);
	// Set width pixel speed	
	this.widthPixelSpeed = (widthDiff > 0 ) ? (widthDiff/_time)*(interval/1000) : 0;
	// Set height pixel speed
	this.heightPixelSpeed = (heightDiff > 0 ) ? (heightDiff/_time)*(interval/1000) : 0;

	// Animation logic
	this.loop = setInterval(function() {
		try {
			// These variables let us know when we have achieved the correct width/height
			var sameWidth = false;
			var sameHeight = false;

			// Check for difference in width
			if(width > _ref.elementWidth || width < _ref.elementWidth) {
				if(width > _ref.sanitizeUnit(_ref.elementObject.style.width, "px")) {
					_ref.elementObject.style.width = _ref.sanitizeUnit(_ref.sanitizeUnit(_ref.elementObject.style.width, "px")+_ref.widthPixelSpeed, "px");
					
					// Correct bouncing issues
					if(width <= _ref.sanitizeUnit(_ref.elementObject.style.width, "px"))
						sameWidth = true;
					else
						sameWidth = false;
				}
			
				if(width < _ref.sanitizeUnit(_ref.elementObject.style.width, "px")) {
					_ref.elementObject.style.width = _ref.sanitizeUnit(_ref.sanitizeUnit(_ref.elementObject.style.width, "px")-_ref.widthPixelSpeed, "px");

					// Correct bouncing issues
					if(width >= _ref.sanitizeUnit(_ref.elementObject.style.width))
						sameWidth = true;
					else
						sameWidth = false;
				}
			}
			else {
				sameWidth = true;
			}
			
			// Check for difference in height
			if(height > _ref.elementHeight || height < _ref.elementHeight) {
				if(height > _ref.sanitizeUnit(_ref.elementObject.style.height, "px")) {
					_ref.elementObject.style.height = _ref.sanitizeUnit(_ref.sanitizeUnit(_ref.elementObject.style.height, "px")+_ref.heightPixelSpeed, "px");

					// Correct bouncing issues
					if (height <= _ref.sanitizeUnit(_ref.elementObject.style.height, "px"))
						sameHeight = true;
					else
						sameHeight = false;
				}
			
				if(height < _ref.sanitizeUnit(_ref.elementObject.style.height, "px")) {
					_ref.elementObject.style.height = _ref.sanitizeUnit(_ref.sanitizeUnit(_ref.elementObject.style.height, "px")-_ref.heightPixelSpeed, "px");

					// Correct bouncing issues
					if(height >= _ref.sanitizeUnit(_ref.elementObject.style.height, "px"))
						sameHeight = true;
					else
						sameHeight = false;
				}
			}
			else {
				sameHeight = true;
			}
		} 
		catch(e) {
			// Abort
			window.alert(e);
			clearInterval(_ref.loop);
		}

		// Check if animation should continue running or complete
		if (sameWidth && sameHeight) {
			_ref.elementObject.style.width = _ref.sanitizeUnit(width, "px");
			_ref.elementObject.style.height = _ref.sanitizeUnit(height, "px");
			clearInterval(_ref.loop);
			_ref.onComplete();
		}
	}, interval);
}

/* Change element css attribute value over time */
function Animation_cssAttributeMotion(_elementattribute, _newvalue, _unit, _time, _interval) {
	// Object reference
	var _ref = this;
	// Atribute properties
	var elementAttribute = _elementattribute;
	var newValue = _newvalue;
	var unit = _unit;
	var interval = (interval > 0) ? _interval : 50;

	// Get existing information about element
	var existingValue = eval("this.elementObject.style."+this.sanitizeCss(elementAttribute)) ? this.sanitizeUnit(eval("this.elementObject.style."+this.sanitizeCss(elementAttribute)), unit) : this.sanitizeUnit(this.getExternalCss(elementAttribute), unit);
	
	// Calculate pixel speed per millisecond
	var pixelDiff = (newValue > existingValue) ? (newValue-existingValue) : (existingValue-newValue);
	// Set pixel speed	
	this.pixelSpeed = (pixelDiff > 0 ) ? (pixelDiff/_time)*(interval/1000) : 0;

	// Animation logic
	this.loop = setInterval(function() {		
		try {
			// This variable lets us know when we have achieved the correct value
			var sameValue = false;

			// Check for difference in size
			if(newValue > existingValue || newValue < existingValue) {
				if(newValue > existingValue) {
					eval("_ref.elementObject.style."+_ref.sanitizeCss(elementAttribute)+" = _ref.sanitizeUnit(existingValue+_ref.pixelSpeed, unit);");

					// Correct bouncing issues
					if(newValue <= existingValue)
						sameValue = true;
					else
						sameValue = false;
				}
			
				if(newValue < existingValue) {
					eval("_ref.elementObject.style."+_ref.sanitizeCss(elementAttribute)+" = _ref.sanitizeUnit(existingValue-_ref.pixelSpeed, unit);");

					// Correct bouncing issues
					if(newValue >= existingValue)
						sameValue = true;
					else
						sameValue = false;
				}
			}
			else {
				sameValue = true;
			}

			// Update every iteration
			existingValue = _ref.sanitizeUnit(eval("_ref.elementObject.style."+_ref.sanitizeCss(elementAttribute)), unit);
		} 
		catch (e) {
			// Abort
			window.alert(e);
			clearInterval(_ref.loop);
		}

		// Check if animation should continue running or complete
		if (sameValue) {
			eval("_ref.elementObject.style."+_ref.sanitizeCss(elementAttribute)+" =  _ref.sanitizeUnit(newValue, unit);");
			clearInterval(_ref.loop);
			_ref.onComplete();
		}
	}, interval);

}

// Move element
function Animation_moveElement() {
	this.elementObject.style.opacity = ".5";

	var moveableUser = display.createMoveableUser(this.elementObject.firstChild.nodeValue);
	var _ref = this;

	// Move this element while mouse moves
	document.onmousemove = function(_event) {
		event = _event || window.event;

		mouseX = event.clientX;
		mouseY = event.clientY;
		
		var objHeight = _ref.getExternalCss("height");
		var objWidth = window.getComputedStyle(moveableUser, "").getPropertyValue("width");

		window.status = objWidth;

		moveableUser.style.top = (mouseY-(parseInt(objHeight)/2)) + "px";
		moveableUser.style.left = (mouseX-(parseInt(objWidth)/2)) + "px";
	}

	// Moveable on release
	moveableUser.onmouseup = function() {
		if(checkUserDrop(_ref.elementObject.firstChild.nodeValue, parseInt(moveableUser.style.left), parseInt(moveableUser.style.top), "imagePlayer2")) {
			_ref.elementObject.onmousedown = null;
			_ref.elementObject.style.backgroundColor = "#008800";
			_ref.elementObject.style.color = "#FFFFFF";
		}
		_ref.elementObject.style.opacity = "1";
		display.destroyMoveableUser(_ref.elementObject.firstChild.nodeValue);
		document.onmousemove = null;
	}
}

// Convert from int to px and vice-versa
function Animation_sanitizeUnit(_data, _unit) {
	var data = _data;
	var unit = _unit;

	// If unit is null most likely means we don't need to append a unit
	if(unit != null) {
		if((data+"").indexOf(unit) > -1)
			return parseFloat(data);
		else
			return data+unit;
	}
	else {
		if(typeof data == "string")
			return parseFloat(data);
		else
			return data;
	}
}

// Css-Css to cssCss and vice versa
function Animation_sanitizeCss(_data) {
	if(_data.indexOf("-") > -1)
		return _data.replace(/\-[a-z]/g, function (stuuf) { return stuuf.substring(1).toUpperCase(); });
	else
		return _data.replace(/[A-Z]/g, "-$&").toLowerCase();
}

// Get values from external stylesheet
function Animation_getExternalCss(_property) {
	var property = _property;
	var namespace = this.sanitizeCss(_property);

	if(this.elementObject.currentStyle)
		return this.elementObject.currentStyle.getPropertyValue(property);
	else if(window.getComputedStyle)
		return window.getComputedStyle(this.elementObject, "").getPropertyValue(property);
	else
		return null;
}
