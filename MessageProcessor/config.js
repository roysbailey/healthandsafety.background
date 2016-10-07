(function (config) {
  config.sourceQueueConnectionString = process.env.AzureProcessingQueueConnection;
  config.tririgaOSLAPICUri = process.env.TririgaOSLAPICUri;
  config.pollIntervall = process.env.PollInterval ? parseInt(process.env.PollInterval) : 5000;
  config.azureQueueName = process.env.AzureQueueName || 'has-incidents';
  config.incidentReportingUri = process.env.incidentReportingUri;
})(module.exports);
