var config = require("../config/config");
var azureStorage = require('azure-storage');

(function (incidentQueueRepoCloud) {

    var queueSvc = azureStorage.createQueueService(config.sourceQueueConnectionString);

    incidentQueueRepoCloud.loadNextMessage = () => {
        return new Promise( function pr(resolve,reject){
            var messageObject = {
                messageToken: undefined,
                incidentReport: undefined
            }; 
            queueSvc.createQueueIfNotExists(config.azureQueueName, (error, result, response) => {
                if(!error){
                    queueSvc.getMessages(config.azureQueueName, (error, result, response) => {
                        if(!error && result.length > 0){
                            // Azure storage queues excpect base64 encoding (specifically the tools like storage explorer).
                            // http://www.codingdefined.com/2015/07/how-to-encode-string-to-base64-in-nodejs.html
                            messageObject.messageToken = { "messageId": result[0].messageId, "popReceipt": result[0].popReceipt}; 
                            var buffer = new Buffer(result[0].messageText, 'base64');
                            var messageTextAscii = buffer.toString('ascii');
                            messageObject.incidentReport = JSON.parse(messageTextAscii);
                            console.log("Loaded incident from queue to process: " + messageTextAscii);
                            resolve(messageObject);
                        } else if (result.length === 0) {reject({"error": "No message on queue"});} 
                        else {reject(error);}
                    });
                } else {reject(error);}
            });
        });
    }

    incidentQueueRepoCloud.removeMessage = (messageToken) => {
        queueSvc.deleteMessage(config.azureQueueName, messageToken.messageId, messageToken.popReceipt, (error, response) => {
        if(!error){
            console.log("Removed message: " + messageToken.messageId);
        }
    });

    console.log("Remove message: " + messageToken.messageId);
}

})(module.exports);



