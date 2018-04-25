createWebSocket();

function createWebSocket() {
WEBSOCKET = new WebSocket('wss://ProphetX14.dtn.com/cs/1.0');
WEBSOCKET.onerror = function(evt) {
	window.location.replace("error.htm");
}
WEBSOCKET.onmessage = function(event) {
    // Get the event data
    var data = event.data;
    // Get the command that was sent
    var command = JSON.parse(data).meta.command;
    console.log(command);
    if (command == 'Login') {
        loginSuccessful(event);
    }
    if (command == 'SymbolSearch') {
        handleSymbolSearch(event);
    }
    if (command == 'QuoteWatch') {
        handleQuoteWatch(event);
    }
}
}
var myQuotes = [];
var myStorage = window.localStorage;
//Uncomment to clear out localStorage
//myStorage.clear();

window.addEventListener("load", getLocalData, false);

function getLocalData()
{
    if (myStorage.getItem("username") !== null) {
		$('#username').val(myStorage.getItem("username"));
    }

    if (myStorage.getItem("password") !== null) {
		$('#password').val(myStorage.getItem("password"));
    }

    if (myStorage.getItem("remember") !== null) {
		$('#remember').prop('checked', myStorage.getItem("remember"));
    }
}

function login() {
    var uname = $('#username').val();
    var pwd = $('#password').val();
    var remMe = $('#remember').val();
    //console.log('Sending login message on opened connection');
    var msg = {
        meta: { command: 'Login' },
        data: {
            username: uname,// 'test@eaglecrk.com',
            password: pwd,// 'Dakota',
            appname: 'WSP',
            version: '1.0.0.0',
        }
    };
    WEBSOCKET.send(JSON.stringify(msg));// submit json
   $('#loginError').html(""); // Clear out value
}



function loginSuccessful(evt) {
	$('#contentLeft').show();
	$('#contentCenter').show();

    var msg = JSON.parse(evt.data);

    var cmd = msg.meta.command;
    var status = msg.meta.status;
    var err = msg.errors;

    switch (cmd) {
    case 'Login':
            {
                if (status === 401) {
                    var code = err[0].code;
                    var detail = err[0].detail;
                    var errMsg = "";
                    errMsg += "<b>" + code + " </b> ";
                    errMsg += detail;
                    $('#loginError').html(errMsg);

                    if (WEBSOCKET !== null) {
                        WEBSOCKET.close(1000, "Reconnect");
                        WEBSOCKET = null;
                    }
                     createWebSocket();
                } else {
                     loginLookup(msg);// get myQuoteList from localStorage
                }
            break;
        }
    default:
        {
            break;
        }
    }
}


function loginLookup(msg) {

	if ($('#remember').is(':checked')) {
		myStorage.setItem("username", $('#username').val());
		myStorage.setItem("password", $('#password').val());
		myStorage.setItem("remember", $('#remember').is(':checked'));
	}
	else {
		// reset localStorage
		myStorage.removeItem("username");
		myStorage.removeItem("password");
		myStorage.removeItem("remember");
	}
// This hits the websocket for quote list data to be displayed on left

    var status = msg.meta.status;
    var data = msg.data;

    var infoMsg = data[0].info;
    var id = data[0].whoId; // userId
    var uName = data[0].username;
    $('#uName').html(uName);

    var welcome = "<h5>Welcome, " + infoMsg + "</h5>";
    $('#msgWelcome').html(welcome);
    $('#loginInfo').hide();
    $('#loggedIn').show();// Show the Logged In panel

    var eventData = event.data;
    var eventDataData = JSON.parse(eventData).data;
    $("#version").html("Version: " + eventDataData[0].wspVersion);


    // add to local store



    // ... add here
	var localUserData = myStorage.getItem(uName);
    if (localUserData !== null) {
        myQuotes = JSON.parse(localUserData);
        if (myQuotes != null) {
            quoteWatch();
        }
    }
}

function logout() {
    $('#loginInfo').show();
    $('#loggedIn').hide();
    if (WEBSOCKET !== null) {
        WEBSOCKET.close(1000, "Reconnect");
        WEBSOCKET = null;
    }
    createWebSocket();

    $("#quoteList").empty();
	if (!$('#remember').is(':checked')) {
		$('#username').val('');
		$('#password').val('');
	}
	$('#contentLeft').hide();
	$('#contentCenter').hide();
	$('#searchText').val('');
	$('#searchResults').empty();
}

function quoteWatch() {

	for (var i = 0; i < myQuotes.length; i++) {
		addQuote(myQuotes[i].symbol, myQuotes[i].description);
	}
}