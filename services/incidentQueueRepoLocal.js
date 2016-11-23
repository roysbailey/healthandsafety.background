var pgp = require('pg-promise')();

var cn = {
    host: 'localhost', // 'localhost' is the default;
    database: 'test',
    user: 'postgres',
    password: 'password'
};

var db = pgp(cn);

(function (incidentQueueRepoLocal) {

    incidentQueueRepoLocal.loadNextMessage = () => {
        return new Promise( function pr(resolve,reject){
            var messageObject = {
                messageToken: undefined,
                incidentReport: undefined
            }; 

            db.any('select taskID, incident from public."hasIncidentQueue" where status =  ' + "'Submitted' order by taskID asc limit 1")
            .then(function (data) {
                if (data.length) {
                    messageObject.messageToken = data[0].taskid;
                    messageObject.incidentReport = data[0].incident;
                    resolve(messageObject);
                } else {
                    reject({"error": "No message on queue"});
                }
            })
            .catch(function (error) {
                console.log("incidentQueueRepoLocal.loadNextMessage - Error: " + error);
                reject(error);
            }); 
        });
    }

    incidentQueueRepoLocal.removeMessage = (messageToken) => {

        var query = 'UPDATE public."hasIncidentQueue" set Status = ' + "'Processed' where taskid=$1";
        db.none(query, [messageToken])
            .then(() =>{
                console.log("REMOVED message: " + messageToken);
            })
            .catch((error) => {
                console.log("incidentQueueRepoLocal.loadNextMessage - Error: " + error);
                reject(error);
            });
        console.log("Remove message: " + messageToken);
    };

})(module.exports);



