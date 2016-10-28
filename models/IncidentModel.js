'use strict';

module.exports = function (incidentID, region, incidentDate, casualty, incidentClass, nameOfSubmitter, problemReport, status, createdDateTime,  updatedDateTime) {
  this.IncidentID = '' + incidentID;
  this.Region = '' + region;
  this.incidentDate = incidentDate;
  this.casualty = casualty;
  this.incidentClass = incidentClass;
  this.nameOfSubmitter = '' + nameOfSubmitter;
  this.problemReport = problemReport;
  this.status = status;
  this.createdDateTime = createdDateTime;
  this.updatedDateTime = updatedDateTime;
} 



