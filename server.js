var messageProcessor = require("./MessageProcessor");

//var v = process.version;

// This starts a timer loop, which processes messages as and when they become available.
messageProcessor.init();
