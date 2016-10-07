var config = require("./config");

(function (incidentSubmissionService) {

    var RestClient = require('node-rest-client').Client;

    incidentSubmissionService.PostIncident = function(incident, callback) {
        var client = new RestClient();
        var args = {
        data: incident,
        headers: { "Content-Type": "application/json" }
        };

        client.post(config.incidentReportingUri, args, function (data, response) {
            // parsed response body as js object 
            console.log(data);
            // raw response 
            console.log(response);

            callback(null);
        }).on('error', function (err) {
            console.log('something went wrong on the request', err.request.options);
            callback(err);
        });
    };
})(module.exports);
