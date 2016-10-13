var config = require("./config");
var incidentSubmissionService = require("./incidentSubmissionService");
var azureStorage = require('azure-storage');

var counter=0;

module.exports = {
  init: () => {
    pollQueue();
    setInterval(pollQueue, config.pollIntervall)
  }
};

function pollQueue() {
    counter++;
    console.log("Current counter: " + counter);

    var queueSvc = azureStorage.createQueueService(config.sourceQueueConnectionString);
    loadNextMessage(queueSvc).
    then(message => {
            // handle `contents` success
            return processMessage(message);
        })
    .then(
        function fulfilled (message) {
            // handle `contents` success
            removeMessage(queueSvc, message.azureMessage);
        },
        function rejected(error){
            console.log("Error: " + error);
        });
}

function loadNextMessage(queueSvc) {
    return new Promise( function pr(resolve,reject){
        var messageObject = {
            azureMessage: undefined,
            incidentReport: undefined
        }; 
        queueSvc.createQueueIfNotExists(config.azureQueueName, (error, result, response) => {
            if(!error){
                queueSvc.getMessages(config.azureQueueName, (error, result, response) => {
                    if(!error && result.length > 0){
                        // Azure storage queues excpect base64 encoding (specifically the tools like storage explorer).
                        // http://www.codingdefined.com/2015/07/how-to-encode-string-to-base64-in-nodejs.html
                        messageObject.azureMessage = result[0]; 
                        var buffer = new Buffer(messageObject.azureMessage.messageText, 'base64');
                        var messageTextAscii = buffer.toString('ascii');
                        messageObject.incidentReport = JSON.parse(messageTextAscii);
                        resolve(messageObject);
                    } else if (result.length === 0) {reject({"error": "No message on queue"});} 
                    else {reject(error);}
                });
            } else {reject(error);}
        });
    });
}

function processMessage(message) {
    return new Promise( function pr(resolve,reject) {
        incidentReport = message.incidentReport;
        if (incidentReport) {
            console.log("Process new message");
            console.log("incidentID: " + incidentReport.incidentID);

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

function removeMessage(queueSvc, azureMessage) {
    queueSvc.deleteMessage(config.azureQueueName, azureMessage.messageId, azureMessage.popReceipt, (error, response) => {
      if(!error){
        console.log("Removed message: " + azureMessage.messageId);
      }
    });

    console.log("Remove message: " + azureMessage.messageId);
}