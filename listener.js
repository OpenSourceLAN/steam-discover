"use strict";


/**
 * TODO:
 *    * Add length checking everywhere in teh program to stop invalid packets breaking the app
 *    * Add a funciton to send a broadcast packet to prompt discovery replies 
 *    * ???
 */

var protobuf = require("protocol-buffers"),
    dgram = require("dgram"),
    fs = require("fs"),
    bignum = require("bignum"),
    events = require("events");


var messageTypes = protobuf(fs.readFileSync("steamdiscover.proto"));

var packetMagicBytes = new Buffer([0xff, 0xff, 0xff, 0xff, 0x21, 0x4c, 0x5f, 0xa0]);

class Listener extends events {
  constructor(opts) {
    super();
    this.opts = opts || {};
    this.initSocket();

  }


  initSocket() {
    this.server = dgram.createSocket("udp4");
    this.server.on("message", this.receiveMessage.bind(this));
    this.server.bind(this.opts.port || 27036, this.opts.ip || "0.0.0.0");
  }

  // Given a whole packet, read the header, and do stuff!
  receiveMessage(m, rinfo) {
    this.emit("raw_message", {message: m, sender: rinfo });

    if (!m || m.length < 20) {
      this.emit("invalid_packet", {reason: "too short", message: m});
    }

    var offset = 0;
    var indicator = m.slice(0,8);
    
    if (indicator.compare(packetMagicBytes) !== 0) {
      this.emit("invalid_packet", {reason: "magic bytes mismatch", message: m});
    }
    
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

      this.parseBody(body_data, bodyLength);

    }
  }

  // Given a buffer containing an k_ERemoteClientBroadcastMsgStatus, parse the Steam ID 
  parseBody(body_buffer, length) {

      var body_content = messageTypes.CMsgRemoteClientBroadcastStatus.decode(body_buffer);
      
      var steamid_buffer = (body_content.users[0] || {} ).steamid;
      if (steamid_buffer) {
        var steamid = bignum.fromBuffer(steamid_buffer, { endian: "little", size: 'auto'} )
        this.emit("client_seen", { steam_id: steamid.toString() });
      } 

  }
  
}

function create(opts) {

  return new Listener(opts);

  
  
}

function broadcastDiscovery(server) {
//  var buf = messageTypes.
    

}


module.exports = {
  create: create

};
