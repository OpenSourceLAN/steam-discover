


var protobuf = require("protocol-buffers"),
    dgram = require("dgram"),
    fs = require("fs"),
    bignum = require("bignum"),
    events = require("events");


var messageTypes = protobuf(fs.readFileSync("steamdiscover.proto"));


function create(opts) {
  opts = opts || {};

  var event_emitter = new events();

  var server = dgram.createSocket("udp4");
  
  server.on("message", (m, rinfo) => {
    event_emitter.emit("raw_message", {message: m, sender: rinfo });

    var offset = 0;
    offset += 8;
  
    var headerLength = m.readUInt32LE(offset);
    offset += 4; // 32 bit 
  
  
    var header = m.slice(offset, offset + headerLength);
    var headerContent =  messageTypes.CMsgRemoteClientBroadcastHeader.decode(header);
  
    offset += headerLength;
  
    var bodyLength = m.readUInt32LE(offset);
    offset += 4; // 32 bit
    
    if (headerContent.msg_type == 1 ) {   /* k)ERemoteClientBroadcastMsgStatus */
      var body_data = m.slice(offset, offset + bodyLength);
      
      var body_content = messageTypes.CMsgRemoteClientBroadcastStatus.decode(body_data);
      
      var steamid_buffer = (body_content.users[0] || {} ).steamid;
      if (steamid_buffer) {
        var steamid = bignum.fromBuffer(steamid_buffer, { endian: "little", size: 'auto'} )
        event_emitter.emit("client_seen", { steam_id: steamid.toString() });
      } 
    }
  });
  
  server.bind(opts.port || 27036, opts.ip || "0.0.0.0");
  
  return event_emitter;
}

function broadcastDiscovery(server) {
//  var buf = messageTypes.
    

}


module.exports = {
  create: create

};
