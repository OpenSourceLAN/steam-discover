"use strict";

class sinkWrapper {
	constructor(sinkConfig, globallyExcludedFields) {
		this.sinks = [];

		sinkConfig.forEach((sink) => {
			if (!sink.enabled) {
				return;
			}
			var type = require(`./data-sink/${sink.type}.js` );

			sink.options.excludeFields = this.getFieldsToExclude(globallyExcludedFields, sink.options.excludeFields);
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

	/**
	 * Combines the global exclude list and a sink-specific one
	 */
	getFieldsToExclude(globalFields, customFields) {
		var allFields = (customFields || []).concat(globalFields || []);
		if (allFields.length == 0) {
			return null;
		} else {
			return allFields;
		}
	}

	exceptFields(input, exceptFields) {
		if (!exceptFields) {
			return input;
		}

		var out = {};
		Object.keys(input).forEach((k) => {
			if (exceptFields.indexOf(k) === -1) {
				out[k] = input[k];
			}
		})
		return out;
	}
}

module.exports = sinkWrapper;