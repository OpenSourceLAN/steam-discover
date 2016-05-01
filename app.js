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
    dbwrapper = require("./dbwrapper.js"),
    configurator = require('./configurator.js');

var interval = 3000,
    batchId = 1,
    db = new dbwrapper("postgres://postgres@localhost/steam"),
    debug = false;

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

try {
    var apiKey = fs.readFileSync("./apikey.txt").toString().replace(/[\W \n\r]/g, "");
} catch (e)
{ 
    console.error("Create the file 'apikey.txt' in the working directory, which contains your API key from http://steamcommunity.com/dev/apikey"); 
    require("process").exit(1);
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
 
//var r = redis.createClient();

var qb = new querybuffer(interval, (items) => {
  var thisBatch = batchId++;

  if (Array.isArray(items)) {
    var ids  = items.map((p) => {return p.users[0].steamid;});
    ids = getUnique(ids);

    console.log("!!!! Querying: ", ids.length);

    steamApiWrapper.getBulkPlayerInfo(ids, function(err,p) {
      db.insertAccount(p, thisBatch);

      if (p.gameextrainfo) {
        var extraInfo = ` playing game '${p.gameextrainfo}'`;
      }

      console.log(`Saw steam user ${p.personaName}${extraInfo||''}`);
    });
  }
});


if (debug) {
  l.on("raw_message", function(m) {
    var rinfo = m.sender;
  //    console.log(`got message from ${rinfo.address}:${rinfo.port}`);
  });
  l.on("invalid_packet", function(d) { 
      console.log("Invalid packet, reason: " + d.reason);
  });
}