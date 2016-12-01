var incidentQueueRepoCloud = require("./incidentQueueRepoCloud");
var incidentQueueRepoLocal = require("./incidentQueueRepoLocal");

(function (incidentQueueRepoFactory) {

    incidentQueueRepoFactory.instance = process.env.HOST_MODEL === 'Azure' 
        ? incidentQueueRepoCloud 
        : incidentQueueRepoLocal;

})(module.exports);