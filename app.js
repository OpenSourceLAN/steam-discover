// https://codingrange.com/blog/steam-in-home-streaming-discovery-protocol
// https://www.npmjs.com/package/protocol-buffers
// https://github.com/SteamRE/SteamKit/blob/master/Resources/Protobufs/steamclient/steammessages_remoteclient_discovery.proto
// https://developer.valvesoftware.com/wiki/Steam_Web_API#GetPlayerSummaries_.28v0001.29

var listener = require("./listener.js"),
    steam = require("./steamapiwrapper"), 
    fs = require("fs");
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
  steamApiWrapper.getPlayerInfo(d.steam_id, function(err,p) {
    if (p.gameextrainfo) { 
      var extraInfo = ` playing game '${p.gameextrainfo}'`;
    }
    
    console.log(`Saw steam user ${p.personaName}${extraInfo||''}`);
  });
});
l.on("raw_message", function(m) {
    var rinfo = m.sender;
    console.log(`got message from ${rinfo.address}:${rinfo.port}`);
});
l.on("invalid_packet", function(d) { 
    console.log("Invalid packet, reason: " + d.reason);
    console.log(d.message.slice(0,8).toString('hex')); 
});

l.broadcastDiscovery();
