"use strict";

class redis {
	constructor(conString, readyCallback) {
		this.conString = conString;
	}

	insertClient(clientInfo, batchId) {
		// For the current redis use case, we don't care about client sightings - 
		// only account sightings, since they have the juice that we want to send 
		// to the visualiser
	}

	insertAccount(accountInfo, batchId) {
	    r.publish("steam-update", JSON.stringify({
			steamid: player.steamId,
			gameid: player.gameid,
			gamename: player.gameextrainfo
	    }));
	}
}

module.exports = redis;
