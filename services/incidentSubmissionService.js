var config = require("../config/config");

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
                console.log("Body from OSLC: " + JSON.stringify(data));
                console.log("Created incident: " + incident.incidentID);                
                // parsed response body as js object 

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
            "spi:cstRegion": incident.Region,
            "spi:cstIncidentDate": incident.incidentDate, 
            "spi:cstCasualty": incident.casualty,
            "spi:cstIncidentClass": incident.incidentClass,
            "spi:cstIncidentSubmitter": incident.nameOfSubmitter,
            "spi:cstIncidentReport": incident.problemReport,
            "spi:cstIncidentStatus": incident.status
        }

        return bo;
    }
})(module.exports);