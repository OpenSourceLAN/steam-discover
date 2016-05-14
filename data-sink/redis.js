"use strict";

var redis = require('redis');

class redisWrapper {
	constructor(options, readyCallback) {
		this.conString = options.connectionString;
		this.redis = redis.createClient(this.conString);
	}

	insertClient(clientInfo, batchId) {
		// For the current redis use case, we don't care about client sightings - 
		// only account sightings, since they have the juice that we want to send 
		// to the visualiser
	}

	insertAccount(accountInfo, batchId) {
	    this.redis.publish("steam-update", JSON.stringify({
			steamid: accountInfo.steamid,
			gameid: accountInfo.gameid,
			gamename: accountInfo.gameextrainfo
	    }));
	}
}

module.exports = redisWrapper;
