<?php
	
	if($_GET) {
		$json_in = stripslashes(htmlspecialchars_decode($_GET["json"]));
		echo "Json in: " . $json_in . "<br /><br />";

		$json_in = explode(",", $json_in);
		$json_in = implode(",", $json_in);
		echo "Json iterated: ";
		echo $json_in;
		echo "<br /><br />";
		
	}

	$array = array();
	$array1 = array(1, 2, 3);
	$array2 = array(1, 2, 3,4 );

	if($array1 == $array2) {
		echo "great success";
	}

?>

<html>
<head>
<title>Json examples</title>

<script type="text/javascript" src="../../js/class.Deck.js"></script>
<script type="text/javascript">

	/*function testTwo() {
		var inStuff = new Array(<?=$json_in?>);
		

		window.alert(inStuff[0] + " " + inStuff[inStuff.length-1]);
	}
	
	function testJson() {
		var deck = new Deck(52);
		deck.shuffle();

		window.open("test8.php?json="+deck.getShuffledCards(), "_self");
	}*/


</script>
</head>

<body>

<input type="submit" value="test" onclick="testJson();" />
<input type="button" value="test2" onclick="testTwo();" />
</body>
</html>
