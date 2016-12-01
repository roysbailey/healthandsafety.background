var incidentReadViewRepoCloud = require("./incidentReadViewRepoCloud");
var incidentReadViewRepoLocal = require("./incidentReadViewRepoLocal");

(function (incidentReadViewRepoFactory) {

    incidentReadViewRepoFactory.instance = process.env.HOST_MODEL === 'Azure' 
        ? incidentReadViewRepoCloud 
        : incidentReadViewRepoLocal;

})(module.exports);