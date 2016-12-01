var pgp = require('pg-promise')();
var config = require("../config/config");

var cn = {
    host: config.postgresHost, // 'localhost' is the default;
    database: 'has',
    user: 'postgres',
    password: config.postgresPassword
};

var db = pgp(cn);

(function (incidentReadViewRepoLocal) {

    incidentReadViewRepoLocal.UpdateReadView = (hasIncidents) => {
        return new Promise( function pr(resolve,reject) {
            console.log("Need to save: " + hasIncidents.length + " incidents");
            var completedSaves = 0; 
            if (hasIncidents.length > 0) {
                hasIncidents.forEach(hasIncident => {
                    var hasIncidentJson = JSON.stringify(hasIncident);

                    // Need to do an upsert here and call back on the promise (or just return promise from postgres
                    db.any('select "IncidentID" from public."hasIncidentsReadView" where "IncidentID"=$1', [hasIncident.IncidentID])
                        .then(function (data) {
                            if (data.length) {
                                // Already there, so lets do an update
                                return db.none('update public."hasIncidentsReadView" set "Region"=$1, "incident"=$2 where "IncidentID"=$3', [hasIncident.Region, hasIncidentJson, hasIncident.IncidentID])
                            } else {
                                return db.none('insert into public."hasIncidentsReadView" ("IncidentID", "Region", "incident") values($1, $2, $3)', [hasIncident.IncidentID, hasIncident.Region, hasIncidentJson])
                            }
                        })
                        .then( () => {
                            resolve();
                        })
                        .catch(function (error) {
                            console.log("error (incidentReadViewRepoLocal.UpdateReadView): " + error)
                            reject(error);
                        });
                });
            }
        });
    }

    incidentReadViewRepoLocal.getLastPollDate = () => {
        return new Promise( function pr(resolve,reject) {
            db.any('select "LastPollDateTime" from public."HealthAndSafetyBookmark" where "System"=$1', ['HealthAndSafety'])
                .then((data) => {
                    if (data.length)
                        resolve(data[0].LastPollDateTime.toISOString())
                    else 
                        resolve("2016-10-01T05:51:42.930-04:00");
                })
                .catch( (error) => {
                    reject(error);
                });
        });
    }

    incidentReadViewRepoLocal.saveLastPollDate = (pollDateTime) => {
        return new Promise( function pr(resolve,reject) {
            db.none('update public."HealthAndSafetyBookmark" set "LastPollDateTime"=$1 where "System"=$2', [pollDateTime, 'HealthAndSafety'])
                .then(() => {
                    resolve();
                })
                .catch( (error) =>{
                    reject(error);
                });
        });
    }


})(module.exports);