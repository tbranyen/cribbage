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

	// Chat variables
	$chat_room = $_SESSION["ChatRoom"];
	$user_name = $_SESSION["UserName"];

	// Get chat from shared memory
	if(@shm_get_var($data, $chat_room))
		$chat = @shm_get_var($data, $chat_room);
	else
		$chat = array(array(), array("", time()));

	// Add chat user
	if(isset($_GET["add"])) {			
		// Only add if new
		foreach($chat[0] as $user) {
			if($user == $user_name)
				$noset = true;
		}

		// Add new user
		if(!$noset)
			array_push($chat[0], $user_name);

		// Place in memory
		@shm_put_var($data, $chat_room, $chat);
	}

	// Remove a user
	else if(isset($_GET["remove"])) {

		// Only remove if exists
		foreach($chat[0] as $user) {
			if($user == $user_name)
				$noset = true;
		}

		// Remove user
		if($noset)
			$chat[0] = remove_from_array($chat[0], $user_name);

		// Place in memory
		@shm_put_var($data, $chat_room, $chat);

		// If no users, destroy chat
		if(count($chat[0]) < 1) {
			@shm_remove_var($data, $chat_room);
		}
	}

	// Add to chat
	else if(isset($_GET["say"])) {
		$message = $user_name . ":" . $_GET["msg"];

		// Strip out banned words
		$message = cleanMessage($message);

		// Truncate message size
		if(strlen($message) > 255)
			$messsage = substr($message, 0, 255);
		
		// Add new messsage
		$chat[1][0] = $message;
		$chat[1][1] = time();

		// Place in memory
		@shm_put_var($data, $chat_room, $chat);
	}

	// Close memory
	@shm_detach($data);

	// Remove from array
	function remove_from_array($_array, $_value){
		$array = $_array;
		for($i=0; $i<count($array); $i++) {
			if($array[$i] == $_value) {
				if($i == 0)
					array_splice($array, 0, 1);
				else
					array_splice($array, $i, $i);
			}
		}
		return $array;
	}

	// Clean blocked words
	function cleanMessage($_str) {
		$str = $_str;
		
		//$banned_words = 

		return $str;
	}

?>
