module.exports = {
  sourceQueueConnectionString: process.env.AzureProcessingQueueConnection,
  tririgaOSLAPICUri: process.env.TririgaOSLAPICUri,
  pollIntervall: process.env.PollInterval || 5000,
  azureQueueName: process.env.AzureQueueName || 'has-incidents',
  incidentReportingUri: process.env.incidentReportingUri
};