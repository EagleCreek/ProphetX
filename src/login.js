// Set the connection information
var WS_URL = 'wss://ProphetX14.dtn.com/cs/1.0';
var WS_USERNAME = '';
var WS_PASSWORD = '';
var WEBSOCKET = null;

window.addEventListener("load", getLocalData, false);
	
	
function getLocalData()
{
    if (localStorage.username) {
		$('#username').val(localStorage.getItem("username"));
    }
	
    if (localStorage.password) {
		$('#password').val(localStorage.getItem("password"));
    }
	
    if (localStorage.remember) {
        remember.checked = true;
    }
}

function doLogin()
{
	WS_USERNAME = $('#username').val();
	WS_PASSWORD = $('#password').val();

	WEBSOCKET = new WebSocket(WS_URL);
	WEBSOCKET.onopen = onOpen;
	WEBSOCKET.onclose = onClose;
	WEBSOCKET.onmessage = onMessage;
	WEBSOCKET.onerror = onError;
}

function onOpen(evt)
{
	// Send the login message
	console.log('Sending login message on opened connection');
	var msg = {
			meta: {command: 'Login'},
			data: {
			  username: WS_USERNAME,
			  password: WS_PASSWORD,
			  appname: 'testApp',
			  version: '1.0.0.0',
			  }
			};
	WEBSOCKET.send(JSON.stringify(msg));
}

function onMessage(evt)
{
	console.log('Received message: ' + evt.data);

	var msg = JSON.parse(evt.data);
	switch(msg.meta.command)
	{
		case 'Login':
		{
		  onLogin(msg);
		  break;
		}
				
		default:
		{
		  break;
		}
	}
}

function onLogin(msg)
{
	console.log('login status ' + msg.meta.status);
	// Check if the login was successful
	if(msg.meta.status == 200) {
	
		if ($('#remember').is(':checked')) {
			localStorage.setItem("username", WS_USERNAME);
			localStorage.setItem("password", WS_PASSWORD);
			localStorage.setItem("remember", true);
		}
		 else {
            // reset localStorage
			localStorage.removeItem("username");
			localStorage.removeItem("password");
			localStorage.removeItem("remember");
        }
		
		var pathname = window.location.pathname;
		pathname = pathname.replace('login', 'index');
		window.location.replace(pathname);
	}
	else {
		console.log('Login failed');
		/*
		var errors = msg.errors;
		if(errors != null && errors.length > 0) {
			reset(errors[0].detail);
		}
		*/
	}
}

function onClose(evt)
{
	reset('Connection closed with code ' + evt.code + ' and reason: ' + evt.reason);
}

function onError(evt)
{
	reset('Network Error: No Network Connection');
}

function reset(msg)
{
	document.getElementById('messages').innerHTML = '';
	showText(msg);
}

function showText(msg)
{
	document.getElementById('messages').innerHTML = msg;
}


