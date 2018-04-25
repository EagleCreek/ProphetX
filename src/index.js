
// GLOBAL Variables. 
var requestID = 1;
var sourceDND;
var symbolLimit = 100;



// Generic Error Handler 
function onError(msg) {
    // TODO: Add 'general' error message functionality
}

function search() {
    var searchTextValue = $("#searchText").val();
    if (searchTextValue[0] !== "@") {
        searchTextValue = "@" + $("#searchText").val();
    }
    searchTextValue += "`##";
    searchDisplay(searchTextValue);
}

function searchDisplay(searchTextValue) {
    var msg = {
        meta: {
            command: "SymbolSearch",
            requestId: requestID++
        },
        data: {
            //A search for all corn ("@c`##")
            sympat: searchTextValue,
            limit: 100
        }
    };
    WEBSOCKET.send(JSON.stringify(msg));
}





// This function adds the selected symbol to the in memory list
// NOTE: myQuotes is a Global Variable
function addQuote(symbol, description) {
	var fullSymbol = symbol;
    var splitSymbol = symbol.split("@");
    symbol = splitSymbol[1];
    
    var uName = $('#uName').text();
    var localUserData = myStorage.getItem(uName);
    if (localUserData !== null) {
        myQuotes = JSON.parse(localUserData);
        if (myQuotes != null) {
            var symbolSaved = false;
            //mySymbols = myQuotes.symbols;
            for (var i = 0; !symbolSaved & i < myQuotes.length; i++) {
                symbolSaved = myQuotes[i].symbol === fullSymbol;
				if(symbolSaved) {
					break;
				}
            }
            if (!symbolSaved) {
                var sym1 = { symbol: fullSymbol, description: description, requestId: requestID , watch: false };
                myQuotes.push(sym1);
                myStorage.setItem(uName, JSON.stringify(myQuotes));
            }
        }
    }
	else {
        var sym2 = { symbol: fullSymbol, description: description, requestId: requestID, watch: false };
        myQuotes.push(sym2);
		myStorage.setItem(uName, JSON.stringify(myQuotes));
	}


    //Get the label from description(Split function).
    var splitDescription = description.split(" ");
    var labelOrg = "";
    //Removes # from cotton so it works in the search
    for (var ii = 0; ii < splitDescription.length; ii++) {
        if (splitDescription[ii].indexOf("#") !== -1) {
            splitDescription.splice(3);
        }
    }

    for (var i1 = 0; i1 < splitDescription.length - 2; i1++) {
        labelOrg += splitDescription[i1];
        labelOrg += " ";
    };
    labelOrg = labelOrg.trim();
    label = labelOrg.replace(/ /g, "_");
	label = label.replace(/\//g, "_");

    //Determine if label is already on page if not add it.
    var sectionLabel = $("#" + label);
    if (!sectionLabel.length) {
        var section = '<section id="' + label + '">';
        section += '<h4>' + labelOrg + '</h4>';
        section += '<div class="panel-group"  id="accordion' + label + '">';
        section += '</div>';
        section += '</section>';
        $("#quoteList").append(section);
    };

    //Panel group

    var symbolData = $("#" + symbol);
    if (!symbolData.length) {
        buildPanelGroup(symbol, label);
        getSymbolData(symbol, label);
    };
	checkSymbolLimit();
}

function checkSymbolLimit() {

	if(myQuotes.length >= symbolLimit) {
		$('.addBtn').prop('disabled', true);
	}
	else {
		$('.addBtn').prop('disabled', false);
	}
}

function buildPanelGroup(symbol, label) {

    var panelGroup = '<div class="panel panel-default"  draggable = "true"   ondrop = "dropSymbol(event)" ondragover = "allowDropSymbol(event)" ondragstart = "dragSymbol(event)" id="' + symbol + '">';
    panelGroup += '<div class="panel-heading">';
    panelGroup += '<h4 class="panel-title">';
    panelGroup += '<a class="accordion-toggle float-left" data-toggle="collapse" data-parent="#accordion" href="#collapse' + symbol + '">';
    panelGroup += symbol + '[10]';
    panelGroup += '</a>';
    panelGroup += '</h4>';
    panelGroup += '<div class="changeInterval"><input type="text" class="iVal" value="1" id="refresh' + symbol + '" /><a href="#" class="small" onclick="setRefreshRate(' + "'" + symbol + "'" + ')" data-toggle="tooltip" data-placement="top" title="Update Interval">OK</a></div> <div class="symbolData">';
    panelGroup += '<div class="symbolVal" id="last' + symbol + '"> </div>';
    panelGroup += '<div id="change' + symbol + '"> </div>';
    panelGroup += '<div><a href="#?id=' + symbol + '" class="linkDelete" onclick="deleteSymbol(' + "'" + symbol + "'" + ')" data-toggle="tooltip" data-placement="top" title="Remove Symbol">[X]</a></div>';
    panelGroup += '</div>';
    panelGroup += '</div>';
    
    panelGroup += '<div id="collapse' + symbol + '" class="panel-collapse collapse">';

    panelGroup += '<div class="panel-body">';
    panelGroup += '<table class="table table-condensed">';
    panelGroup += "<tr>";
    panelGroup += "<td>High</td>";
    panelGroup += '<td class="text-right" id="high' + symbol + '"> </td>';
    panelGroup += "<td>&nbsp;</td>";
    panelGroup += "<td>Volume</td>";
    panelGroup += '<td class="text-right" id="volume' + symbol + '"> </td>';
    panelGroup += "</tr>";

    panelGroup += "<tr>";
    panelGroup += "<td>Low</td>";
    panelGroup += '<td class="text-right" id="low' + symbol + '"> </td>';
    panelGroup += "<td>&nbsp;</td>";
    panelGroup += "<td>OpenInt</td>";
    panelGroup += '<td class="text-right" id="openInt' + symbol + '"> </td>';
    panelGroup += "</tr>";

    panelGroup += "<tr>";
    panelGroup += "<td>Open</td>";
    panelGroup += '<td class="text-right" id="open' + symbol + '"> </td>';
    panelGroup += "<td>&nbsp;</td>";
    panelGroup += "<td>Vlty</td>";
    panelGroup += '<td class="text-right" id="vlty' + symbol + '"> </td>';
    panelGroup += "</tr>";

    panelGroup += "<tr>";
    panelGroup += "<td>Bid</td>";
    panelGroup += '<td class="text-right" id="bid' + symbol + '"> </td>';
    panelGroup += "<td>&nbsp;</td>";
    panelGroup += "<td>Bid Size</td>";
    panelGroup += '<td class="text-right" id="bidSize' + symbol + '"> </td>';
    panelGroup += "</tr>";

    panelGroup += "<tr>";
    panelGroup += "<td>Ask</td>";
    panelGroup += '<td class="text-right" id="ask' + symbol + '"> </td>';
    panelGroup += "<td>&nbsp;</td>";
    panelGroup += "<td>Ask Size</td>";
    panelGroup += '<td class="text-right" id="askSize' + symbol + '"> </td>';
    panelGroup += "</tr>";

    //Build information for the symbol and add it under label.

    panelGroup += '</table>';
    panelGroup += '</div>';
    panelGroup += '</div>';
    panelGroup += '</div>';
    $("#accordion" + label).append(panelGroup);

}

// Drop a symbol
function dropSymbol(event) {
    // Make sure the drop is allowed
    event.preventDefault();
    // Get the ID of the dragged item
    var data = event.dataTransfer.getData("text/plain");
    // Insert the dropped item after the target
    event.currentTarget.parentElement.insertBefore( $("#" + data)[0], event.currentTarget.nextSibling);
}

// Start a drag operation
function dragSymbol(event) {
    // Save the ID of the source for the drag
    event.dataTransfer.setData("text/plain", event.target.id);
    sourceDND = event.dataTransfer.getData("text/plain");
}

// Determine if drop should be allowed
function allowDropSymbol(event) {
    // Don't allow drop on the source
    if (event.currentTarget.id != sourceDND) {
        // Get a reference to the parent of the drop target
        var dropParent = $("#" + event.currentTarget.id).parent()[0].id;
        // Get a reference to the parent of the drag object
        var sourceParent = $("#" + sourceDND).parent()[0].id;
        // Compare the parents
       if (sourceParent == dropParent) {
             // If the same then allow the drop
             event.preventDefault();
        }
    }
}

// Get the saved request ID for a give symbol
function getSymbolRequestId(symbol) {
    // Default to null
    var requestId = null;
    // Get the data from local stoarge
    var uName = $('#uName').text();
    var localUserData = myStorage.getItem(uName);
    myQuotes = JSON.parse(localUserData);
    // Assume symbol not found
    var symbolFound = false;
    // Process the symbols saved in local Storage
    for (var i = 0; !symbolFound & i < myQuotes.length; i++) {
        // Parse the symbol
        var testSym = myQuotes[i].symbol.split("@")[1];
        // Check if parsed symbol matches the input
        symbolFound = testSym == symbol;
        if(symbolFound) {
            // Pull the request ID if symbol matches
            requestId = myQuotes[i].requestId;
            break;
        }
    }
    // Return the request ID
    return requestId;
}

// Start watching the symbol and get the first set of data
function getSymbolData(symbol, label) {
    // Get the data from user storage
    var uName = $('#uName').text();
    var localUserData = myStorage.getItem(uName);
    myQuotes = JSON.parse(localUserData);
    // Assume the symbol is not found
    var symbolFound = false;
    // Process all symbols in the local storage
    for (var i = 0; !symbolFound & i < myQuotes.length; i++) {
        // Parse ouf the symbol
        var testSym = myQuotes[i].symbol.split("@")[1];
        // Compare the parsed symbol with th einput
        symbolFound = testSym == symbol;
        if(symbolFound) {
            // Update the symbol list with the request ID that is being used
            myQuotes[i].requestId = requestID;
        }
    }
    // If the symbol was found
    if (symbolFound) {
        // Save the updated symbol
        myStorage.setItem(uName, JSON.stringify(myQuotes));
        // Build the json for quotewatch
        var msg = {
            meta: {
                command: "QuoteWatch",
                requestId: requestID++,
                updateInterval: 1.0
            },
            data: {
                expression: "@"+symbol,
                fields: ["Last",
                    "Change",
                    "High",
                    "Low",
                    "Open",
                    "Bid",
                    "Ask",
                    "Volume",
                    "OpenInterest",
                    "Volatility",
                    "BidSize",
                    "AskSize",
                ],
                priceFormat: "text",
                timeFormat: "text",
                symbolFormat: "text",
            }
        };
        // Send the request
        WEBSOCKET.send(JSON.stringify(msg));
    }
};


    // Unwatch the specified symbol when watch is no longer needed.
    function unWatchSymbol(symbol) {

        // If the symbol is current watched then we should unwatch it
        if (symbol.watch) {
            var msg = {
                meta: {
                    command: "Unwatch",
                    requestId: symbol.requestId
                }
            };
            WEBSOCKET.send(JSON.stringify(msg));
        }
    }

    function deleteSymbol(symbol) {
        // Delete the symbol
        $("#" + symbol).remove();
        // Get the saved information
        var mySymbols = {};
        var uName = $('#uName').text();
        var localUserData = myStorage.getItem(uName);
        if (localUserData !== null) {
            myQuotes = JSON.parse(localUserData);
            if (myQuotes != null) {
                var symbolFound = false;
                // Find the symbol that is being removed
                for (var i = 0; !symbolFound & i < myQuotes.length; i++) {
                    // Use the symbol after the @ sign
                    var splitSymbol = myQuotes[i].symbol.split("@");
                    symbolFound = (splitSymbol[1] == symbol);
                    if (symbolFound) {
                        // Unwatch the symbol
                        unWatchSymbol(myQuotes[i]);
                        // Remove the symbol from localData
                        myQuotes.splice(i, 1);
                        // Save the information in localDFate
                        myStorage.setItem(uName, JSON.stringify(myQuotes));
                    }
                }
            }
        }
        checkSymbolLimit();
    }

    // Set the refresh rate for the given symbol
function setRefreshRate(symbol) {

    // Get the requestID for the sysmbol
    var requestId = getSymbolRequestId(symbol);
    // Get the refresh interval
    var refreshInterval = $("#refresh" + symbol ).val();
    // Create the ThrottleChange json
     var msg = {
        meta: {
            command: "ThrottleChange",
            requestId: requestId
        },
        data: {
            updateInterval: refreshInterval
        }
    };
    // Send the Throttle Change
    WEBSOCKET.send(JSON.stringify(msg));
};