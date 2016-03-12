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

    this.steamClient.GetPlayerSummaries(steamIds).done(function(playersInfo,r) {
        playersInfo = Array.isArray(playersInfo) ? playersInfo : [playersInfo];
        
        playersInfo.forEach(function(p) {
          callback(null, p);
        });
    });
  }
}


module.exports = {
   create: function(apiKey) { return new SteamApiWrapper(apiKey); }
}
