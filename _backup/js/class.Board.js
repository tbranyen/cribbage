// class.Board.js
function Board(_texture) {
	// SVG properties
	this.svgns = "http://www.w3.org/2000/svg";
	this.xlinkns = "http://www.w3.org/1999/xlink";
	this.xhtmlns = "http://www.w3.org/1999/xhtml";
	this.svgDocument = document;
	this.root = document.getElementById("boardContainer");

	// Board properties
	this.texture = _texture;

	// Public methods
	this.generate = Board_generate;
	this.movePlayer = Board_movePlayer;

	// Private methods
	this.createSection = Board_createSection;
	this.displayLinesAndNumbers = Board_displayLinesAndNumbers;
	this.displayStartFinish = Board_displayStartFinish;
}

// Move the given player
function Board_movePlayer(_id, _score) {
	var score = _score-1;
	if(score > 0 && score < 120) {
		document.getElementById("circleStartHole"+_id).setAttribute("class", "circleHole");
		for(var i=0; i<60; i++) {
			document.getElementById("circleHole"+i+"_"+_id).setAttribute("class", "circleHole");
		}

		score = score % 60;
		document.getElementById("circleHole"+score+"_"+_id).setAttribute("class", "circleStartHole");
	}
	else if(score > 120) {
		for(var i=0; i<60; i++) {
			document.getElementById("circleHole"+i+"_"+_id).setAttribute("class", "circleHole");
		}
		document.getElementById("circleFinishHole"+_id).setAttribute("class", "circleStartHole");
	}
}

// Generate the board
function Board_generate() {
	// Set up group to encapsulate board objects
	this.gBoard = this.svgDocument.createElementNS(this.svgns, "g");
	this.gBoard.setAttributeNS(null, "id", "gBoard");
	this.gBoard.setAttribute("width", "100%");
	this.gBoard.setAttribute("height", "100%");
	this.gBoard.setAttribute("transform", "translate(0, 200)");
			
		// Create bottom of board
		var rectBoardBottom = this.svgDocument.createElementNS(this.svgns, "rect");
		rectBoardBottom.setAttributeNS(null, "id", "rectBoardBottom");
		rectBoardBottom.setAttribute("width", "100%");
		rectBoardBottom.setAttribute("height", "210");
		rectBoardBottom.setAttribute("x", "0px");
		rectBoardBottom.setAttribute("y", "0px");
				
		// Create board image
		var imageBoard = this.svgDocument.createElementNS(this.svgns, "image");
		imageBoard.setAttributeNS(this.xlinkns, "xlink:href", this.texture);
		imageBoard.setAttributeNS(null, "width", "750px");
		imageBoard.setAttributeNS(null, "height", "200px");
		imageBoard.setAttribute("x", "0px");
		imageBoard.setAttribute("y", "3px");

		// Create hand image
		var imageHand = this.svgDocument.createElementNS(this.svgns, "image");
		imageHand.setAttributeNS(this.xlinkns, "xlink:href", "img/hand.jpg");
		imageHand.setAttributeNS(null, "width", "514px");
		imageHand.setAttributeNS(null, "height", "140px");
		imageHand.setAttribute("x", "30px");
		imageHand.setAttribute("y", "210px");

		// Append board bottom
		this.gBoard.appendChild(rectBoardBottom);
		
		// Append board image to group
		this.gBoard.appendChild(imageBoard);

		// Append hand image to group
		this.gBoard.appendChild(imageHand);

	// Create sections
	var numOfSections = 12;
	for(var i=0; i<numOfSections; i++)
		this.createSection(i, numOfSections);

	// Display the lines and numbers
	this.displayLinesAndNumbers(numOfSections);

	// Display start/finish stuff
	this.displayStartFinish();

	// Place in svg document
	this.root.appendChild(this.gBoard);
}

// Create a section
function Board_createSection(_num, _numofsections) {
	// Calculate x pos
	var numOfSections = _numofsections;
	var xpos = (_num > (numOfSections/2)-1) ? ((_num-(numOfSections/2))*15)+10 : (_num*15)+10;
	var ypos = (_num > (numOfSections/2)-1) ? 110 : 40;
	var displayNum = (_num*5)+5;

	// Create section group
	var gSection = this.svgDocument.createElementNS(this.svgns, "g");
	gSection.setAttributeNS(null, "id", "gSection"+_num);
	gSection.setAttribute("width", "12.5%");
	gSection.setAttribute("height", "50px");

	// Create the bottom box for the section
	var rectSectionBottom = this.svgDocument.createElementNS(this.svgns, "rect");
	rectSectionBottom.setAttributeNS(null, "id", "rectSectionBottom"+_num);
	rectSectionBottom.setAttribute("class", "rectSectionBottom");
	rectSectionBottom.setAttribute("width", "12.5%");
	rectSectionBottom.setAttribute("height", "50px");
	rectSectionBottom.setAttribute("x", xpos+"%");
	rectSectionBottom.setAttribute("y", ypos+"px");

	// Append bottom to group
	gSection.appendChild(rectSectionBottom);

	// Create 10 holes per section
	for(var i=0; i<10; i++) {
		// Create proper ids for the curve on the right of the board
		var properid = (_num>((numOfSections/2)-1)) ? ((i > 4) ? (((59-(i-5))-(((_num-(numOfSections/2))-1)*5))-5) : (((59-i)-(((_num-(numOfSections/2))-1)*5))-5)) : ((_num > 0) ? ((i > 4) ? (_num*5)+(i-5) : (_num*5)+(i)) : ((i > 4) ? (i-5) : (i)));
		var player = (i > 4) ? 1 : 0;

		// Calculate circle x/y position
		var cxpos = (i > 4) ? (xpos+(2*(i-5))+1.5) : (xpos+2*i)+1.5;
		var cypos = (i > 4) ? (ypos+32)+4 : (ypos+9)+4; 

		var circleHole = this.svgDocument.createElementNS(this.svgns, "circle");
		circleHole.setAttributeNS(null, "id", "circleHole"+properid+"_"+player);
		circleHole.setAttribute("class", "circleHole");
		circleHole.onclick = function() {
			//window.alert(this.id);
		}
		circleHole.setAttribute("r", "5");
		circleHole.setAttribute("cx", cxpos+"%");
		circleHole.setAttribute("cy", cypos+"px");

		// Append holes to group
		gSection.appendChild(circleHole);
	}

	// Append section group to board group
	this.gBoard.appendChild(gSection);
}

// Display lines and numbers
function Board_displayLinesAndNumbers(_numofsections) {
	var numOfSections = _numofsections;
	for(var i=0; i<numOfSections; i++) {
		var displayNum = (i > (numOfSections/2)-1) ? ((i-(numOfSections/2))*-5)+60 : (i*5)+5;

		// Create start and end points for lines			
		var startx = (i > (numOfSections/2)-1) ? 85+(112*(i-(numOfSections/2))) : 85+(112*i);
		var starty = (i > (numOfSections/2)-1) ? 135 : 65;
		var endx = (i > (numOfSections/2)-1) ? 150+(112*(i-(numOfSections/2))) : 150+(112*i);
		var endy = (i > (numOfSections/2)-1) ? 135 : 65;

		var lineSeparator = this.svgDocument.createElementNS(this.svgns, "line");
		lineSeparator.setAttributeNS(null, "id", "lineSeparator"+i);
		lineSeparator.setAttribute("class", "lineSeparator");
		lineSeparator.setAttribute("x1", startx);
		lineSeparator.setAttribute("y1", starty);
		lineSeparator.setAttribute("x2", endx);
		lineSeparator.setAttribute("y2", endy);

		// Create display group just for rotation
		var gDisplay = this.svgDocument.createElementNS(this.svgns, "g");
		gDisplay.setAttribute("width", "10");
		gDisplay.setAttribute("height", "10");
		gDisplay.setAttribute("transform", "translate("+(endx+5)+","+(endy-6)+") rotate(90)");
		
			// Create # display
			var textDisplay = this.svgDocument.createElementNS(this.svgns, "text");
			textDisplay.setAttributeNS(null, "id", "textDisplay"+i);
			textDisplay.setAttribute("class", "textDisplay");
			textDisplay.setAttribute("x", "0");
			textDisplay.setAttribute("y", "0");
			textDisplay.setAttribute("font-size", "15");

				// Add text to display
				textDisplay.appendChild(this.svgDocument.createTextNode(displayNum));

		// Add text display to rotate group
		gDisplay.appendChild(textDisplay);

		// Append display #s to group
		this.gBoard.appendChild(gDisplay);

		// Append lines to group
		this.gBoard.appendChild(lineSeparator);
	}
}

// Display the start/finish text and starting holes
function Board_displayStartFinish() {
	// Create start display group just for rotation
	var gStartTextDisplay = this.svgDocument.createElementNS(this.svgns, "g");
	gStartTextDisplay.setAttribute("width", "10");
	gStartTextDisplay.setAttribute("height", "10");
	gStartTextDisplay.setAttribute("transform", "translate(56,51) rotate(90)");

		// Create start display
		var textDisplay = this.svgDocument.createElementNS(this.svgns, "text");
		textDisplay.setAttribute("class", "textDisplay");
		textDisplay.setAttribute("x", "0");
		textDisplay.setAttribute("y", "0");
		textDisplay.setAttribute("font-size", "15");

			// Add text to display
			textDisplay.appendChild(this.svgDocument.createTextNode("Start"));

		// Add text display to rotate group
		gStartTextDisplay.appendChild(textDisplay);

	this.gBoard.appendChild(gStartTextDisplay);

	// Create finish display group just for rotation
	var gFinishTextDisplay = this.svgDocument.createElementNS(this.svgns, "g");
	gFinishTextDisplay.setAttribute("width", "10");
	gFinishTextDisplay.setAttribute("height", "10");
	gFinishTextDisplay.setAttribute("transform", "translate(56,118) rotate(90)");

		// Create start display
		var textDisplay = this.svgDocument.createElementNS(this.svgns, "text");
		textDisplay.setAttribute("class", "textDisplay");
		textDisplay.setAttribute("x", "0");
		textDisplay.setAttribute("y", "0");
		textDisplay.setAttribute("font-size", "15");

			// Add text to display
			textDisplay.appendChild(this.svgDocument.createTextNode("Finish"));

		// Add text display to rotate group
		gFinishTextDisplay.appendChild(textDisplay);

	this.gBoard.appendChild(gFinishTextDisplay);

	// Create start holes
	var circleStartHole0 = this.svgDocument.createElementNS(this.svgns, "circle");
	circleStartHole0.setAttributeNS(null, "id", "circleStartHole0");	// Player 1
	circleStartHole0.setAttribute("class", "circleStartHole");
	circleStartHole0.setAttribute("r", "5");
	circleStartHole0.setAttribute("cx", "30");
	circleStartHole0.setAttribute("cy", "53");

	// Append first player's start hole
	this.gBoard.appendChild(circleStartHole0);

	var circleStartHole1 = this.svgDocument.createElementNS(this.svgns, "circle");
	circleStartHole1.setAttributeNS(null, "id", "circleStartHole1");	// Player 2
	circleStartHole1.setAttribute("class", "circleStartHole");
	circleStartHole1.setAttribute("r", "5");
	circleStartHole1.setAttribute("cx", "30");
	circleStartHole1.setAttribute("cy", "76");

	// Append second player's start hole
	this.gBoard.appendChild(circleStartHole1);

	// Create finish holes
	var circleFinishHole0 = this.svgDocument.createElementNS(this.svgns, "circle");
	circleFinishHole0.setAttributeNS(null, "id", "circleFinishHole0");	// Player 1
	circleFinishHole0.setAttribute("class", "circleFinishHole");
	circleFinishHole0.setAttribute("r", "5");
	circleFinishHole0.setAttribute("cx", "30");
	circleFinishHole0.setAttribute("cy", "123");

	// Append first player's start hole
	this.gBoard.appendChild(circleFinishHole0);

	var circleFinishHole1 = this.svgDocument.createElementNS(this.svgns, "circle");
	circleFinishHole1.setAttributeNS(null, "id", "circleFinishHole1");	// Player 2
	circleFinishHole1.setAttribute("class", "circleFinishHole");
	circleFinishHole1.setAttribute("r", "5");
	circleFinishHole1.setAttribute("cx", "30");
	circleFinishHole1.setAttribute("cy", "146");

	// Append second player's start hole
	this.gBoard.appendChild(circleFinishHole1);
}
