var config = require("../config/config");
var incidentQueryService = require("./incidentQueryService");

(function (incidentSubmissionService) {

    var RestClient = require('node-rest-client').Client;

    incidentSubmissionService.PostIncident = (incident, callback) => {
        return new Promise( function pr(resolve,reject) {

            // We may be creating a new incident, or updating an existing one.
            // We need to check if we can find a match to work out whether to update or insert.

            incidentQueryService.GetIncidentByControlNumber(incident.IncidentID)
                .then((data) => {
                    if (data.length) {
                        console.log("Need to update: " + incident.IncidentID);
                        updateExistingIncident(incident, data[0].__url)
                            .then( () => resolve());
                    } else {
                        console.log("Need to add: " + incident.IncidentID);
                        addNewIncident(incident)
                            .then( () => resolve());
                    }
                });

        });
    }


    function addNewIncident(incident) {

        return new Promise( function pr(resolve,reject) {
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
                resolve();
            }).on('error', function (err) {
                console.log('something went wrong on the request', err.request.options);
                reject(err);
            });
        });     
    }

    function updateExistingIncident(incident, updateUrl) {

        return new Promise( function pr(resolve,reject) {
            var incidentBO = mapToBO(incident, "update");
            var client = new RestClient();
            var args = {
            data: incidentBO,
            headers: { 
                "Content-Type": "application/json", 
                "Authorization": config.basicAuthHeaderVal 
                }
            };

            var incidentUpdateUri = updateUrl;

            client.put(incidentUpdateUri, args, (data, response) => {
                console.log("Body from OSLC: " + JSON.stringify(data));
                console.log("Created incident: " + incident.incidentID);                
                resolve();
            }).on('error', function (err) {
                console.log('something went wrong on the update BO', err.request.options);
                reject(err);
            });
        });     
    }


    function mapToBO(incident, mode = "insert") {

        var bo = {};

        if (mode === "insert") {
            bo =
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
        } else {
            bo =
            {
                "spi:cstRegion": incident.Region,
                "spi:cstIncidentDate": incident.incidentDate, 
                "spi:cstCasualty": incident.casualty,
                "spi:cstIncidentClass": incident.incidentClass,
                "spi:cstIncidentSubmitter": incident.nameOfSubmitter,
                "spi:cstIncidentReport": incident.problemReport,
                "spi:cstIncidentStatus": incident.status
            }
        }

        return bo;
    }
})(module.exports);