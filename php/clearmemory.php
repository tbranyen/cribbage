<?php

	$key = @ftok("sharedkey", "N");
	$shm_id = shmop_open($key, "w", 0777, 5242880);
	echo shmop_size($shm_id);
	shmop_delete($shm_id);
	shmop_close($shm_id); 

?>
