// https://codingrange.com/blog/steam-in-home-streaming-discovery-protocol
// https://www.npmjs.com/package/protocol-buffers
// https://github.com/SteamRE/SteamKit/blob/master/Resources/Protobufs/steamclient/steammessages_remoteclient_discovery.proto
// https://developer.valvesoftware.com/wiki/Steam_Web_API#GetPlayerSummaries_.28v0001.29

// OS types (as seen in broadcast packets:
// 10: win 7
// 16: win 10???
// 18446744069414584000: osx 10.10 (yosemite) (smells like an int/floatingpoint/overflow/something)

var listener = require("./listener.js"),
    steam = require("./steamapiwrapper"), 
    fs = require("fs"),
    querybuffer = require('./querybuffer.js'),
    redis = require('redis'),
    dbwrapper = require("./dbwrapper.js");

var config = require("./config.json");

if (!config.steamApiKey || !config.postgresConnectionString) {
  throw "steamApiKey and postgresConnectionString are required keys in config.json";
}

var interval = (config.broadcastIntervalSeconds || 30) * 1000,
    batchId = 1,
    db = new dbwrapper(config.postgresConnectionString),
    debug = !!config.enableDebugConsoleMessages,
    apiKey = config.steamApiKey;

if (config.enableRedisUpdatePublishing) {
  var r = redis.createClient(config.redisConnectionString);
}

function getUnique (arr) {
  var seen = {};
  var ret = [];

  arr.filter(function(item) {
    if (!seen[item]) {
      ret.push(item);
      seen[item] = true;
    }
  });
  return ret;
}

var steamApiWrapper = steam.create(apiKey);

var l = listener.create({port: 27036, ip: "0.0.0.0"} );
l.on("client_seen", function(d) {
  db.insertClient(d, batchId);
  if (qb) qb.addItem(d);
});


l.on("connected", () => {
  setInterval( () => {
    l.broadcastDiscovery();
  }, interval);
  l.broadcastDiscovery();
});
 


var qb = new querybuffer(interval, (items) => {
  var thisBatch = batchId++;

  if (Array.isArray(items)) {
    var ids  = items.map((p) => {return p.users[0].steamid;});
    ids = getUnique(ids);

    console.log("!!!! Querying: ", ids.length);

    steamApiWrapper.getBulkPlayerInfo(ids, function(err,p) {
      db.insertAccount(p, thisBatch);
      publishPlayerUpdateToRedis(p);

      if (p.gameextrainfo) {
        var extraInfo = ` playing game '${p.gameextrainfo}'`;
      }

      console.log(`Saw steam user ${p.personaName}${extraInfo||''}`);
    });
  }
});

function publishPlayerUpdateToRedis(player) {
  r.publish("steam-update", JSON.stringify({
    steamid: player.steamId,
    gameid: player.gameid,
    gamename: player.gameextrainfo
  }));
}

if (debug) {
  l.on("raw_message", function(m) {
    var rinfo = m.sender;
    console.log(`got message from ${rinfo.address}:${rinfo.port}`);
  });
  l.on("invalid_packet", function(d) { 
      console.log("Invalid packet, reason: " + d.reason);
  });
}