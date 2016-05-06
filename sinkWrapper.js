

class sinkWrapper {
	constructor(sinks) {
		sinks.forEach((sink) => {
		  if (!sink.enabled) {
		    return;
		  }
		  var type = require(`./data-sink/${sink.type}.js` );

		  sinks.push(new type(sink.options));
		});
	}

	insertClient(clientInfo, batchId) {
	}

	insertAccount(accountInfo, batchId) {
	}

	hasSinks() {
		return false;
	}
}