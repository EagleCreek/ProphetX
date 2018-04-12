//import React from 'react';
//import ReactDOM from 'react-dom';

//ReactDOM.render(
//    <h1>Hello, world!</h1>,
//    document.getElementById('root')
//);

WEBSOCKET = new WebSocket('wss://ProphetX14.dtn.com/cs/1.0');
WEBSOCKET.onopen = onOpen;
//WEBSOCKET.onclose = onClose;
WEBSOCKET.onmessage = onMessage;
WEBSOCKET.onerror = onError;

function onOpen(evt) {
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
    console.log('Received message: ' + evt.data);
    var msg = JSON.parse(evt.data);
    switch (msg.meta.command) {
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