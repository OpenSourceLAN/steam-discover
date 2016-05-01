"use strict";

/**
 * TODO: make this ingest steam IDs as an event stream, and 
 *       cache them and then poll the steam API in batches 
 *       every now and again. Or not, depending on options :)
 */

var steam = require('steam-api'),
    events = require('events');

class SteamApiWrapper extends events {
  constructor(apiKey) {
    super();
    if (!apiKey) { throw "no api key provided to SteamApiWrapper constructor"; }

    this.steamClient = new steam.User(apiKey);
  }

  /**
   * callback - called once for each steamID provided
   */
  getPlayerInfo(steamIds, callback) {
    if (typeof callback !== "function") { throw "no callback given"; }

    var client = this.steamClient.GetPlayerSummaries(steamIds);
    client.done(function(playersInfo,r) {
        playersInfo = Array.isArray(playersInfo) ? playersInfo : [playersInfo];
        
        playersInfo.forEach(function(p) {
          callback(null, p);
        });
    });
    client.fail(function(e) { console.error("Failed to fetch user list: ", e); });
  }

  /**
   * steamIds - array of strings, each on a single steam ID
   * callback - called once per steamid given
   */
  getBulkPlayerInfo(steamIds, callback) {
    if (Array.isArray(steamIds) == false || typeof callback !== "function") {
      console.error("invalid args to getBulkPlayerInfo");
      return;
    }

    // clone array so that our modifications don't affect the caller's copy
    steamIds = steamIds.slice(0);

    while (steamIds.length > 0) {
       var thisBatch = steamIds.splice(0,100);
       var steamIdsString = thisBatch.join(",");
       this.getPlayerInfo(steamIdsString, callback);
    }
  }
}


module.exports = {
   create: function(apiKey) { return new SteamApiWrapper(apiKey); }
}
