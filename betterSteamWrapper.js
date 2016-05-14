"use strict";

var url = require('url'),
    https = require('https');

//  The npm package `steam-api` sucks and doesn't pass exceptions on to your error handler
// in some cases, so you get unhandled exceptions and the program crashes. To hell with that. 

var templateUrl = "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/";

class betterSteamWrapper {
  constructor (apiKey) {
    this.apiKey = apiKey;
  }

  getPlayerInfo(steamIds, callback) {
    if (typeof callback !== "function") { throw "no callback given"; }
    
    var steamUrl = this.getUrl(steamIds);
    this.doRequest(steamUrl, callback);
  }

  getBulkPlayerInfo(steamIds, callback) {
    if (Array.isArray(steamIds) == false || typeof callback !== "function") {
      console.error("invalid args to getBulkPlayerInfo");
      return;
    }

    // clone array so that our modifications don't affect the caller's copy
    steamIds = steamIds.slice(0);

    while (steamIds.length > 0) {
       var thisBatch = steamIds.splice(0,100);
       this.getPlayerInfo(thisBatch, callback);
    }
  }

  doRequest(url, callback) {
    

    var request = https.request(url, (res) => {
      var data = "";
      res.on("data", (d) => {
        data += d; // TODO: do this less shit
      });
      res.on("end", () => {
        var response;
        try {
          response = JSON.parse(data);
        } catch (e) { callback(e); }

        response.response.players.forEach((p) => {
          callback(null, p); console.log(p);
        });
      });

    });
    request.on("error", (err) => { 
      console.error("Failed to complete steam API request", err);
      callback(err);
    });
    request.end();
  }

  getUrl(steamIdArray) {
    if (Array.isArray(steamIdArray) == false || steamIdArray.length >100) {
      throw "Steam ID Array must be an array and less than 101 values";
    }
    var steamUrl = url.parse(templateUrl, true);
    steamUrl.query.key = this.apiKey;
    steamUrl.query.format = "json";
    steamUrl.query.steamids = steamIdArray.join(",");
    return url.format(steamUrl);
  }
}

module.exports = betterSteamWrapper;
