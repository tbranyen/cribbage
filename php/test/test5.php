<html>
<head>
	<script type="text/javascript" src="../js/class.AjaxRequest.js"></script>
	<script type="text/javascript">
		function init() {
			ajaxRequest = new AjaxRequest("test.php", "GET", true, null);
			ajaxRequest.callBack = function() {
				document.appendChild(document.createTextNode("here"));
			}
			ajaxRequest.connectComet();
		}

		window.onload = init;

		function killConnection() {
			ajaxRequest.killConnection();
		}
	</script>
</head>

<body>
	<input type="button" onclick="killConnection();" value="kill me" />
</body>
</html>
