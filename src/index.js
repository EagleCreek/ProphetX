//import React from 'react';
//import ReactDOM from 'react-dom';

//ReactDOM.render(
//    <h1>Hello, world!</h1>,
//    document.getElementById('root')
//);

//Test
//test - mm

WEBSOCKET = new WebSocket('wss://ProphetX14.dtn.com/cs/1.0');
WEBSOCKET.onopen = onOpen;
//WEBSOCKET.onclose = onClose;
WEBSOCKET.onmessage = onMessage;
WEBSOCKET.onerror = onError;

function onOpen(evt) {
    //alert('Sending login message on opened connection');
    // Send the login message
    console.log('Sending login message on opened connection');
    var msg = {
        meta: { command: 'Login' },
        data: {
            username: 'test@eaglecrk.com',
            password: 'Dakota',
            appname: 'testApp',
            version: '1.0.0.0',
        }
    };
    WEBSOCKET.send(JSON.stringify(msg));
}

function onMessage(evt) {
    var htmlOutput = "~";
    console.log('Received message: ' + evt.data);
    var msg = JSON.parse(evt.data);
    switch (msg.meta.command) {
    case 'Login':
        {
                onLogin(msg);
                
                $.each(msg, function (index, i) {
                    if (index == 'data') {
                        $.each(msg.data, function (indexSecond, i) {
                            $('#header').html("Welcome, " + i.username);
                        });
                    }
                    htmlOutput += i.command + " ";
                    htmlOutput += i.status + " ";
                });
                $('#dvDemo').html(htmlOutput);
            break;
        }

    default:
        {
            break;
        }
    }
}

function onLogin(msg) {
    // Check if the login was successful
    if (msg.meta.status == 200) {
        console.log('Login successful');
        var request = {
            meta: {
                command: 'QuoteWatch',
                requestId: 1,
            },
            data: {
                expression: 'MSFT',
                fields: ['Last', 'Open', 'High', 'Low', 'Close', 'Settlement', 'TradeDateTime'],
                updateInterval: 0.5
            }
        };

        // Send one request for each test symbol
        //for (var i = 0; i < SYMBOLS.length; i++) {
        //    request.meta.requestId += 1;
        //    request.data.expression = SYMBOLS[i];
        //    console.log('Sent request ' + request.meta.requestId + ': ' + JSON.stringify(request));
        //    WEBSOCKET.send(JSON.stringify(request))
        //}
    }
    else {
        console.log('Login failed');
    }
}


function onError(msg) {
    
}


function search(msg)
{
    WEBSOCKET.onopen = onOpen;
    var CZ17Show = "~";
    var symbols = $('#searchText').val();
    var msg = {
        meta: { command: 'ChartSnap',
                requestId: 9},
        data: {
            expression: '@CZ17',
            limit: 1,
            interval: 'MINUTE',
            intervalCount: 5
        }
    };
    WEBSOCKET.send(JSON.stringify(msg));

    var results = "";
    WEBSOCKET.onmessage = function (event) {
        fillList(event);
        //alert(event);
    };
    //alert(symbols);
}

function fillList(event) {
    var html = "";
    $.each(event, function (index1, i1) {
        if (index1 == 'data') {

            var open = JSON.parse(i1);
            $.each(open, function (index2, open) {
                if (index2 == 'data') {
                    var x = open.data.Open;
                    $.each(x, function (index3, x2) {
                        var y = x2;
                    });
                    html += open.data + " ";
                }
            });
        }
        //$('#listQuotes').html(html);
    });
};