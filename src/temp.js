////////////////////////////////////////////////////
// NOTE: this file is for REFERENCE ONLY and not used in this application
// Ajax Json examples 
// Use JSONP for cross domain
// below are examples only and could be leveraged to build a new access layer 

$.getJSON("http://localhost:8080/restws/json/product/get?callback=?",
    function (data) {
        alert(data);
    });

$.ajax({
    type: "GET",
    dataType: "jsonp",
    url: "http://localhost:8080/restws/json/product/get",
    success: function (data) {
        alert(data);
    }
});

$('#search').on('click', function (e) {
    resetdata();
    var data = {
        method: "SymbolSearch",
        requestId: 1
    }
    $.ajax({
        dataType: "json",
        url: 'https://ws1.dtn.com/SymbolSearch/QuerySymbolsDD',
        data: data,
        success: function (d) {
            //success(d);
            //showResponseOutput(d);
        },
        error: function (err, result) {
            //showResponseOutput(err.responseJSON);
        },
        statusCode: {
            204: function () {
                resetdata();
                showErrorMessage();
            },
            500: function () {
                resetdata();
                showErrorMessage(500);
            },
            401: function () {
                resetdata();
                showErrorMessage(401);
            }
        }
    });
});

function resetdata() {
    // empty form
}

function showErrorMessage(val) {
    alert(val);
}