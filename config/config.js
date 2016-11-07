(function (config) {
  config.sourceQueueConnectionString = process.env.AzureProcessingQueueConnection;
  config.pollIntervall = process.env.PollInterval ? parseInt(process.env.PollInterval) : 5000;
  config.azureQueueName = process.env.AzureQueueName || 'has-incidents';
  config.incidentReportingUri = process.env.incidentReportingUri;
  config.incidentQueryEventsUri = process.env.incidentQueryEventsUri;
  config.incidentQueryExistingUri = process.env.incidentQueryExistingUri;
  config.incidentUpdateUri = process.env.incidentUpdateUri;
  config.incidentServiceHostname = process.env.incidentServiceHostname;
  config.basicAuthHeaderVal = process.env.BasicAuthHeaderVal;
  config.pollIntervalReadView = process.env.PollIntervalReadView;
})(module.exports);
