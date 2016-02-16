/*
Class: Ajax connectivity
*/

// Default constructor
function AjaxRequest(_action, _method, _async, _params) {
	// Properties	
	this.action = _action;
	this.method = _method;
	this.async = _async;
	this.params = _params;
}

AjaxRequest.prototype = {
  // Connect method
  connect: function() {
    try {
      var _ref = this;
      this.request = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("MSXML2.XMLHTTP.3.0");

      // Determine where get/post parameters go
      if(this.method == "GET" && this.params != null)
        this.request.open(this.method, this.action+"?"+encodeURI(this.params), this.async);
      else
        this.request.open(this.method, this.action, true);

      // Set content header for json
      this.request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

      // Waiting for connect and set callback function
      this.request.onreadystatechange = function() {
        if(_ref.request.readyState == 4) {
          if(_ref.request.status == 200)
            _ref.callBack(_ref.request.responseText);
        }
      }

      // Send the request differently if there is POST data
      if(this.method == "POST" && this.params != null)
        this.request.send(this.params);
      else
        this.request.send(null);
      
      return true;
    } 
    catch (e) {
      window.alert(e);
      return false;
    }
  },

  // Comet data
  connectComet: function() {
    try {
      var _ref = this;
      this.request = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("MSXML2.XMLHTTP.3.0");
      
      // Determine where get/post parameters go
      if(this.method == "GET" && this.params != null)
        this.request.open(this.method, this.action+"?"+encodeURI(this.params), this.async);
      else
        this.request.open(this.method, this.action, true);

      // Set content header for json
      this.request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

      // Waiting for connect and set callback function
      this.request.onreadystatechange = function() {
        if(_ref.request.readyState == 3) {
          if (_ref.request.status == 200)
            _ref.callBack(_ref.request.responseText);
        }

        if(_ref.request.readyState == 4) {
          if (_ref.request.status == 200)
            _ref.callBack(_ref.request.responseText);
        }
      }

      // Send the request differently if there is POST data
      if(this.method == "POST" && this.params != null)
        this.request.send(this.params);
      else
        this.request.send(null);
      
      return true;
    } 
    catch (e) {
      return false;
    }
  },

  // This will sanitize a string to the last json message (useful for comet)
  sanitizeToLastJson: function(_string) {
    var string = _string;

    var lastIndexOfRightCurly = string.lastIndexOf("}");
    var lastIndexOfLeftCurly = string.lastIndexOf("{");

    return string.substring(lastIndexOfLeftCurly, lastIndexOfRightCurly+1);
  },

  // Cancel ajax request
  cancelRequest: function() {
    this.request.abort();
  }
};
