var config = require("./config");

(function (incidentSubmissionService) {

    var RestClient = require('node-rest-client').Client;

    incidentSubmissionService.PostIncident = (incident, callback) => {
        return new Promise( function pr(resolve,reject) {
            var client = new RestClient();
            var args = {
            data: incident,
            headers: { "Content-Type": "application/json" }
            };

            client.post(config.incidentReportingUri, args, (data, response) => {
                // parsed response body as js object 
                console.log(data);
                // raw response 
                console.log(response);

                resolve();
            }).on('error', function (err) {
                console.log('something went wrong on the request', err.request.options);
                reject(err);
            });
        });
    }
})(module.exports);
