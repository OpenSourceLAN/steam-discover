"use strict";

class sinkWrapper {
	constructor(sinkConfig) {
		this.sinks = [];
		sinkConfig.forEach((sink) => {
		  if (!sink.enabled) {
		    return;
		  }
		  var type = require(`./data-sink/${sink.type}.js` );

		  // TODO: should probably do callbacks/promises here
		  this.sinks.push(new type(sink.options));
		});
	}

	insertClient(clientInfo, batchId) {
		this.sinks.forEach((sink) => {
			sink.insertClient(clientInfo, batchId);
		});
	}

	insertAccount(accountInfo, batchId) {
		this.sinks.forEach((sink) => {
			sink.insertAccount(accountInfo, batchId);
		});
	}

	hasSinks() {
		return this.sinks.length > 0;
	}
}

module.exports = sinkWrapper;