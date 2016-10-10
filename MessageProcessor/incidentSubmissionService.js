var config = require("./config");

(function (incidentSubmissionService) {

    var RestClient = require('node-rest-client').Client;

    incidentSubmissionService.PostIncident = (incident, callback) => {
        return new Promise( function pr(resolve,reject) {

            // Convert queue format to BO format 
            var incidentBO = mapToBO(incident);

            var client = new RestClient();
            var args = {
            data: incidentBO,
            headers: { 
                "Content-Type": "application/json", 
                "Authorization": config.basicAuthHeaderVal 
                }
            };

            client.post(config.incidentReportingUri, args, (data, response) => {
                console.log("Created incident: " + incident.incidentID);                
                // parsed response body as js object 
                // console.log(data);
                // console.log(response);

                resolve();
            }).on('error', function (err) {
                console.log('something went wrong on the request', err.request.options);
                reject(err);
            });
        });
    }

    function mapToBO(incident) {
        var bo =
        {
        "spi:action": "Activate",
        "spi:cstIncidentDetails": incident.problemReport,
        "spi:cstIncidentType": incident.incidentType,
        "spi:cstIncidentLocation": incident.region,
        "spi:cstNameOfSubmitter" : incident.firstName + " " + incident.lastName 
        }

        return bo;
    }
})(module.exports);