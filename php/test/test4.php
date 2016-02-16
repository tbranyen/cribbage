<?php

	$key = @ftok("sharedkey", "N");
	$data = @shm_attach($key, 2048, 0777);

	if (@shm_get_var($data, 0))
		$chat = @shm_get_var($data, 0);
	else
		$chat = array(array(), "");

	print_r($chat);
?>
