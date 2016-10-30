var config = require("../config/config");
IncidentModel = require('../models/IncidentModel');

(function (incidentQueryService) {

    var RestClient = require('node-rest-client').Client;

    incidentQueryService.GetIncidentsAfterDateFeed = (lastPollDateTime) => {
        return new Promise( function pr(resolve,reject) {

            // Convert queue format to BO format 
            var results = [];

            var client = new RestClient();
            var args = {
            headers: standardGetHeader()
            };

            var incidentQueryEventsUri = config.incidentQueryEventsUri.replace("{0}", lastPollDateTime);
            console.log("Query Uri: " + incidentQueryEventsUri) + " header: " + args.headers.Authorization; 
            client.get(incidentQueryEventsUri, args, (data, response) => {
                console.log("RAW BODY response from query by region: " + JSON.stringify(data));
                results = data['rdfs:member'];
                console.log("Retrived incidents: " + results);                

                if (results && results.length > 0) {
                    console.log("Total matches: " + results.length);

                    var loadIncidentPromises = [];
                    results.forEach((item) => {
                        incidentUri = item['rdf:resource'].replace("localhost", config.incidentServiceHostname);
                        loadIncidentPromises.push(loadIndividualIncident(incidentUri));
                    })

                    Promise.all(loadIncidentPromises).then(values => { 
                        console.log(values); 
                        resolve(values);
                    });
                } else {
                    resolve([]);
                }
            }).on('error', function (err) {
                console.log('something went wrong on the GET', err.request.options);
                reject(err);
            });
        });
    }

    function loadIndividualIncident(incidentUri) {
        return new Promise( function pr(resolve,reject) {
            console.log("Load Item: " + incidentUri);

            var client = new RestClient();
            var args = {
            headers: standardGetHeader()
            };

            client.get(incidentUri, args, (data, response) => {
                console.log("Retrived incident: " + data);
                var incidentModel = mapBOToModel(data);
                resolve(incidentModel);
            });
        });

    }

    function mapBOToModel(incidentBO) {

        var incidentModel = new IncidentModel(incidentBO["spi:ControlNumber"], incidentBO["spi:cstRegion"], 
            incidentBO["spi:cstIncidentDate"], incidentBO["spi:cstCasualty"], incidentBO["spi:cstIncidentClass"], incidentBO["spi:cstIncidentSubmitter"], 
            incidentBO["spi:cstIncidentReport"], incidentBO["spi:cstIncidentStatus"], incidentBO["spi:CreatedDateTime"], incidentBO["spi:triModifiedSY"]);

        return incidentModel;
    }

    function standardGetHeader() {
         
         var standardGetHeader = 
            { 
            "Accept": "application/json", 
            "Authorization": config.basicAuthHeaderVal 
            };

        return standardGetHeader;
    }

    function convertDateToEngland(inputFormat) {
        function pad(s) { return (s < 10) ? '0' + s : s; }
        var d = new Date(inputFormat);
        return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('/');
    }

})(module.exports);