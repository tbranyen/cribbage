<?php

$key = ftok("sharedkey", "N");
$data = shm_attach($key, 2048, 0777);


if (@shm_get_var($data, 0)) {
	$users = @shm_get_var($data, 0);
} else {
	$users = array();
}

print "<br />";

if ($_POST) {

	if (strlen($_POST["user"]) < 12) {
		array_push($users, $_POST["user"]);
	}

	print "<br />";
	echo get_used_bytes();
	if (get_used_bytes() < 2000)
		shm_put_var($data, 0, $users);
}

function get_used_bytes() {
	$key = ftok("testfile", "N");
	$shm_id = shmop_open($key, "a", 0777, 2048);
	$test = trim(shmop_read($shm_id, 0, 2048));
	
	shmop_close($shm_id);
	return strlen($test);
}

if (isset($_GET["clear"])) {
	$shm_id = shmop_open($key, "w", 0777, 2048);
	$test = trim(shmop_read($shm_id, 0, 2048));
	echo strlen($test);
	shmop_delete($shm_id);
	shmop_close($shm_id); 
}

if (@shm_get_var($data, 0)) {
	$users = @shm_get_var($data, 0);
} else {
	$users = array();
}

shm_detach($data);


/*
if($_POST) {

if (!defined(shm_get_var($data, 1))) {
	$users = @shm_get_var($data, 1);
	echo "here";
	if (sizeof($users) > 1) {
	array_push($users, $_POST["user"]);
	}
	else {
		$users = array($_POST["user"]);
	}
}
else {
	echo "here";
	$users = array($_POST["user"]);
}


shm_put_var($data, 1, $users);
shm_detach($data);
}

*/

?>

<html>
<head>
<title>Add Users</title>
</head>

<body>
<?php

	echo json_encode(array("users"=>$users));

?>
<form method="POST">
	Enter in a name to add to the list: <input name="user" type="text" />
	<br />
	<br />
	<input type="submit" value="Add to list" />
</form>

</body>
</html>
