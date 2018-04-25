// Create the inital WebSocket
createWebSocket();

// Create a common websocket
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
    // Get a reference to the local storage
	var localUserData = myStorage.getItem(uName);
    if (localUserData !== null) {
        // Get the saved quote list
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

// Add saved quote list to the panel
function quoteWatch() {
	for (var i = 0; i < myQuotes.length; i++) {
		addQuote(myQuotes[i].symbol, myQuotes[i].description);
	}
}

// Handle a quote watch event.
function handleQuoteWatch(event) {
    // Get the data for the event
    var eventData = event.data;
    // Get the meta element in the response
    var eventDataMeta = JSON.parse(eventData).meta;
    // Get the request ID from the meta data
    var requestId = eventDataMeta.requestId;
    // Get the data eleemnt in the response
    var eventDataData = JSON.parse(eventData).data;
    // Get the list of symbols being processed from local storage
    var uName = $('#uName').text();
    var localUserData = myStorage.getItem(uName);
    myQuotes = JSON.parse(localUserData);
    // Assume symbol not found
    var symbolFound = false;
    var sym = "";
    // Process symbols that are in local storage until the correct one is foudn
    for (var i = 0; !symbolFound & i < myQuotes.length; i++) {
        // Symbol is found if it matches the requestId
        symbolFound = myQuotes[i].requestId == requestId;
        if(symbolFound) {
            // Update the saved symbol setting watch to true
            myQuotes[i].watch = true;
            // Parse out the symbol we will use
            sym = myQuotes[i].symbol.split("@")[1];
            break;
        }
    }
    // If the symbol was found and changed then save to local storage
    if (symbolFound) {
        myStorage.setItem(uName, JSON.stringify(myQuotes));
        // Process each field displayed for a symbol
        setValue("#change" + sym, eventDataData[0].Change);
        setValue("#last" + sym, eventDataData[0].Last);
        setValue("#high" + sym, eventDataData[0].High);
        setValue("#volume" + sym, eventDataData[0].Volume);
        setValue("#low" + sym, eventDataData[0].Low);
        setValue("#openInt" + sym, eventDataData[0].OpenInterest);
        setValue("#open" + sym, eventDataData[0].Open);
        setValue("#vlty" + sym, parseFloat(eventDataData[0].Volatility).toFixed(4).toString());
        setValue("#bid" + sym, eventDataData[0].Bid);
        setValue("#bidSize" + sym, eventDataData[0].BidSize);
        setValue("#ask" + sym, eventDataData[0].Ask);
        setValue("#askSize" + sym, eventDataData[0].AskSize);
    }
    //If sym is undefined then remove it
    if (sym == undefined) {
        deleteSymbol();
    } else {

    setValue("#change" + sym, eventDataData[0].Change);
    setValue("#last" + sym, eventDataData[0].Last);
    setValue("#high" + sym, eventDataData[0].High);
    setValue("#volume" + sym, eventDataData[0].Volume);
    setValue("#low" + sym, eventDataData[0].Low);
    setValue("#openInt" + sym, eventDataData[0].OpenInterest);
    setValue("#open" + sym, eventDataData[0].Open);
    setValue("#vlty" + sym, parseFloat(eventDataData[0].Volatility).toFixed(4).toString());
    setValue("#bid" + sym, eventDataData[0].Bid);
    setValue("#bidSize" + sym, eventDataData[0].BidSize);
    setValue("#ask" + sym, eventDataData[0].Ask);
    setValue("#askSize" + sym, eventDataData[0].AskSize);

    // Process the change values
    var change = (eventDataData[0].Change);
    // Only do it if the value is defined.
    if (typeof change != 'undefined') {
        var check = change[0];
        if (check == "-") {
            var downUp = "Dn"
            $('#change' + sym).addClass('changbox val' + downUp);
        } else {
            var downUp = "Up"
            $('#change' + sym).addClass('changbox val' + downUp);
        }
        var change = (eventDataData[0].Change);
        if (typeof change != 'undefined') {
            var check = change[0];
            if (check == "-") {
                var downUp = "Dn"
                $('#change' + sym).addClass('changbox val' + downUp);
            } else {
                var downUp = "Up"
                $('#change' + sym).addClass('changbox val' + downUp);
            }
        }
    }
    }
};

// Set a field value
function setValue(fieldId, value) {
    // Only set if not undefined
    if (typeof value != 'undefined') {
        // If the field is null then use 0, otherwise use the value
        $(fieldId).html((value == null ? 0 : value));
    }
}

// Handle the response from a symbol search
 function handleSymbolSearch(event) {
    // Clear the search results
    var searchResults = $("#searchResults");
    searchResults.html("<tr><th>Symbol</th><th>Description</th><th></th></tr>");
    var eventData = event.data;
    //.replace(/(\r\n\t|\n|\r\t)/gm,"");;
    //console.log(eventData);
    var data = JSON.parse(eventData);
    var status = data.meta.status;

    // Check Status for a 200 success, or not...
    if (status !== 200) {

        var errMsg = "<b>" + data.errors[0].code + "</b> " + data.errors[0].detail;
        $('#searchError').html(errMsg);

    } else {

        $('#searchError').html("");// empty msg if any.
        //var eventDataData = data.data;

        $.each(data.data, function (index, eventDataData) {
            var tableRow = "<tr>";
            tableRow += "<td>" + eventDataData.symbol + "</td>";
            tableRow += "<td>" + eventDataData.description + "</td>";

            tableRow += '<td><button class="btn btn-sm btn-default addBtn" id="symbol1" value="Add" ';
            // TODO: we need to be consistent with our single and double quotes.
            //tableRow += "<td><button class='btn btn-sm btn-default' id='symbol1' value='Add' ";

            tableRow += 'onclick = "addQuote(';
            tableRow += "'" + eventDataData.symbol + "','" + eventDataData.description + "'";
            tableRow += ')">';

            tableRow += '<span class="glyphicon glyphicon-plus"></span></button></td > ';
            tableRow += '</tr>';

            searchResults.append(tableRow);
        });


    }
   checkSymbolLimit();
};