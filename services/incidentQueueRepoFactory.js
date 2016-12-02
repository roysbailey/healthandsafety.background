var config = require("../config/config");
var incidentQueueRepoCloud = require("./incidentQueueRepoCloud");
var incidentQueueRepoLocal = require("./incidentQueueRepoLocal");

(function (incidentQueueRepoFactory) {

    incidentQueueRepoFactory.instance = config.hostModel === 'Cloud' 
        ? incidentQueueRepoCloud 
        : incidentQueueRepoLocal;

})(module.exports);