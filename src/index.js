
//WEBSOCKET = new WebSocket('wss://ProphetX14.dtn.com/cs/1.0');
//WEBSOCKET.onopen = onOpen;
//WEBSOCKET.onclose = onClose;
//WEBSOCKET.onmessage = onMessage;
//WEBSOCKET.onerror = onError;
var requestID = 1;

//function onOpen(evt) {
//    //alert('Sending login message on opened connection');
//    // Send the login message
//    console.log('Sending login message on opened connection');
//    var msg = {
//        meta: { command: 'Login' },
//        data: {
//            username: 'test@eaglecrk.com',
//            password: 'Dakota',
//            appname: 'testApp',
//            version: '1.0.0.0',
//        }
//    };
//    WEBSOCKET.send(JSON.stringify(msg));
//}

//function onMessage(evt) {
//    var htmlOutput = "~";
//    console.log('Received message: ' + evt.data);
//    var msg = JSON.parse(evt.data);
//    switch (msg.meta.command) {
//    case 'Login':
//        {
//                onLogin(msg);
                
//                $.each(msg, function (index, i) {
//                    if (index == 'data') {
//                        $.each(msg.data, function (indexSecond, i) {
//                            $('#header').html("Welcome, " + i.username);
//                        });
//                    }
//                    htmlOutput += i.command + " ";
//                    htmlOutput += i.status + " ";
//                });
//                $('#dvDemo').html(htmlOutput);
//            break;
//        }

//    default:
//        {
//            break;
//        }
//    }
//}

//function onLogin(msg) {
//    // Check if the login was successful
//    if (msg.meta.status == 200) {
//        console.log('Login successful');
//        var request = {
//            meta: {
//                command: 'QuoteWatch',
//                requestId: 1,
//            },
//            data: {
//                expression: 'MSFT',
//                fields: ['Last', 'Open', 'High', 'Low', 'Close', 'Settlement', 'TradeDateTime'],
//                updateInterval: 0.5
//            }
//        };

//        // Send one request for each test symbol
//        //for (var i = 0; i < SYMBOLS.length; i++) {
//        //    request.meta.requestId += 1;
//        //    request.data.expression = SYMBOLS[i];
//        //    console.log('Sent request ' + request.meta.requestId + ': ' + JSON.stringify(request));
//        //    WEBSOCKET.send(JSON.stringify(request))
//        //}
//    }
//    else {
//        console.log('Login failed');
//    }
//}


function onError(msg) {
    
}


function search() {

    //WEBSOCKET.onopen = onOpen;
    var CZ17Show = "~";
    var symbols = $('#searchText').val();
    var msg = {
        meta: {
            command: "SymbolSearch",
            requestId: requestID++
        },
        data: {
            //A search for all corn ("@c`##")
            sympat: $("#searchText").val(),
            limit: 10
        }
    };
    WEBSOCKET.send(JSON.stringify(msg));

    var results = "";
    WEBSOCKET.onmessage = function (event) {

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

            var searchResults = $("#searchResults");
            searchResults.html("<tr><th>Symbol</th><th>Description</th><th></th></tr>");
            $.each(data.data, function (index, eventDataData) {
                var tableRow = "<tr>";
                tableRow += "<td>" + eventDataData.symbol + "</td>";
                tableRow += "<td>" + eventDataData.description + "</td>";

                tableRow += '<td><button class="btn btn-sm btn-default" id="symbol1" value="Add" ';
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
       
    };
}


// This function adds the selected symbol to the in memory list
// TODO: commit to localStorage for retrevial. 
function addQuote(symbol, description) {
    var mySymbols = {};
    var uName = $('#uName').text();
    var localUserData = myStorage.getItem(uName);
    if (localUserData !== null) {
        myQuotes = JSON.parse(localUserData);
        if (myQuotes != null) {
            //mySymbols = myQuotes.symbols;
            var sym = [{ symbol: symbol , requestId: 1 }];
        }
    }


    //Get the label from description(Split function).
    var splitDescription = description.split(" ");
    var label = "";
    for (var i = 0; i < splitDescription.length - 2; i++) {
        label += splitDescription[i];
        label += " ";
    };
    label = label.trim();
    //console.log(label);

    //Determine if label is already on page if not add it.
    var sectionLabel = $("#" + label);
    if (!sectionLabel.length) {
        var section = '<section id="' + label + '">';
        section += '<h4>' + label + '</h4>';
        section += '<div class="panel-group" id="accordion' + label + '">';
        section += '</div>';
        section += '</section>'; 
        $("#quoteList").append(section);
    };

    //Panel group
    var splitSymbol = symbol.split("@");
    symbol = splitSymbol[1];

    var symbolData = $("#" + symbol);
    if (!symbolData.length) {
        buildPanelGroup(symbol, label);
        getSymbolData(symbol, label);
    };
}

function buildPanelGroup(symbol, label) {
    var panelGroup = '<div class="panel panel-default" id="' + symbol + '">';
    panelGroup += '<div class="panel-heading">';
    panelGroup += '<h4 class="panel-title">';
    panelGroup += '<a class="accordion-toggle float-left" data-toggle="collapse" data-parent="#accordion" href="#collapse' + symbol + '">';
    panelGroup += symbol + '[10]';
    panelGroup += '</a>';
    panelGroup += '</h4>';
    panelGroup += '<div class="symbolData">';
    panelGroup += '<div class="symbolVal"> </div>';
    //panelGroup += '<div class="changbox val' + downUp + '""> </div>';
    panelGroup += '<div><a href="#?id=' + symbol + '">[delete]</a></div>';
    panelGroup += '</div>';
    panelGroup += '</div>';
    panelGroup += '<div id="collapse' + symbol + '" class="panel-collapse collapse in">';
    panelGroup += '<div class="panel-body">';
    panelGroup += '<table class="table table-condensed">';
    //Get information for label QuoteWatch (left blank returns all values) and ChartWatch.

    var panelGroup = '<div class="panel panel-default" id="' + symbol + '">';
    panelGroup += '<div class="panel-heading">';
    panelGroup += '<h4 class="panel-title">';
    panelGroup += '<a class="accordion-toggle float-left" data-toggle="collapse" data-parent="#accordion" href="#collapse' + symbol + '">';
    panelGroup += symbol + '[10]';
    panelGroup += '</a>';
    panelGroup += '</h4>';
    panelGroup += '<div class="symbolData">';
    panelGroup += '<div class="symbolVal" id="last' + symbol + '"> </div>';
    // class="changbox val' + downUp + '"
    panelGroup += '<div id="change' + symbol + '"> </div>';
    panelGroup += '<div><a href="#?id=' + symbol + '">[delete]</a></div>';
    panelGroup += '</div>';
    panelGroup += '</div>';
    panelGroup += '<div id="collapse' + symbol + '" class="panel-collapse collapse in">';
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

function getSymbolData(symbol, label) {
    //WEBSOCKET.onopen = onOpen;
    var msg = {
        meta: {
            command: "QuoteSnap",
            requestId: requestID++
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
        $("#change" + symbol).html(eventDataData[0].Change);
        $("#last" + symbol).html(eventDataData[0].Last);
        $("#high" + symbol).html(eventDataData[0].High);
        $("#volume" + symbol).html(eventDataData[0].Volume);
        $("#low" + symbol).html(eventDataData[0].Low);
        $("#openInt" + symbol).html(eventDataData[0].OpenInterest);
        $("#open" + symbol).html(eventDataData[0].Open);
        $("#vlty" + symbol).html(parseFloat(eventDataData[0].Volatility).toFixed(4).toString());
        $("#bid" + symbol).html(eventDataData[0].Bid);
        $("#bidSize" + symbol).html(eventDataData[0].BidSize);
        $("#ask" + symbol).html(eventDataData[0].Ask);
        $("#askSize" + symbol).html(eventDataData[0].AskSize);
        checkNull(symbol, event);

        var change = (eventDataData[0].Change);
        var check = change[0];
        if (check == "-") {
            var downUp = "Dn"
            $('#change' + symbol).addClass('changbox val' + downUp);
        } else {
            var downUp = "Up"
            $('#change' + symbol).addClass('changbox val' + downUp);
        }
    };
};

function checkNull(symbol, event) {
    var eventData = event.data;
    var eventDataData = JSON.parse(eventData).data;
    if (eventDataData[0].Change == null) {
        $("#change" + symbol).html("0");
    }
    if (eventDataData[0].Last == null) {
        $("#last" + symbol).html("0");
    }
    if (eventDataData[0].High == null) {
        $("#high" + symbol).html("0");
    }
    if (eventDataData[0].Volume == null) {
        $("#volume" + symbol).html("0");
    }
    if (eventDataData[0].Low == null) {
        $("#low" + symbol).html("0");
    }
    if (eventDataData[0].OpenInterest == null) {
        $("#openInt" + symbol).html("0");
    }
    if (eventDataData[0].Open == null) {
        $("#open" + symbol).html("0");
    }
    if (eventDataData[0].Volatility == null) {
        $("#vlty" + symbol).html("0");
    }
    if (eventDataData[0].Bid == null) {
        $("#bid" + symbol).html("0");
    }
    if (eventDataData[0].BidSize == null) {
        $("#bidSize" + symbol).html("0");
    }
    if (eventDataData[0].Ask == null) {
        $("#ask" + symbol).html("0");
    }
    if (eventDataData[0].AskSize == null) {
        $("#askSize" + symbol).html("0");
    }
}