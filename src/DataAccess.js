WEBSOCKET = new WebSocket('wss://ProphetX14.dtn.com/cs/1.0');
var myQuotes = [];
var myStorage = window.localStorage;
//myStorage.removeItem("wharrison@eaglecrk.com");
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
   WEBSOCKET.onmessage = loginSuccessful;
}



function loginSuccessful(evt) {
  
    //var result = "Received message: " + evt.data;
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
    
    
    // add to local store

    

    // ... add here
	var localUserData = myStorage.getItem(uName);
    if (localUserData !== null) {
        myQuotes = JSON.parse(localUserData);
        if (myQuotes != null) {
            quoteWatch();
        }
    }
   /* else {
        var userData = [{symbol: '', description: '', requestId: 0, watch: false}];
        myStorage.setItem(uName, JSON.stringify(userData));
        myQuotes = JSON.parse(myStorage.getItem(uName));
    }*/

    //chartSnap();
    //symbolSearch();
    //chartWatch();

}

function logout() {
    $('#loginInfo').show();
    $('#loggedIn').hide();
    if (WEBSOCKET !== null) {
        WEBSOCKET.close(1000, "Reconnect");
        WEBSOCKET = null;
    }
    WEBSOCKET = new WebSocket('wss://ProphetX14.dtn.com/cs/1.0');
    $("#quoteList").empty();
	if (!$('#remember').is(':checked')) {
		$('#username').val('');
		$('#password').val('');
	}
}

function symbolSearch() {
    var request = {
        meta: {
            command: "SymbolSearch",
            requestId: 17
        },
        data: {
            sympat: "@C`##", // replace with value from form
            limit: 15
        }
    }

    WEBSOCKET.send(JSON.stringify(request));

    WEBSOCKET.onmessage = function (result) {

        var data = JSON.parse(result.data);

        var vals = data.data;
        var symValues = "";
        $.each(vals, function (index, i) {
            var accordionHtml = "" + i;
            //symValues += "<tr><td></td><td>" + i.value + "</td><td>&nbsp;</td><td>Volume</td><td>" + i.othervalue + "</td></tr>";
        });

        //var status = data.meta.status;
        //var symbols = data.meta.symbols;
        //var exp = data.meta.expression;
        //var desc = data.meta.expressionDesc;

        //var itemId = exp;
        //var accordion = "accordion" + exp;
        //var valuTable = "table" + exp;

        //var vals = data.data;
        //var symValues = "";
        //$.each(vals, function (index, i) {
        //    var accordionHtml = "";

        //    symValues += "<tr><td>High</td><td>" + i.High + "</td><td>&nbsp;</td><td>Volume</td><td>" + i.Volume + "</td></tr>";
        //    symValues += "<tr><td>Low</td><td>" + i.Low + "</td><td>&nbsp;</td><td>OpenInit</td><td>" + i.OpenInit + "</td></tr>";
        //    symValues += "<tr><td>Open</td><td>" + i.Open + "</td><td>&nbsp;</td><td>Close</td><td>" + i.Close + "</td></tr>";
        //});
    };
    



}

function quoteWatch() {

	for (var i = 0; i < myQuotes.length; i++) {
		addQuote(myQuotes[i].symbol, myQuotes[i].description);
	}

    /*var request = {
        meta: {
            command: "QuoteWatch",
            requestId: 6
        },
        data: {
            expression: "PLACEHOLDER_SYMBOL",
            fields: [
                "Last",
                "CumVolume"
            ],
            priceFormat: "text",
            timeFormat: "text",
            symbolFormat: "text",
            updateInterval: 0.5
        }
    };

    for (var i = 0; i < myQuotes.symbols.length; i++) {
        var item = myQuotes.symbols[i];
		request.meta.requestId = item.requestId;
		request.data.expression = item.symbol;
		//console.log('Sent request ' + request.meta.requestId + ': ' + JSON.stringify(request));
        if (item.symbol != "") {
            WEBSOCKET.send(JSON.stringify(request));
            WEBSOCKET.onmessage = function (event) {
                parseQuotes(event);
            };
        }
	}*/



}

    /*function parseQuotes(result) {
    
        // loop through results and display
		var data = JSON.parse(result.data);

        var vals = data.data;
        var symValues = "";
		var requestId = 'requestId' + data.meta.requestId;
        $.each(vals, function (index, i) {
            var accordionHtml = "" + i;
			//console.log('last = ' + i.Last);
			//console.log('CumVolume = ' + i.CumVolume);
            symValues += "<div id='" + requestId + "'><tr><td>Last: </td><td>" + i.Last + "</td><td>&nbsp;</td><td>Volume: </td><td>" + i.CumVolume + "</td></tr></div>";
			//$('#messages').append(symValues);
			if($('#' + requestId).length == 0) {
				$('#messages').append(symValues);

			}
			else {
				$('#' + requestId).html(symValues);
			}
			console.log(symValues);
        });

    };*/

function quoteSnap() {
    var request = {
        meta: {
            command: "QuoteSnap",
            requestId: 1
        },
        data: {
            expression: "TWTR",
            fields: [
                "Last",
                "CumVolume",
                "LastTicknum"
            ],
            priceFormat: "text",
            timeFormat: "text",
            symbolFormat: "text"
        }
    }
    WEBSOCKET.send(JSON.stringify(request));

    WEBSOCKET.onmessage = function (result) {
        // loop through results and display

    };
}


function chartWatch() {
    var request = {
        meta: {
            command: "ChartWatch",
            requestId: 20
        },
        data: {
            expression: "GOOG",
                limit: 100,
                interval: "MINUTE",
                intervalCount: 10
        }
    }


    WEBSOCKET.send(JSON.stringify(request));

    WEBSOCKET.onmessage = function (result) {
        var data = JSON.parse(result.data);
        var status = data.meta.status;
        var symbols = data.meta.symbols;
        var exp = data.meta.expression;
        var desc = data.meta.expressionDesc;

        var itemId = exp;
        var accordion = "accordion" + exp;
        var valuTable = "table" + exp;

        var vals = data.data;
        var symValues = "";
        $.each(vals, function (index, i) {
            var accordionHtml = "";

            //symValues += "<tr><td>High</td><td>" + i.High + "</td><td>&nbsp;</td><td>Volume</td><td>" + i.Volume + "</td></tr>";
            //symValues += "<tr><td>Low</td><td>" + i.Low + "</td><td>&nbsp;</td><td>OpenInit</td><td>" + i.OpenInit + "</td></tr>";
            //symValues += "<tr><td>Open</td><td>" + i.Open + "</td><td>&nbsp;</td><td>Close</td><td>" + i.Close + "</td></tr>";
        });

    };
    
}


function chartSnap() {

    var request = {
        meta: {
            command: "ChartSnap",
            requestId: 10
        },
        data: {
            expression: "@ES@1",
            limit: 100,
            interval: "MINUTE",
            intervalCount: 5
        }
    };
    WEBSOCKET.send(JSON.stringify(request));

    WEBSOCKET.onmessage = function (result) {
      

    };
    //var data = JSON.parse(evt.data);
    //var status = data.meta.status;
    //var symbols = data.meta.symbols;
    //var exp = data.meta.expression;
    //var desc = data.meta.expressionDesc;

    //var itemId = exp;
    //var accordion = "accordion" + exp;
    //var valuTable = "table" + exp;

    //var vals = data.data;
    //var symValues = "";
    //$.each(vals, function (index, i) {
    //    var accordionHtml = "";

    //    symValues += "<tr><td>High</td><td>" + i.High + "</td><td>&nbsp;</td><td>Volume</td><td>" + i.Volume + "</td></tr>";
    //    symValues += "<tr><td>Low</td><td>" + i.Low + "</td><td>&nbsp;</td><td>OpenInit</td><td>" + i.OpenInit + "</td></tr>";
    //    symValues += "<tr><td>Open</td><td>" + i.Open + "</td><td>&nbsp;</td><td>Close</td><td>" + i.Close + "</td></tr>";
    //});
}



