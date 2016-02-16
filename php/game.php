<?php

	// Include classes
	require_once("class.MySQLDataConn.phpm");
	require_once("class.UserSession.phpm");
	
	// Session start
	session_start();

	// Establish database connectivity
	$dataConn = new MySQLDataConn("localhost", "root", "k00la1d", "cribbage");
	
	// Session manager
	if(isset($_SESSION["UserID"])) {		
		$user_session = new UserSession(session_id(), $_COOKIE["session_password"]);
		if($user_session->assert($dataConn))
			$access = "allowed";
	}

	// Proceed, you are allowed
	//if($access == "allowed" || $_GET["debug"] == "astonished") {

		// Open shared memory
		$key = @ftok("sharedkey", "N");
		$data = @shm_attach($key, 5242880, 0777);

		$user_name = $_SESSION["UserName"];

		// Send invite
		if(isset($_GET["invite"])) {
			// Remove any existing invite
			@shm_remove_var($data, 1);

			$invite = array($_GET["to"], $user_name, $_SESSION["GameID"], $_SESSION["GameChatID"]);
		
			// Place in memory
			@shm_put_var($data, 1, $invite);
		}

		// Respond to invite
		else if(isset($_GET["respond"])) {
			// Remove any existing confirmations
			@shm_remove_var($data, 2);

			if($_GET["status"] == "yes") {
				$_SESSION["GameID"] = $_GET["gameid"];
				$_SESSION["GameChatID"] = $_GET["gamechatid"];
				$_SESSION["ChatRoom"] = $_SESSION["GameChatID"];
				
				// Put in the accept spot
				$respond = array($_GET["user"], 1, $user_name, $_SESSION["GameID"], $_SESSION["GameChatID"]);
			}
			else {
				$respond = array($_GET["user"], 0, $user_name, 0, 0);
			}

			// Place in memory
			@shm_put_var($data, 2, $respond);
		}

		// Change game id and chat id
		else if(isset($_GET["setupgame"])) {
			$_SESSION["GameChatID"] = $_GET["gamechatid"];
			$_SESSION["GameID"] = $_GET["gameid"];
			$_SESSION["ChatRoom"] = $_SESSION["GameChatID"];

			// Get player2
			$player2 = $_GET["player2"];

			// Set new game array| Game ID, [Player 1, Player 2], Dealer, [Score1,Score2], [Deck], Crib, Cut card, Count, Turn, Current stack, Go?
			$game = array($_SESSION["GameID"], array($_SESSION["UserName"], $player2), null, array(), array(), array(), 0, 0, 0, array(), false);

			// Put into memory
			@shm_put_var($data, $_SESSION["GameID"], $game);
		}

		// Set variables
		else if(isset($_GET["setvariables"])) {
			@shm_remove_var($data, 2);
			$_SESSION["GameChatID"] = $_GET["gamechatid"];
			$_SESSION["GameID"] = $_GET["gameid"];
			$_SESSION["ChatRoom"] = $_SESSION["GameChatID"];
		}
	
		// Set game turn 
		else if(isset($_GET["setturn"])) {
			// Get current game from memory
			if(@shm_get_var($data, $_SESSION["GameID"]))
				$game = @shm_get_var($data, $_SESSION["GameID"]);
			else
				$game = array(0, array("", ""), 0, array(0, 0), array(0), array(0, 0, 0, 0), 0, 0, 0, array(0), false);

			// Set turn
			$game[8] = ($game[8]+1) % 2;

			// Set new turn
			@shm_put_var($data, $_SESSION["GameID"], $game);
		}

		// Set count
		else if(isset($_GET["setcount"])) {
			// Get current game from memory
			if(@shm_get_var($data, $_SESSION["GameID"]))
				$game = @shm_get_var($data, $_SESSION["GameID"]);
			else
				$game = array(0, array("", ""), 0, array(0, 0), array(0), array(0, 0, 0, 0), 0, 0, 0, array(0), false);

			// Set new count
			$game[7] = ((int)$_GET["count"]);

			// Set new count
			@shm_put_var($data, $_SESSION["GameID"], $game);
		}

		// Set points
		else if(isset($_GET["setpoints"])) {
			// Get current game from memory
			if(@shm_get_var($data, $_SESSION["GameID"]))
				$game = @shm_get_var($data, $_SESSION["GameID"]);
			else
				$game = array(0, array("", ""), 0, array(0, 0), array(0), array(0, 0, 0, 0), 0, 0, 0, array(0), false);

			// Add points
			if($game[1][0] == $_SESSION["UserName"])
				$game[3][0] = (int)$_GET["points"];
			else if($game[1][1] == $_SESSION["UserName"])
				$game[3][1] = (int)$_GET["points"];

			// Set new points
			@shm_put_var($data, $_SESSION["GameID"], $game);
		}

		// Set deck
		else if(isset($_GET["setdeck"])) {
			// Get current game from memory
			if(@shm_get_var($data, $_SESSION["GameID"]))
				$game = @shm_get_var($data, $_SESSION["GameID"]);
			else
				$game = array(0, array("", ""), 0, array(0, 0), array(0), array(0, 0, 0, 0), 0, 0, 0, array(0), false);

			// Replace deck
			$game[4] = explode(",", $_GET["cards"]);

			// Set new deck
			@shm_put_var($data, $_SESSION["GameID"], $game);
		}

		// Set dealer
		else if(isset($_GET["setdealer"])) {
			// Get current game from memory
			if(@shm_get_var($data, $_SESSION["GameID"]))
				$game = @shm_get_var($data, $_SESSION["GameID"]);
			else
				$game = array(0, array("", ""), 0, array(0, 0), array(0), array(0, 0, 0, 0), 0, 0, 0, array(0), false);

			// Set dealer
			$game[2] = $_GET["dealer"];

			// Set new dealer
			@shm_put_var($data, $_SESSION["GameID"], $game);
		}

		// Add cards to crib
		else if(isset($_GET["addcrib"])) {
			// Get current game from memory
			if(@shm_get_var($data, $_SESSION["GameID"]))
				$game = @shm_get_var($data, $_SESSION["GameID"]);
			else
				$game = array(0, array("", ""), 0, array(0, 0), array(0), array(0, 0, 0, 0), 0, 0, 0, array(0), false);

			// Add cards to crib
			array_push($game[5], $_GET["card1"]);
			array_push($game[5], $_GET["card2"]);

			// Set new dealer
			@shm_put_var($data, $_SESSION["GameID"], $game);
		}

		// Set cut card
		else if(isset($_GET["setcutcard"])) {
			// Get current game from memory
			if(@shm_get_var($data, $_SESSION["GameID"]))
				$game = @shm_get_var($data, $_SESSION["GameID"]);
			else
				$game = array(0, array("", ""), 0, array(0, 0), array(0), array(0, 0, 0, 0), 0, 0, 0, array(0), false);

			// Set dealer
			$game[6] = $_GET["cutcard"];

			// Set new dealer
			@shm_put_var($data, $_SESSION["GameID"], $game);
		}

		// Set the stack
		else if(isset($_GET["setstack"])) {
			// Get current game from memory
			if(@shm_get_var($data, $_SESSION["GameID"]))
				$game = @shm_get_var($data, $_SESSION["GameID"]);
			else
				$game = array(0, array("", ""), 0, array(0, 0), array(0), array(0, 0, 0, 0), 0, 0, 0, array(0), false);

			// Add card to stack
			array_push($game[9], $_GET["card"]);

			// Set new stack
			@shm_put_var($data, $_SESSION["GameID"], $game);
		}

		// Clear the stack
		else if(isset($_GET["clearstack"])) {
			// Get current game from memory
			if(@shm_get_var($data, $_SESSION["GameID"]))
				$game = @shm_get_var($data, $_SESSION["GameID"]);
			else
				$game = array(0, array("", ""), 0, array(0, 0), array(0), array(0, 0, 0, 0), 0, 0, 0, array(0), false);

			// Remove all cards from stack
			$game[9] = array();

			// Set new stack
			@shm_put_var($data, $_SESSION["GameID"], $game);
		}

		// Process go
		else if(isset($_GET["go"])) {
			// Get current game from memory
			if(@shm_get_var($data, $_SESSION["GameID"]))
				$game = @shm_get_var($data, $_SESSION["GameID"]);
			else
				$game = array(0, array("", ""), 0, array(0, 0), array(0), array(0, 0, 0, 0), 0, 0, 0, array(0), false);

			// Set go to true
			$game[10] = true;

			// Change turn too
			$game[8] = ($game[8]+1) % 2;

			// Save to memory
			@shm_put_var($data, $_SESSION["GameID"], $game);
		}

		// End a round
		else if(isset($_GET["endround"])) {
			// Get current game from memory
			if(@shm_get_var($data, $_SESSION["GameID"]))
				$game = @shm_get_var($data, $_SESSION["GameID"]);
			else
				$game = array(0, array("", ""), 0, array(0, 0), array(0), array(0, 0, 0, 0), 0, 0, 0, array(0), false);

			// Set count to defaults
			$game[7] = 0;

			// Save to memory
			@shm_put_var($data, $_SESSION["GameID"], $game);
		}

		else if(isset($_GET["endgame"])) {
			@shm_remove_var($data, 2);
			@shm_put_var($data, 5, $_SESSION["GameID"]);
			@shm_remove_var($data, $_SESSION["GameID"]);
		}

		// Release memory
		@shm_detach($data);
	//}
?>
