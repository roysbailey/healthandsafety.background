(function (config) {
  config.sourceQueueConnectionString = process.env.AzureProcessingQueueConnection;
  config.pollIntervall = process.env.PollInterval ? parseInt(process.env.PollInterval) : 5000;
  config.azureQueueName = process.env.AzureQueueName || 'has-incidents';
  config.incidentReportingUri = process.env.incidentReportingUri;
  config.basicAuthHeaderVal = process.env.BasicAuthHeaderVal;
})(module.exports);
