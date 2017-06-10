<?php
	// Session
	session_start();
	$_SESSION["ip"] = $_SERVER["REMOTE_ADDR"];
	$_SESSION["GameID"] = rand(1000,2000);
	$_SESSION["GameChatID"] = rand(1000,2000);

	// SVG & XML
	header("Content-type: image/svg+xml");
	echo "<?xml version=\"1.0\" encoding=\"utf-8\"?>";
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
        "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	<title>Cribbage</title>
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />

	<!-- Styles -->
	<link rel="stylesheet" href="css/base.css" type="text/css" />
	<link rel="stylesheet" href="css/board.css" type="text/css" />
	<link rel="stylesheet" href="css/chat.css" type="text/css" />
</head>
<body>
	<!-- Background -->
	<div id="background"></div>

	<!-- Svg Container -->
	<div id="container" style="position: relative;">
		<!-- Header -->
		<div style="width: 750px; height: 30px; margin: 0px auto; padding: 10px;">
			<div style="float: left;">
				<img src="img/top-image.gif" alt="Cribbage" border="0" />
			</div>
			<div id="logout" style="float: right; color: white; display: none;">
				<span onclick="logoutUser();" style="cursor:hand; cursor:pointer; text-decoration: underline;">Logout</span>
			</div>
		</div>

		<!-- SVG -->
		<div id="svgContainer" style="width: 750px; height: 350px;">
			<div id="displayContent" style="position: absolute;" />
			<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="100%" height="100%" id="svgDoc" encoding="utf-8">
				<!-- Define card graidents -->
				<defs>
					<linearGradient id="card_bg" x1="50%" y1="0%" x2="0%" y2="100%">
						<stop offset="0%" style="stop-color:rgb(230, 238, 243); stop-opacity:1"/>
						<stop offset="20%" style="stop-color:rgb(255, 255, 255); stop-opacity: 1"/>
						<stop offset="40%" style="stop-color:rgb(255, 255, 255); stop-opacity: 1"/>
						<stop offset="100%" style="stop-color:rgb(230, 238, 243); stop-opacity:1"/>
					</linearGradient>
				</defs>

				<!-- Semi-Transparent background -->
				<rect x="0px" y="0px" width="500%" height="500%" id="rectBackground" />

				<!-- Draw board objects here -->
				<g id="boardContainer" />

				<!-- Display container -->
				<g id="displayContainer" />
			</svg>
		</div>
		<br />

	 	<!-- Chat -->
		<div id="chatWrapper">
			<div id="chatWindow" style="float: left;">
				<div id="chatText" />
			</div>
			<div id="chatUserList" style="float: right;"></div>
			<div id="chatSubmission" style="clear: both;">
				<input type="text" id="msg" size="75" onkeypress="sayToChat(event)" maxlength="75" /> <input type="button" value="Say" onclick="sayToChat(null)" />
			</div>
		</div>

		<!-- Footer -->
		<div style="width: 750px; height: 30px; margin: 0px auto; padding: 10px; color: white; text-align: center;">
			© 2014 Tim Branyen | Dedicated To Ernest Martel (1926-2008).
		</div>

		<!-- Test outputs -->
		<span id="output" style="display:none;">Test</span>
		<br />
		<span id="outputParsed" style="display:none;">Test</span>
	</div>

	<!-- These layers will be used for miscellaneous thingys -->
	<div id="divAboveAll"></div>
	<div id="divTransparency"></div>

	<!-- Client side scripts -->
	<script type="text/javascript" src="js/class.AjaxRequest.js"></script>
	<script type="text/javascript" src="js/class.Animation.js"></script>
	<script type="text/javascript" src="js/class.Board.js"></script>
	<script type="text/javascript" src="js/class.Card.js"></script>
	<script type="text/javascript" src="js/class.Deck.js"></script>
	<script type="text/javascript" src="js/class.Display.js"></script>
	<script type="text/javascript" src="js/class.Game.js"></script>
	<script type="text/javascript" src="js/class.Player.js"></script>
	<script type="text/javascript" src="js/class.User.js"></script>
	<script type="text/javascript" src="js/class.Validate.js"></script>
	<script type="text/javascript" src="js/source.js"></script>
</body>
</html>
