var config = require("../config/config");
IncidentModel = require('../models/IncidentModel');

(function (incidentQueryService) {

    var RestClient = require('node-rest-client').Client;

    incidentQueryService.GetIncidentsAfterDateFeed = (lastPollDateTime) => {
        var incidentQueryEventsUri = config.incidentQueryEventsUri.replace("{0}", lastPollDateTime);
        return executeIncidentQuery(incidentQueryEventsUri);
    }

    incidentQueryService.GetIncidentByControlNumber = (controlNumber) => {
        var incidentQueryUri = config.incidentQueryExistingUri.replace("{0}", controlNumber);
        return executeIncidentQuery(incidentQueryUri);
    }


    function executeIncidentQuery (queryUri) {
        return new Promise( function pr(resolve,reject) {

            var results = [];

            var client = new RestClient();
            var args = {
                headers: standardGetHeader()
            };
            console.log("Query Uri: " + queryUri + " header: " + args.headers.Authorization);

            client.get(queryUri, args, (data, response) => {
                console.log("RAW BODY response from query: " + JSON.stringify(data));
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
                incidentModel.__url = incidentUri;
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