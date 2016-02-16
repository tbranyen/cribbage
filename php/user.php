<?php
	session_start();
	ob_start();

	// Make sure this shit expires
	header("Cache-Control: no-cache, must-revalidate");
	header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");

	// Include classes
	require_once("class.MySQLDataConn.phpm");
	require_once("class.UserSession.phpm");

	// Global
	$dataConn = new MySQLDataConn("localhost", "root", "k00la1d", "cribbage");

	// Register section
	if(isset($_GET["register"])) {
		if($_POST) {
			// This file will register a user
			$username = $_POST["username"];
			$password = hashString($_POST["password"]);
			$email = $_POST["email"];
			$securitycode = $_POST["securitycode"];
			$random_string = ""+$_SESSION["random_string"];

			// Server side validation
			if($random_string == $securitycode) {
				// Add user to database		
				if($dataConn->conn()) {
					if ($dataConn->sql_other("INSERT INTO Users(Username, Password, Email, Enabled, Type) VALUES(\"$username\", \"$password\", \"$email\", 1, \"User\");")) {
						// Send out email
						$headers = "From: noreply@timscribbagegamesite.com";
						mail($email, "Cribbage Game Account Info", "Your username is $username and password is $password.  Yeah that's not really your password, you really think we'd send that out??? If you need to change your password we have an option available called Forgot My Password, use that to obtain a new password.  That will, however, be emailed to you in plain text.", $headers);

						json_out(array("status"=>"success", "errors"=>""));
					}
					else {
						json_out(array("status"=>"failure", "errors"=>"Unable to add to database<br />"));
					}
				}
			}
			else {
				json_out(array("status"=>"failure", "errors"=>"* Security code not valid<br />"));
			}
		}
		else {
			echo "I don't know how you got here.";
		}
	}
	// Login section
	else if(isset($_GET["login"])) {
		if($_POST) {
			// Check for username and password being set
			if(isset($_POST["username"]) && isset($_POST["password"])) {
				$username = $_POST["username"];
				$password = $_POST["password"];
				$hashed_pass = hashString($password);
				$logged_in = false;
				
				// Connect to mysql and check username and passwords
				if($dataConn->conn()) {
					if($dataConn->sql_select("SELECT * FROM Users WHERE Enabled = 1;")) {
						for($i=0; $i<$dataConn->sql_get_rows(); $i++) {
							// Check username
							if($username == $dataConn->sql_get_select($i, "Username")) {
								// Check password
								if($hashed_pass == $dataConn->sql_get_select($i, "Password")) {
									// Get useful information from database
									$type = $dataConn->sql_get_select($i, "Type");
									$user_id = $dataConn->sql_get_select($i, "UserID");
		
									// Clear existing sessions
									$dataConn->sql_other("DELETE FROM Sessions WHERE UserID=".$user_id.";");
	
									// Log in
									$logged_in = true;
								}
								else {
									$logged_in = false;
								}
							}
						}
					}
					if($logged_in != true)
						$logged_in = false;
				}
				else {
					$logged_in = false;
				}
			}
			else {
				json_out(array("status"=>"failure", "errors"=>"* Missing username or password.<br />"));
			}
		}
		else {
			json_out(array("status"=>"failure", "errors"=>"* I don't know how you got here.<br />"));
		}
	
		// Handle login
		if ($logged_in == true) {			
			// Handle session crap
			session_start();
			session_regenerate_id(true);
			$_SESSION["UserID"] = $user_id;
			$_SESSION["UserName"] = $username;
			$_SESSION["ChatRoom"] = 0;
			setcookie("session_password", hashString(session_id()), time()+3600, "/");
			
			// Insert into database
			$dataConn->sql_other("INSERT INTO Sessions (UserID, SessionID, SessionPassword) VALUES (" . $user_id . ", '" . session_id() . "', '" . hashString(session_id()) . "');");

			// Output json
			json_out(array("status"=>"success", "userid"=>$_SESSION["UserID"], "username"=>$_SESSION["UserName"], "gameid"=>$_SESSION["GameID"], "gamechatid"=>$_SESSION["GameChatID"]));
		}
		else {
			json_out(array("status"=>"failure", "errors"=>"* Wrong username or password.<br />"));
		}
	}
	else if(isset($_GET["logout"])) {
		// Regenerate session for next login
		session_regenerate_id();
		
		// Clear existing db sessions
		if($dataConn->conn())
			$dataConn->sql_other("DELETE FROM Sessions WHERE UserID=".$user_id.";");
				
		// Remove cookies
		setcookie("session_password", "", time()-3600);
	}

	// Output as json
	function json_out($_out) {
		echo json_encode($_out);
		ob_end_flush();
		exit();	
	}

	// Hash string
	function hashString($_str) {
		$pass =  $_str;
		$salt = "3.14159265";

		$pass1 = md5($pass);
		$pass2 = md5($pass1 . $salt);

		return $pass2;
	}

?>
