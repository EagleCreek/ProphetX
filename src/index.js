﻿
// GLOBAL Variables. 
var requestID = 1;
var sourceDND;
var symbolLimit = 100;


// Generic Error Handler 
function onError(msg) {
    // TODO: Add 'general' error message functionality
}

function search(SearchTextValue) {
    SearchTextValue = $("#searchText").val();
    if (SearchTextValue[0] != "@") {
        SearchTextValue = "@" + $("#searchText").val();
    }
    SearchTextValue += "`##";
    searchDisplay(SearchTextValue);
}

function searchDisplay(SearchTextValue) {

    //WEBSOCKET = new WebSocket('wss://ProphetX14.dtn.com/cs/1.0');
    var CZ17Show = "~";
    var symbols = $('#searchText').val();
    var msg = {
        meta: {
            command: "SymbolSearch",
            requestId: requestID++
        },
        data: {
            //A search for all corn ("@c`##")
            sympat: SearchTextValue,
            limit: 100
        }
    };
    WEBSOCKET.send(JSON.stringify(msg));

    var results = "";
    WEBSOCKET.onmessage = function (event) {

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
}


// This function adds the selected symbol to the in memory list
// TODO: commit to localStorage for retrevial. 
function addQuote(symbol, description) {
	var fullSymbol = symbol;
    var splitSymbol = symbol.split("@");
    symbol = splitSymbol[1];
    var mySymbols = {};
    var uName = $('#uName').text();
    var localUserData = myStorage.getItem(uName);
    if (localUserData !== null) {
        myQuotes = JSON.parse(localUserData);
        if (myQuotes != null) {
            var symbolSaved = false;
            //mySymbols = myQuotes.symbols;
            for (var i = 0; !symbolSaved & i < myQuotes.length; i++) {
                symbolSaved = myQuotes[i].symbol == fullSymbol;
				if(symbolSaved) {
					break;
				}
            }
            if (!symbolSaved) {
                var sym = { symbol: fullSymbol, description: description, requestId: requestID , watch: false };
                myQuotes.push(sym);
                //myQuotes.symbols = sym;
                myStorage.setItem(uName, JSON.stringify(myQuotes));
            }
        }
    }
	else {
		var sym = { symbol: fullSymbol, description: description, requestId: requestID , watch: false };
	myQuotes.push(sym);
        //myQuotes.symbols = sym;
		myStorage.setItem(uName, JSON.stringify(myQuotes));
	}


    //Get the label from description(Split function).
    var splitDescription = description.split(" ");
    var labelOrg = "";
    //Removes # from cotton so it works in the search
    for (var i = 0; i < splitDescription.length; i++) {
        if (splitDescription[i].indexOf('#') != -1) {
            splitDescription.splice(3);
        }
    }

    for (var i = 0; i < splitDescription.length - 2; i++) {
        labelOrg += splitDescription[i];
        labelOrg += " ";
    };
    labelOrg = labelOrg.trim();
    label = labelOrg.replace(/ /g, "_");
    //console.log(label);

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
    panelGroup += '<div class="changeInterval"><input type="text" class="iVal" /><a href="#" class="small">OK</a></div> <div class="symbolData">';
    panelGroup += '<div class="symbolVal" id="last' + symbol + '"> </div>';
    // class="changbox val' + downUp + '"
    panelGroup += '<div id="change' + symbol + '"> </div>';
    panelGroup += '<div><a href="#?id=' + symbol + '" class="linkDelete" onclick="deleteSymbol(' + "'" + symbol + "'" + ')">[X]</a></div>';
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

function dropSymbol(event) {
    event.preventDefault();
    var data = event.dataTransfer.getData("text/plain");
    event.currentTarget.parentElement.insertBefore( $("#" + data)[0], event.currentTarget.nextSibling);
}
function dragSymbol(event) {
    event.dataTransfer.setData("text/plain", event.target.id);
    sourceDND = event.dataTransfer.getData("text/plain");
}

function allowDropSymbol(event) {
    // Don't allow drop on the source
    if (event.currentTarget.id != sourceDND) {
        // Get a reference to the parent of the drop target
        var dropParent = $("#" + event.currentTarget.id).parent()[0].id;
        // Get a reference to the parent of the drag object
        var sourceParent = $("#" + sourceDND).parent()[0].id;
        console.log("Drop = " + dropParent);
        console.log("Source = " + sourceParent);
        // Compare the parents
//        if (sourceParent == dropParent) {
             // If the same then allow the drop
             event.preventDefault();
//        }
    }
    // Else don't allow the drop

}

function getSymbolRequestId(symbol) {
    var requestId = null;
    var uName = $('#uName').text();
    var localUserData = myStorage.getItem(uName);
    myQuotes = JSON.parse(localUserData);
    var symbolFound = false;
    //mySymbols = myQuotes.symbols;
    for (var i = 0; !symbolFound & i < myQuotes.length; i++) {
        var testSym = myQuotes[i].symbol.split("@")[1];
        symbolFound = testSym == symbol;
        if(symbolFound) {
            requestId = myQuotes[i].requestId;
            break;
        }
    }
    return requestId;
}

function getSymbolData(symbol, label) {
    //WEBSOCKET.onopen = onOpen;
    // Update the symbol list with the request ID that is being used
    var uName = $('#uName').text();
    var localUserData = myStorage.getItem(uName);
    myQuotes = JSON.parse(localUserData);
    var symbolFound = false;
    //mySymbols = myQuotes.symbols;
    for (var i = 0; !symbolFound & i < myQuotes.length; i++) {
        var testSym = myQuotes[i].symbol.split("@")[1];
        symbolFound = testSym == symbol;
        if(symbolFound) {
            myQuotes[i].requestId = requestID;
 //           break;
        }
    }
    if (symbolFound) {
        myStorage.setItem(uName, JSON.stringify(myQuotes));
    }

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
    WEBSOCKET.send(JSON.stringify(msg));

    WEBSOCKET.onmessage = function (event) {

        var eventData = event.data;
        var eventDataData = JSON.parse(eventData).data;
		var eventDataMeta = JSON.parse(eventData).meta;
		// Get the request ID from the meta data
		var requestId = eventDataMeta.requestId;
		// Get the saved symbol with the request ID
		// Update the saved symbol setting watch to true
		 var uName = $('#uName').text();
        var localUserData = myStorage.getItem(uName);
        myQuotes = JSON.parse(localUserData);
        var symbolFound = false;
        var sym = "";
        //mySymbols = myQuotes.symbols;
        for (var i = 0; !symbolFound & i < myQuotes.length; i++) {
            symbolFound = myQuotes[i].requestId == requestId;
            if(symbolFound) {
                myQuotes[i].watch = true;
                sym = myQuotes[i].symbol.split("@")[1];
                break;
            }
        }
        if (symbolFound) {
            myStorage.setItem(uName, JSON.stringify(myQuotes));
        }
		console.log(sym);
		// eventDataDate[0].change ? 0 : 1;
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
    };
};

function setValue(fieldId, value) {
    if (typeof value != 'undefined') {
        $(fieldId).html((value == null? 0 : value));
    }
}


function unWatchSymbol(symbol) {
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
				var splitSymbol = myQuotes[i].symbol.split("@");
                symbolFound = (splitSymbol[1] == symbol);
                if (symbolFound) {
                    // Unwatch the symbol
                    unWatchSymbol(myQuotes[i]);
                    // Remove the symbol
                    myQuotes.splice(i, 1);
                    // Save the information
                    myStorage.setItem(uName, JSON.stringify(myQuotes));
                }
            }
        }
    }
	checkSymbolLimit();
}