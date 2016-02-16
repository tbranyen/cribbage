<?php
	// Make sure this shit expires
	header("Cache-Control: no-cache, must-revalidate");
	header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
	
	session_start();

	// Generate random string to use to make it hard for bots
	$random_string = substr(rand(10000, 99999), 0, 5);

	// Set session here with random string value
	$_SESSION["random_string"] = $random_string;

	//Set the image width and height 
	$width = (18*strlen($random_string)); 
	$height = 50;  

	//Create the image resource 
	$image = imagecreate($width, $height);  

	//We are making three colors, white, black and gray 
	$white = ImageColorAllocate($image, 255, 255, 255); 
	$black = ImageColorAllocate($image, 0, 0, 0);
	$red = ImageColorAllocate($image, 200, 0, 0);
	$green = ImageColorAllocate($image, 0, 200, 0);
	$blue = ImageColorAllocate($image, 0, 0, 200);
	$colors = array($red, $green, $blue);
	
	//Make the background white 
	ImageFill($image, 0, 0, $white); 

	//Add randomly generated string in white to the image
	for ($i=0; $i<strlen($random_string); $i++) {
		ImageString($image, 10, (18*$i), (34-rand(0, 17)), substr($random_string, $i, 1), $colors[rand(0, 2)]); 
	}

	//Tell the browser what kind of file is come in 
	header("Content-Type: image/gif"); 

	//Output the newly created image in jpeg format 
	ImageGif($image);

	//Free up resources
	ImageDestroy($image);
?>
