<?php

	$chat_room = 0;
	$lines = @file("chat.dat");

	$array = array(array("hobolooter", "sponge", "professor"), array("Yo wassap???", time()));
	foreach($lines as $line_num => $line) {
		if($chat_room == $line_num) {
			$lines[$line_num] = serialize($array);
		}
	}

	file_put_contents("chat.dat", $lines);


?>
