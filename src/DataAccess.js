WEBSOCKET = new WebSocket('wss://ProphetX14.dtn.com/cs/1.0');
function login() {
    var uname = $('#username').val();
    var pwd = $('#password').val();
    var remMe = $('#remember').val();
    //console.log('Sending login message on opened connection');
    var msg = {
        meta: { command: 'Login' },
        data: {
            username: 'jforst@eaglecrk.com',
            password: 'd3HPr9',
            appname: 'WSP',
            version: '1.0.0.0',
        }
    };
    WEBSOCKET.send(JSON.stringify(msg));// submit json
    $('#loginError').html(""); // Clear out value
}

WEBSOCKET.onmessage = loginSuccessful;


function loginSuccessful(evt) {
    var html = "";
    //var result = "Received message: " + evt.data;
    var msg = JSON.parse(evt.data);

    
//    "{
//    "meta": {
//        "command": "Login",
//            "status": 401
//    },
//    "errors": [
//        {
//            "code": "Login Error",
//            "detail": "Login Rejected: Incorrect user password."
//        }
//    ]
//} "
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
                     loginLookup(msg);
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

    var status = msg.meta.status;
    var data = msg.data;

    var infoMsg = data[0].info;
    var id = data[0].whoId; // userId 
    var uName = data[0].username;
    
    var welcom = "<h5>Welcome, " + infoMsg + "</h5>";
    $('#msgWelcome').html(welcom);

    $('#loggedIn').css("display", "");// Show the Logged In panel
    
    var myQuotes = {
        // json list   
    };
    // add to local store
    // ... add here 
    // read from store based on the id
    // list for each user

    
    // Get Quote list for logged in user 
   
        //console.log('Login successful');
        var request = {
            meta: {
                command: 'ChartSnap',
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
            //WEBSOCKET.send(JSON.stringify(request))
        //}
    
   
}



//function onLogin(msg) {
//    // Check if the login was successful
//    // then show me my list of quotes
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










function showList(id, username) {
    //alert('foo');

    var password = $('#txtPassword').val();

    var data = {
        "meta": {
            "command": "Login",
            "requestId": id
        },
        "data": {
            "username": username,
            "password": password,
            "appname": "WSP",
            "version": "1.0.0.0",
            "metadata": [
                {
                    "name": "studies",
                    "version": 1,
                    "datetime": null
                }
            ]
        }
    };

    var chartSnap = {
        "meta": {
            "command": "ChartSnap",
            "requestId": 2
        },
        "data": {
            "expression": "@ES@1", // passed in search text 
            "limit": 100,
            "interval": "MINUTE",
            "intervalCount": 5
        }
    };

    // Simple GET 
    $.ajax({
        type: "GET",
        dataType: "json",
        data: JSON.stringify(data),
        url: "https://ws1.dtn.com/SymbolSearch/GetVersion",
        success: function (data) {

            var html = data.meta.status;
            $('#dvDemo').html(html);
            

     //Bind to list items
            alert(data);
        }
    });

    // Simple POST
    var ids = { id: id };
    var htmlOutput = "";
    $.ajax({
        type: "POST",
        dataType: "JSON",
        //contentType: "application/json; charset=utf-8",
        url: 'https://ws1.dtn.com/SymbolSearch/GetVersion',
        data: JSON.stringify(ids),
        success: function (result) {
            alert('success');
            $.each(result, function(index, i) {
                // do stuff with the results
                // append html strings
                htmlOutput += i;
            });
            // write html output to a div
            //$('#dvDemo').html(html);

        },
        error: function(result) {
            alert('fail');
            // could output results here. 
        }
    });
}







//const http = require('http');

//const hostname = '127.0.0.1';
//const port = 3000;

//const server = http.createServer((req, res) => {
//    res.statusCode = 200;
//    res.setHeader('Content-Type', 'text/plain');
//    res.end('Hello World\n');
//});

//server.listen(port, hostname, () => {
//    console.log(`Server running at http://${hostname}:${port}/`);
//});


