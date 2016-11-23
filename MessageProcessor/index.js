var config = require("../config/config");
var incidentQueueRepo = require("../services/incidentQueueRepoFactory").instance;
var incidentSubmissionService = require("../services/incidentSubmissionService");
var incidentQueryService = require("../services/incidentQueryService");
var incidentReadViewRepo = require("../services/incidentReadViewRepo");

var counter=0;

module.exports = {
  init: () => {
    // Look for new incidents from the web ui
    pollQueue();
    setInterval(pollQueue, config.pollIntervall);

    // Look for changes to the tririga system.
    PollDomainEvents();
    setInterval(PollDomainEvents, config.pollIntervalReadView);
  }
};

function PollDomainEvents() {
    var d = new Date();
    var nextPollDate = d.toISOString();
    incidentReadViewRepo.getLastPollDate()
    .then(pollDateTime => {
        //pollDateTime = "2016-10-01T05:51:42.930-04:00";
        return incidentQueryService.GetIncidentsAfterDateFeed(pollDateTime);
    })
    .then(changedIncidents => {
        console.log("Incidents: " + JSON.stringify(changedIncidents));
        return incidentReadViewRepo.UpdateReadView(changedIncidents);
    })
    .then(outcome => {
        console.log("outcome: " + outcome);
        return incidentReadViewRepo.saveLastPollDate(nextPollDate);
    })
    .then( () => {
        console.log("done poll");
    });
}

function pollQueue() {
    counter++;
    console.log("Current counter: " + counter);

    incidentQueueRepo.loadNextMessage().
    then(message => {
            // handle `contents` success
            return processMessage(message);
        })
    .then(
        function fulfilled (message) {
            // handle `contents` success
            incidentQueueRepo.removeMessage(message.messageToken);
        },
        function rejected(error){
            console.log("Error: " + JSON.stringify(error));
        });
}



function processMessage(message) {
    return new Promise( function pr(resolve,reject) {
        incidentReport = message.incidentReport;
        if (incidentReport) {
            console.log("Process new message");
            console.log("incidentID: " + incidentReport.IncidentID);




            resolve(message);

            incidentSubmissionService.PostIncident(incidentReport)
            .then(
                function fulfilled(){
                    resolve(message);
                },
                function rejected(error){
                    reject(error);
                }
            );
        } else {
           resolve(message);
        }
    });
}

