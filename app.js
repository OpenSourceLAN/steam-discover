// https://codingrange.com/blog/steam-in-home-streaming-discovery-protocol
// https://www.npmjs.com/package/protocol-buffers
// https://github.com/SteamRE/SteamKit/blob/master/Resources/Protobufs/steamclient/steammessages_remoteclient_discovery.proto
// https://developer.valvesoftware.com/wiki/Steam_Web_API#GetPlayerSummaries_.28v0001.29

var listener = require("./listener.js"),
    steam = require("./steamapiwrapper"), 
    fs = require("fs"),
    querybuffer = require('./querybuffer.js'),
    redis = require('redis'),
    configurator = require('./configurator.js');

var interval = 15000;

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
  if (qb) qb.addItem(d);
});
l.on("raw_message", function(m) {
    var rinfo = m.sender;
//    console.log(`got message from ${rinfo.address}:${rinfo.port}`);
});
l.on("invalid_packet", function(d) { 
    console.log("Invalid packet, reason: " + d.reason);
});

l.on("connected", () => {
  setInterval( () => {
    l.broadcastDiscovery();
  }, interval);
  l.broadcastDiscovery();
});
 
var r = redis.createClient();

var qb = new querybuffer(interval, (items) => {
  if (Array.isArray(items)) {
    var items = items.map((p) => {return p.steam_id;});
    items = getUnique(items);
 
    while (items.length > 0) {
      toGet = Math.min(100, items.length);
      var ourItems = items.slice(0,toGet);
      items = items.slice(toGet,items.length);

      var ids_string = ourItems.join(",");
      console.log("!!!! Querying: ", ourItems.length);

//return;
      steamApiWrapper.getPlayerInfo(ids_string, function(err,p) {
        if (p.gameextrainfo) { 
          var extraInfo = ` playing game '${p.gameextrainfo}'`;
        }
    
        console.log(`Saw steam user ${p.personaName}${extraInfo||''}`);

        r.lpush("players", JSON.stringify({
           name: p.personaName,
           steam_id: p.steamid,
           time: new Date(),
           gameid: p.gameid,
           gamename: p.gameextrainfo
 
         }));
      });
    }
  }

});
