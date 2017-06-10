<?php

	// Start events by throwing out some useless garbage text for safari... and opening new object stream
	ob_start();

	// Chat properties
	$GLOBALS["last_user_count"] = 0;
	$GLOBALS["timestamp"] = time();
	$GLOBALS["chat"] = null;	// Chat array

	// Game invite properties
	$GLOBALS["invite"] = null;	// Invite array

	// Game properties need to match game memory backend so we can detect changes
	$GLOBALS["players"] = null;
	$GLOBALS["dealer"] = null;
	$GLOBALS["scores"] = null;
	$GLOBALS["deck"] = null;
	$GLOBALS["crib"] = null;
	$GLOBALS["cut_card"] = null;
	$GLOBALS["turn"] = null;
	$GLOBALS["current_stack"] = null;
	$GLOBALS["game"] = null;	// Game array

	// Generics
	$GLOBALS["username"] = $_GET["username"];
	$GLOBALS["chatroom"] = $_GET["chatroom"];
	$GLOBALS["userid"] = $_GET["userid"];
	$GLOBALS["game_id"] = null;
	$GLOBALS["game_chat_id"] = $_GET["gamechatid"];

	// Infinite event loop - HANDLES ALL EVENTS
	while(true) {
		// Chat events here
		if(strlen($GLOBALS["username"]) > 1) {
			// Open shared memory
			$GLOBALS["key"] = @ftok("sharedkey", "N");
			$GLOBALS["data"] = @shm_attach($GLOBALS["key"], 5242880, 0777);

			if(@shm_get_var($GLOBALS["data"], $GLOBALS["chatroom"]))
				$GLOBALS["chat"] = @shm_get_var($GLOBALS["data"], $GLOBALS["chatroom"]);
			else
				$GLOBALS["chat"] = array(array(), array("", time()));

			checkChatUsers();
			checkChatMessages();

			@shm_detach($GLOBALS["data"]);
		}
		
		// Game invite events here
		if(strlen($GLOBALS["username"]) > 1 && $GLOBALS["game_id"] == null) {
			// Open shared memory
			$GLOBALS["key"] = @ftok("sharedkey", "N");
			$GLOBALS["data"] = @shm_attach($GLOBALS["key"], 5242880, 0777);

			if(@shm_get_var($GLOBALS["data"], 1))
				$GLOBALS["invite"] = @shm_get_var($GLOBALS["data"], 1);
			else
				$GLOBALS["invite"] = array("", "", 0, 0);

			checkGameInvites();
			
			// Collect from memory
			if(@shm_get_var($GLOBALS["data"], 2))
				$GLOBALS["respond"] = @shm_get_var($GLOBALS["data"], 2);
			else
				$GLOBALS["respond"] = array("", 0, "", 0, 0);

			checkGameInviteStatus();

			@shm_detach($GLOBALS["data"]);
		}

		// In game events here
		if($GLOBALS["game_id"] != null) {
			// Open shared memory
			$GLOBALS["key"] = @ftok("sharedkey", "N");
			$GLOBALS["data"] = @shm_attach($GLOBALS["key"], 5242880, 0777);

			// Get current game from memory
			if(@shm_get_var($GLOBALS["data"], $GLOBALS["game_id"]))
				$GLOBALS["game"] = @shm_get_var($GLOBALS["data"], $GLOBALS["game_id"]);
			else
				$GLOBALS["game"] = array(0, array("", ""), 0, array(0, 0), array(0), array(0, 0, 0, 0), 0, 0, 0, array(0), false);

			if($GLOBALS["game"][0] != 0) {
				checkPlayers();
				checkDeck();
				checkDealer();
				checkTurn();
				checkCrib();
				checkCutCard();
				checkScores();
				checkStack();
				checkCount();
				checkGo();
				checkEndPlay();
				checkWinner();
			}

			@shm_detach($GLOBALS["data"]);

			checkEndGame();
		}

    // FIXME This doesn't work
    while (ob_get_level() > 0) {
      flush();
      ob_flush();
      ob_end_flush();
    }

		usleep(20000);
	}

	// This function checks for new users
	function checkChatUsers() {
		if(count($GLOBALS["chat"][0]) != $GLOBALS["last_user_count"]) {
			if(count($GLOBALS["chat"][0]) > $GLOBALS["last_user_count"] || count($GLOBALS["chat"][0]) < $GLOBALS["last_user_count"]) {
				$GLOBALS["last_user_count"] = count($GLOBALS["chat"][0]);
				echo json_encode(array("type"=>"chat", "event"=>"users", "users"=>$GLOBALS["chat"][0]))."<br />";
			}
		}
	}

	// This function checks for new messages
	function checkChatMessages() {
		if(strlen($GLOBALS["chat"][1][0]) > 1) {
			if($GLOBALS["chat"][1][1] != $GLOBALS["timestamp"]) {
				if($GLOBALS["chat"][1][1] > $GLOBALS["timestamp"]) {
					$GLOBALS["timestamp"] = $GLOBALS["chat"][1][1];
					echo json_encode(array("type"=>"chat", "event"=>"message", "msg"=>$GLOBALS["chat"][1][0], "chatroom"=>$GLOBALS["chatroom"]))."<br />";
				}
			}
		}
	}

	// Check for game invites
	function checkGameInvites() {
		if($GLOBALS["invite"][0] == $GLOBALS["username"]) {
			@shm_remove_var($GLOBALS["data"], 1);
			echo json_encode(array("type"=>"game", "event"=>"invite", "from"=>$GLOBALS["invite"][1], "gameid"=>$GLOBALS["invite"][2], "gamechatid"=>$GLOBALS["invite"][3]))."<br />";
		}
	}

	// Check if someone has accepted or rejected an invite
	function checkGameInviteStatus() {
		if($GLOBALS["respond"][0] == $GLOBALS["username"] && $GLOBALS["respond"][1] == 0) {
			@shm_remove_var($GLOBALS["data"], 2);
			echo json_encode(array("type"=>"game", "event"=>"invitestatus", "status"=>"false"))."<br />";
		}
		else if($GLOBALS["respond"][0] == $GLOBALS["username"] && $GLOBALS["respond"][1] == 1 && $GLOBALS["game_id"] != $GLOBALS["respond"][3]) {
			$GLOBALS["last_user_count"] = 0;
			$GLOBALS["timestamp"] = time();
			$GLOBALS["chat"] = null;	// Chat array
			$GLOBALS["chatroom"] = $GLOBALS["respond"][4];
			$GLOBALS["game_id"] = $GLOBALS["respond"][3];

			echo json_encode(array("type"=>"game", "from"=>$GLOBALS["respond"][2], "event"=>"invitestatus", "status"=>"true", "game_id"=>$GLOBALS["respond"][3]))."<br />";
		}
		if($GLOBALS["respond"][2] == $GLOBALS["username"] && $GLOBALS["game_id"] != $GLOBALS["respond"][3]) {
			$GLOBALS["last_user_count"] = 0;
			$GLOBALS["timestamp"] = time();
			$GLOBALS["chat"] = null;	// Chat array
			$GLOBALS["chatroom"] = $GLOBALS["respond"][4];
			$GLOBALS["game_id"] = $GLOBALS["respond"][3];
		}
		else if($GLOBALS["respond"][2] == "") {
			@shm_remove_var($GLOBALS["data"], 2);
		}
	}

	// Check players for changes
	function checkPlayers() {
		if($GLOBALS["players"] != implode(",", $GLOBALS["game"][1])) {
			$GLOBALS["players"] = implode(",", $GLOBALS["game"][1]);
			echo json_encode(array("type"=>"game", "event"=>"playerschanged", "players"=>$GLOBALS["players"]));
		}
	}

	// Check deck for changes
	function checkDeck() {
		if($GLOBALS["deck"] != implode(",", $GLOBALS["game"][4])) {
			$GLOBALS["deck"] = implode(",", $GLOBALS["game"][4]);
			echo json_encode(array("type"=>"game", "event"=>"deckchanged", "deck"=>$GLOBALS["deck"]));
		}
	}

	// Check for dealer changes
	function checkDealer() {
		if($GLOBALS["dealer"] != $GLOBALS["game"][2]) {
			$GLOBALS["dealer"] = $GLOBALS["game"][2];
			echo json_encode(array("type"=>"game", "event"=>"dealerchanged", "dealer"=>$GLOBALS["dealer"]));
		}
	}

	// Check for change in turn
	function checkTurn() {
		if($GLOBALS["turn"] != $GLOBALS["game"][8]) {
			$GLOBALS["turn"] = $GLOBALS["game"][8];
			echo json_encode(array("type"=>"game", "event"=>"turnchanged", "turn"=>$GLOBALS["turn"]));
		}
	}

	// Check crib for changes
	function checkCrib() {
		if($GLOBALS["crib"] != implode(",", $GLOBALS["game"][5])) {
			if(count($GLOBALS["game"][5]) > 3) {
				$GLOBALS["crib"] = implode(",", $GLOBALS["game"][5]);
				echo json_encode(array("type"=>"game", "event"=>"cribfull", "crib"=>$GLOBALS["crib"]));
			}
		}
	}

	// Check for changed cut card
	function checkCutCard() {
		if($GLOBALS["cut_card"] != $GLOBALS["game"][6]) {
			$GLOBALS["cut_card"] = $GLOBALS["game"][6];
			echo json_encode(array("type"=>"game", "event"=>"cutcardchanged", "cutcard"=>$GLOBALS["cut_card"]));
		}
	}

	// Check for changes in scores
	function checkScores() {
		if($GLOBALS["scores"] != implode(",", $GLOBALS["game"][3])) {
			$GLOBALS["scores"] = implode(",", $GLOBALS["game"][3]);
			echo json_encode(array("type"=>"game", "event"=>"scoreschanged", "scores"=>$GLOBALS["scores"]));
		}
	}

	// Check the stack
	function checkStack() {
		if($GLOBALS["stack"] != implode(",", $GLOBALS["game"][9])) {
			$GLOBALS["stack"] = implode(",", $GLOBALS["game"][9]);
			echo json_encode(array("type"=>"game", "event"=>"stackchanged", "stack"=>$GLOBALS["stack"]));
		}
	}

	// Check the count
	function checkCount() {
		if($GLOBALS["count"] != $GLOBALS["game"][7]) {
			$GLOBALS["count"] = $GLOBALS["game"][7];
			echo json_encode(array("type"=>"game", "event"=>"countchanged", "count"=>$GLOBALS["count"]));
		}
	}

	// Check go
	function checkGo() {
		if($GLOBALS["game"][10] != false) {
			if($GLOBALS["game"][1][$GLOBALS["turn"]] != $GLOBALS["username"]) {
				$GLOBALS["game"][10] = false;
				@shm_put_var($GLOBALS["data"], $GLOBALS["game_id"], $GLOBALS["game"]);
				echo json_encode(array("type"=>"game", "event"=>"go"));
			}
		}
	}

	// Check for end of round
	function checkEndPlay() {
		if(count($GLOBALS["game"][9]) > 7) {
			// Reset count and stack
			$GLOBALS["game"][9] = null;
			$GLOBALS["game"][7] = null;

			@shm_put_var($GLOBALS["data"], $GLOBALS["game_id"], $GLOBALS["game"]);
			echo json_encode(array("type"=>"game", "event"=>"endplay"));
		}
	}

	// Check for winner
	function checkWinner() {
		if($GLOBALS["game"][3][0] > 120)
			echo json_encode(array("type"=>"game", "event"=>"winner", "winner"=>$GLOBALS["game"][2][0]));
		else if($GLOBALS["game"][3][1] > 120)
			echo json_encode(array("type"=>"game", "event"=>"winner", "winner"=>$GLOBALS["game"][2][1]));
	}

	// Check for the end of the game
	function checkEndGame() {
		$GLOBALS["key"] = @ftok("sharedkey", "N");
		$GLOBALS["data"] = @shm_attach($GLOBALS["key"], 5242880, 0777);

		// Get current game from memory
		if(@shm_get_var($GLOBALS["data"], 5))
			$GLOBALS["endgame"] = @shm_get_var($GLOBALS["data"], 5);

		if($GLOBALS["game_id"] == $GLOBALS["endgame"])
			echo json_encode(array("type"=>"game", "event"=>"endgame"));

		@shm_remove_var($GLOBALS["data"], 5);
		@shm_detach($GLOBALS["data"]);
	}
?>
