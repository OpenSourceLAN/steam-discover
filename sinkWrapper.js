"use strict";

class sinkWrapper {
	constructor(sinkConfig, globallyExcludedFields) {
		this.sinks = [];
		this.globallyExcludedFields = globallyExcludedFields;

		sinkConfig.forEach((sink) => {
		  if (!sink.enabled) {
		    return;
		  }
		  var type = require(`./data-sink/${sink.type}.js` );

		  // TODO: should probably do callbacks/promises here
		  sink.options.excludeFields = sink.options.excludeFields || [];
		  this.sinks.push(new type(sink.options));
		});
	}

	insertClient(clientInfo, batchId) {
		this.sinks.forEach((sink) => {
			clientInfo = this.exceptFields(clientInfo, sink.excludeFields);
			sink.insertClient(clientInfo, batchId);
		});
	}

	insertAccount(accountInfo, batchId) {
		this.sinks.forEach((sink) => {
			accountInfo = this.exceptFields(accountInfo, sink.excludeFields);
			sink.insertAccount(accountInfo, batchId);
		});
	}

	hasSinks() {
		return this.sinks.length > 0;
	}

	exceptFields(input, customExcept) {
		var out = {};
		Object.keys(input).forEach((k) => {
			if (customExcept.indexOf(k) === -1 && this.globallyExcludedFields.indexOf(k) === -1) {
				out[k] = input[k];
			}
		})
		return out;
	}
}

module.exports = sinkWrapper;