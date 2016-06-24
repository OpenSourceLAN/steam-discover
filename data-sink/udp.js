"use strict";

var dgram = require('dgram');

// UDP as a transport for moving events to logstash

// Sends each event as a JSON serialised packet blindly to the
// destination port, in the hope that it still exists


class udp {
	constructor(options) {
		this.options = options;
		this.socket = dgram.createSocket(this.options.udp6 ? 'udp6' : 'udp4');
		this.excludeFields = options.excludeFields;
	}
	insertClient(clientInfo, batchId) {
		// Because the motivation for adding UDP support is to send the data to logstash, 
		// and logstash doesn't like arrays, we flatten out the client object
		var flattenedInfo = movePropsFromTo(clientInfo.users[0], clientInfo);
		delete flattenedInfo.users;

		var payload = JSON.stringify({
			type: "client",
			data: flattenedInfo
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

function movePropsFromTo(from,to) {
	var newObj = cloneObjectExcept(to);

	for (var i in from) {
		if (from.hasOwnProperty(i) == false) {
			continue;
		}

		newObj[i] = from[i];
	}
	return newObj;
}

function cloneObjectExcept(object, excludes) {
	var newObj = {};
	excludes = excludes || [];

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