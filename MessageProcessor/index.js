var config = require("./config");
var incidentSubmissionService = require("./incidentSubmissionService");
var azureStorage = require('azure-storage');

var counter=0;

module.exports = {
  init: function() {
    console.log(config.sourceQueue);
    console.log(config.tririgaOSLAPICUri);

    setInterval(pollQueue, config.pollIntervall)
  }
};

function pollQueue() {
    counter++;
    console.log("Current counter: " + counter);

    var queueSvc = azureStorage.createQueueService(config.sourceQueueConnectionString);
    loadNextMessage(queueSvc, function(error, message){
        if (message) {
            processMessage(message.incidentReport, function(error){
                if (!error)
                    removeMessage(queueSvc, message.azureMessage);
            });
        }
    });
}

function loadNextMessage(queueSvc, callback) {
    var messageObject = {
        azureMessage: undefined,
        incidentReport: undefined
    }; 
    var inci
    queueSvc.createQueueIfNotExists(config.azureQueueName, function(error, result, response){
        if(!error){
            queueSvc.getMessages(config.azureQueueName, function(error, result, response){
                if(!error){
                    // Azure storage queues excpect base64 encoding (specifically the tools like storage explorer).
                    // http://www.codingdefined.com/2015/07/how-to-encode-string-to-base64-in-nodejs.html
                    messageObject.azureMessage = result[0]; 
                    var buffer = new Buffer(messageObject.azureMessage.messageText, 'base64');
                    var messageTextAscii = buffer.toString('ascii');
                    messageObject.incidentReport = JSON.parse(messageTextAscii);
                    callback(null, messageObject);
                } else {callback(error, null);}
            });
        } else {callback(error, null);}
    });

    // Nothing to do, so send null back to callback for both error and result.
    callback(null, null);
}

function processMessage(incidentReport, callback) {
    if (incidentReport) {
        console.log("Process new message");
        console.log("incidentID: " + incidentReport.incidentID);

        incidentSubmissionService.PostIncident(incidentReport, callback);
    }

    callback(null);
}

function removeMessage(queueSvc, azureMessage) {
    // queueSvc.deleteMessage(config.azureQueueName, azureMessage.messageId, azureMessage.popReceipt, function(error, response){
    //   if(!error){
    //     console.log("Removed message: " + azureMessage.messageId);
    //   }
    // });

    console.log("Remove message");
}