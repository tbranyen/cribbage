<html>
<head>
	<script type="text/javascript" src="../js/class.AjaxRequest.js"></script>

	<script type="text/javascript">
		function init() {
			// Setting the timeout clears out the safari load bar
			setTimeout(function () {var cometRequest = new AjaxRequest("test.php", "POST", true, null);
			cometRequest.callBack = function() {
				var responseText = arguments[0];

				responseText = cometRequest.sanitizeToLastJson(responseText);
				try {
					var json = eval('(' + responseText + ')');
					//window.alert(json.data);
					if (json.users) {							document.body.appendChild(document.createTextNode(json.users));
						document.body.appendChild(document.createElement("br"));
					}
				}
				catch(e) {
					//window.alert(e);
				}
			}
			cometRequest.connectComet();}, 500);
		}

		window.onload = init;
	</script>
</head>

<body>
	<h3>Check for new users from the main lobby chat room.</h3>
</body>

</html>
