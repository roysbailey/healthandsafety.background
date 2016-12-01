
(function (incidentReadViewRepoCloud) {

    var AWS = require("aws-sdk");
    AWS.config.update({
        region: "eu-west-1"
    });
    const dynamodb = new AWS.DynamoDB({correctClockSkew: true});

    incidentReadViewRepoCloud.UpdateReadView = (hasIncidents) => {
        return new Promise( function pr(resolve,reject) {
            console.log("Need to save: " + hasIncidents.length + " incidents");
            var completedSaves = 0; 
            if (hasIncidents.length > 0) {
                hasIncidents.forEach(hasIncident => {
                    // Convert BO format to model format 
                    //var incidentModel = mapToModel(hasIncident);
                    putItem("HealthAndSafetyIncidents", hasIncident, (error, data) => {
                        if (error) {
                            console.log("Failed to save incident, aborting: " + error);
                            reject(error)
                        }
                        else {
                            completedSaves++;
                            console.log("Incident save: " + completedSaves + " of " + hasIncidents.length + " incidents");
                            if (hasIncidents.length == completedSaves) {
                                console.log("Saved all incidents, so completing");
                                resolve("Saved: " + completedSaves + " incidents to the read model");
                            }
                        }
                    });
                });
            } else {
                resolve("No updated incidents to save...");
            }
        });
    }

    incidentReadViewRepoCloud.getLastPollDate = () => {
        return new Promise( function pr(resolve,reject) {
            getItem("HealthAndSafetyBookMark", "System", "HealthAndSafety", (error, data) => {
                if (error)
                    reject(error)
                else {
                    resolve(data.Item.LastPollDateTime.S);
                }
            });
        });
    }

    incidentReadViewRepoCloud.saveLastPollDate = (pollDateTime) => {
        return new Promise( function pr(resolve,reject) {
            var bookMarkModel = {
                System: "HealthAndSafety",
                LastPollDateTime: pollDateTime
            }
            putItem("HealthAndSafetyBookMark", bookMarkModel, (error, data) => {
                if (error)
                    reject(error)
                else {
                    resolve();
                }
            });
        });
    }

    function getItem (table, idName, id, callback) {
        let params ={
            TableName: table,
            Key: {}
        };
        params.Key[idName] = { S: id };

        dynamodb.getItem(params, callback);
    }

    function putItem (table, item, callback) {
        let params = {
            TableName: table,
            Item: {}
        };

        for (let key of Object.keys(item)) {
            let val;
            console.log("Key: "+ key)
            if (typeof item[key] === 'string') {
            val = { S: item[key] };
            } else if (typeof item[key] === 'number') {
            val = { N: '' + item[key] };
            } else if (item[key] instanceof Array) {
            val = { SS: item[key] };
            } else { console.log("Could not type match for: " + key) }
            params.Item[key] = val;
        }
        dynamodb.putItem(params, callback);
    }

    function mapToModel(incidentBO) {

        var model = {
            "problemReport": incidentBO.problemReport,
            "incidentType": incidentBO.incidentType,
            "Region": incidentBO.region,                            // Primary partition key for dynamodb.
            "IncidentID": incidentBO.ID,                            // Sort key for dynamodb.
            "nameOfSubmitter" : incidentBO.name,
            "createdDateTime" : incidentBO.createdDateTime,
            "updatedDateTime": incidentBO.updatedDateTime 
        };

        return model;
    }

})(module.exports);