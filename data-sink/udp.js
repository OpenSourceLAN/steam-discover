"use strict";

var dgram = require('dgram');

// UDP as a transport for moving events to logstash

// Sends each event as a JSON serialised packet blindly to the
// destination port, in the hope that it still exists


class udp {
	constructor(options) {
		this.options = options;
		this.socket = dgram.createSocket(this.options.udp6 ? 'udp6' : 'udp4');
	}
	insertClient(clientInfo, batchId) {
		var payload = JSON.stringify({
			type: "client",
			data: clientInfo
		});

		this.socket.send(payload, this.options.port, this.options.host);
	}

	insertAccount(accountInfo, batchId) {
		// Remove some of the really long properties from the data so that we 
		// have a payload suitable for UDP 
		var clonedObj = cloneObjectExcept(accountInfo, [
			"avatarFull",
			"avatarMedium",
			"avatar",
			"profileUrl"
			]);

		var payload = JSON.stringify({
			type: "account",
			data: clonedObj
		});

		this.socket.send(payload, this.options.port, this.options.host);
	}
}


function cloneObjectExcept(object, excludes) {
	var newObj = {};

	for (var i in object) {
		if (object.hasOwnProperty(i) == false) {
			continue;
		}

		if (excludes.indexOf(i) === -1) {
			newObj[i] = object[i];
		}
	}
	return newObj;
}


module.exports = udp;