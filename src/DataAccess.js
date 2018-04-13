
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
    //$.ajax({
    //    type: "post",
    //    dataType: "json",
    //    url: "https://ws1.dtn.com/SymbolSearch/GetVersion",
    //    success: function (data) {

    //        var html = data.meta.status;
    //        $('#dvDemo').html(html);
            

    // //Bind to list items
    //        alert(data);
    //    }
    //});

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


