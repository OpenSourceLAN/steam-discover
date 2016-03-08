// https://codingrange.com/blog/steam-in-home-streaming-discovery-protocol
// https://www.npmjs.com/package/protocol-buffers
// https://github.com/SteamRE/SteamKit/blob/master/Resources/Protobufs/steamclient/steammessages_remoteclient_discovery.proto

var protobuf = require("protocol-buffers"),
    dgram = require("dgram"),
    fs = require("fs");


var messageTypes = protobuf(fs.readFileSync("steamdiscover.proto"));


var server = dgram.createSocket("udp4");

server.on("message", (m, rinfo) => {
//try {
  var offset = 0;
  console.log(`got message: ${m} from ${rinfo.address}:${rinfo.port}`);
  console.log(m.slice(0,8).toString('hex'));
  offset += 8;

  var headerLength = m.readUInt32LE(offset);
  offset += 4; // 32 bit 

  console.log(`header length: ${headerLength}`);

  var header = m.slice(offset, offset + headerLength);
  console.log(header.toString('hex'));
  var headerContent =  messageTypes.CMsgRemoteClientBroadcastHeader.decode(header);
  console.log(headerContent);

  offset += headerLength;

  var bodyLength = m.readUInt32LE(offset);
  offset += 4; // 32 bit
  
  if (headerContent.msg_type == 1 ) {   /* k)ERemoteClientBroadcastMsgStatus */
    var body_data = m.slice(offset, offset + bodyLength);
    
    var body_content = messageTypes.CMsgRemoteClientBroadcastStatus.decode(body_data);
    console.log(body_content);

  }
//  } catch (e) { console.log("Error: " + e + "\n\n");}
});

server.bind(27036);

//messagesTypes["CMsgRemoteClientBroadcastStatus"].decode("");


function broadcastDiscovery(server) {
    
    

}

