#Build the container based on this docker file.
# docker build -f prod.dockerfile --tag monsteruk/has-webworker ../

#Run in default network
# docker run -d --env-file env/dev.webworker.env -v C:\data\git\DIOHandS.Background:/var/www -w /var/www  --name has-webworker  monsteruk/has-webworker
#Run in interactive mode.
# docker run -it --env-file env/dev.webworker.env -v C:\data\git\DIOHandS.Background:/var/www -w /var/www  --name has-webworker  monsteruk/has-webworker

#Run in an isolated network - just for has apps.
# docker network create --driver bridge has-isolated_network
# docker run -d --net=has-isolated_network --env-file env/dev.webworker.env -v C:\data\git\DIOHandS.Background:/var/www -w /var/www --name has-webworker  monsteruk/has-webworker
# Run prod version (with no volume) in interactive mode
# docker run -it --net=has-isolated_network --env-file env/dev.webworker.env --name has-webworker  monsteruk/has-webworker

FROM node:latest

MAINTAINER Roy Bailey

# Copy the current source code into the container - this is then baked in to the container itself for prod.
COPY      . /var/www
WORKDIR   /var/www

RUN       npm install -g pm2@latest
RUN       mkdir -p /var/log/pm2
# not point running npm here, as we dont map the source until we run the container via docker run
#RUN       npm install

#ENTRYPOINT ["npm", "start"]
ENTRYPOINT ["pm2", "start", "server.js","--name","has-worker","--log","/var/log/pm2/pm2.log","--watch","--no-daemon"]

#Note. When running the container, you specify an environemnt file (the app relies on a number of environment variables).  This is the list, add your own values for these.
# NODE_ENV=development 
# AzureQueueName = has-incidents
# PollInterval = 60000
# PollIntervalReadView = 60000
# incidentReportingUri = http://{TRIRIGA_IP_ADDRESS}/oslc/so/HASIncidentCF
# incidentQueryExistingUri = http://{TRIRIGA_IP_ADDRESS}/oslc/spq/cstHASIncidentQC?oslc.where=spi:ControlNumber=\"{0}\"
# incidentQueryEventsUri = http://{TRIRIGA_IP_ADDRESS}/oslc/spq/cstHASIncidentQC?oslc.where=spi:triModifiedSY>\"{0}\"
# incidentServiceHostname = {TRIRIGA_IP_ADDRESS}
# BASE 64 encoded username and password
# BasicAuthHeaderVal = Basic {USERNAME:PASSWORD base64 encoded}
# AzureProcessingQueueConnection=DefaultEndpointsProtocol=https;AccountName={YOUR_STORAGE_ACCOUNT_NAME};AccountKey={YOUR_KEY}
# AWS_ACCESS_KEY_ID={YOUR_AWS_KEY}
# AWS_SECRET_ACCESS_KEY={YOUR_AWS_SECRET_KEY}
# postgresHost=has-postgres
# postgresPassword=password