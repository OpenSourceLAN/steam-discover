// https://codingrange.com/blog/steam-in-home-streaming-discovery-protocol
// https://www.npmjs.com/package/protocol-buffers
// https://github.com/SteamRE/SteamKit/blob/master/Resources/Protobufs/steamclient/steammessages_remoteclient_discovery.proto

var listener = require("./listener.js");

var l = listener.create({port: 27036, ip: "0.0.0.0"} );
l.on("client_seen", function(d) { console.log("Saw: " + d.steam_id); });
l.on("raw_message", function(m) {
    var rinfo = m.sender;
    console.log(`got message from ${rinfo.address}:${rinfo.port}`);
});
l.on("invalid_packet", function(d) { console.log("Invalid packet, reason: " + d.reason); });

