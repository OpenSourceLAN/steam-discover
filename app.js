// https://codingrange.com/blog/steam-in-home-streaming-discovery-protocol


var protobuf = require("protocol-buffers"),
    dgram = require("dgram"),
    fs = require("fs");


var messageTypes = protobuf(fs.readFileSync("steamdiscover.proto"));


var server = dgram.createSocket("udp4");

server.on("message", (m, rinfo) => {
try {
  var offset = 0;
  console.log(`got message: ${m} from ${rinfo.address}:${rinfo.port}`);
  console.log(m.slice(0,8).toString('hex'));
  offset += 8;

  var headerLength = m.readUInt32LE(offset);
  offset += 4; // 32 bit 

  console.log(`header length: ${headerLength}`);

  var header = m.slice(offset, headerLength);
  console.log(header.toString('hex'));
  var headerContent =  messageTypes.CMsgRemoteClientBroadcastHeader.decode(header);
  console.log(headerContent);

  offset += headerLength;

  var bodyLength = m.readUInt32LE(offset);
  offset += 4; // 32 bit
  
  } catch (e) { console.log("Error: " + e + "\n\n");}
});

server.bind(27036);

//messagesTypes["CMsgRemoteClientBroadcastStatus"].decode("");


