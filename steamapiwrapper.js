"use strict";

/**
 * TODO: make this ingest steam IDs as an event stream, and 
 *       cache them and then poll the steam API in batches 
 *       every now and again. Or not, depending on options :)
 */

var steam = require('steam-api'),
    events = require('events'),
    async = require('async');

var maxConcurrentApiRequests = 2;

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
    var steamIdsStrings = [];

    while (steamIds.length > 0) {
      steamIdsStrings.push(steamIds.splice(0,100).join(","));
    }

    var that = this;
    async.mapLimit(steamIdsStrings, maxConcurrentApiRequests, function getBulkPlayerInfoSteamApiRequest(steamIdList, innerCallback) {
      that.getPlayerInfo(steamIdList, function getPlayerInfoCallback(err, res) {
        callback(err,res);
        innerCallback();
      })
    })
  }
}


module.exports = {
   create: function(apiKey) { return new SteamApiWrapper(apiKey); }
}
