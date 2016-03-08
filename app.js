// https://codingrange.com/blog/steam-in-home-streaming-discovery-protocol
// https://www.npmjs.com/package/protocol-buffers
// https://github.com/SteamRE/SteamKit/blob/master/Resources/Protobufs/steamclient/steammessages_remoteclient_discovery.proto

var protobuf = require("protocol-buffers"),
    dgram = require("dgram"),
    fs = require("fs"),
    bignum = require("bignum");


var messageTypes = protobuf(fs.readFileSync("steamdiscover.proto"));


var server = dgram.createSocket("udp4");

server.on("message", (m, rinfo) => {
  var offset = 0;
  console.log(`got message from ${rinfo.address}:${rinfo.port}`);
  offset += 8;

  var headerLength = m.readUInt32LE(offset);
  offset += 4; // 32 bit 


  var header = m.slice(offset, offset + headerLength);
  var headerContent =  messageTypes.CMsgRemoteClientBroadcastHeader.decode(header);
  console.log(headerContent);

  offset += headerLength;

  var bodyLength = m.readUInt32LE(offset);
  offset += 4; // 32 bit
  
  if (headerContent.msg_type == 1 ) {   /* k)ERemoteClientBroadcastMsgStatus */
    var body_data = m.slice(offset, offset + bodyLength);
    
    var body_content = messageTypes.CMsgRemoteClientBroadcastStatus.decode(body_data);
    console.log(body_content);
    
    var steamid_buffer = (body_content.users[0] || {} ).steamid;
    if (steamid_buffer) {
      var steamid = bignum.fromBuffer(steamid_buffer, { endian: "little", size: 'auto'} )
      console.log(steamid.toString());
    } 
  }
});

server.bind(27036);



function broadcastDiscovery(server) {
    
    

}

