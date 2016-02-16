<?php

// Open shared memory
			$key = @ftok("sharedkey", "N");
			$data = @shm_attach($key, 1024000, 0777);

			if(@shm_get_var($data, 0))
				$chat = @shm_get_var($data, 0);
			else
				$chat = array(array(), array("", time()));

print_r($chat);

@shm_detach($data);

?>
