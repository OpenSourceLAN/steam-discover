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

var seqNum = 1,
    clientId = Math.ceil(Math.random() * 100000000);

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
    this.server.bind(this.opts.port || 27036, this.opts.ip || "10.0.0.100", () => {
      this.server.setBroadcast(true);
      this.emit("connected");
    });

  }

  // Given a whole packet, read the header, and do stuff!
  receiveMessage(m, rinfo) {
    this.emit("raw_message", {message: m, sender: rinfo });

    if (!m || m.length < 20) {
      this.emit("invalid_packet", {reason: "too short", message: m});
    }

    var offset = 0,
        mlength = m.length;
    var indicator = m.slice(0,8);
    
    if (indicator.compare(packetMagicBytes) !== 0) {
      this.emit("invalid_packet", {reason: "magic bytes mismatch", message: m});
      return;
    }
    
    offset += 8;
    var headerLength = m.readUInt32LE(offset);
    offset += 4; // 32 bit 

    if (mlength < offset + headerLength) return;

    var header = m.slice(offset, offset + headerLength);
    var headerContent =  messageTypes.CMsgRemoteClientBroadcastHeader.decode(header);
  
    offset += headerLength;
  
    if (mlength < offset + 4) return;

    var bodyLength = m.readUInt32LE(offset);
    offset += 4; // 32 bit
    
    if (mlength < offset + bodyLength) return;

    if (headerContent.msg_type == 1 ) {   /* k)ERemoteClientBroadcastMsgStatus */
      var body_data = m.slice(offset, offset + bodyLength);

      this.parseBody(body_data, bodyLength);

    }
    else 
    {
// Debugging crap to help figure out wtf is going on
       console.info("content type: ", headerContent.msg_type); 
       if (headerContent.msg_type === 0) {
         var body_data = m.slice(offset, offset + bodyLength);

         var discoveryPacket = messageTypes.CMsgRemoteClientBroadcastDiscovery.decode(body_data);
       }
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

  sendBroadcast(buf) {
    this.server.send(buf, 27036, '255.255.255.255');
  }

  broadcastDiscovery() {
    console.info("sending discovery packet - client broadcast discovery");

    var headerBuf = messageTypes.CMsgRemoteClientBroadcastHeader.encode({
      client_id: clientId,
      msg_type: 0
    });
    var body = messageTypes.CMsgRemoteClientBroadcastDiscovery.encode({
      seq_num: seqNum++
    });

    var int32Length = 4;
    var writeOffset = 0;
    var totalMessageLength = 8 + int32Length + headerBuf.length + int32Length + body.length;
    var messageBuf = new Buffer(totalMessageLength);
    packetMagicBytes.copy(messageBuf,writeOffset);
    writeOffset += packetMagicBytes.length;

    messageBuf.writeUInt32LE(headerBuf.length, writeOffset);
    writeOffset += int32Length;

    headerBuf.copy(messageBuf, writeOffset);
    writeOffset += headerBuf.length;
    
    messageBuf.writeUInt32LE(body.length, writeOffset);
    writeOffset += int32Length;

    body.copy(messageBuf, writeOffset);
    
    this.sendBroadcast(messageBuf);
  }

  /** 
   * This method is superfluous. I wrote it while debugging. 
   * STeam clients don't reply to this, so hardly useful.
   */
  broadcastDiscovery2() {
    console.info("sending discovery packet - client broadcast status");

    var headerBuf = messageTypes.CMsgRemoteClientBroadcastHeader.encode({
      client_id: Math.ceil(Math.random() * 100000000),
      msg_type: 1
    });

    var body = messageTypes.CMsgRemoteClientBroadcastStatus.encode({

       version : 8,
       min_version : 6,
       connect_port : 27036,
       hostname : "squid",
       enabled_services : 0,
       ostype : 10,
       is64bit : true ,
//       users :  [{
//               steamid: new Buffer([ /* your steam ID here in hex */]),
//                auth_key_id:0 /* not sure what this is */ 
//}],
       euniverse : 1,
       timestamp : (new Date()).getTime() / 1000,
       screen_locked : false,
       games_running : true,
       mac_addresses : ["90-2b-34-39-a9-71"],

    });

    var int32Length = 4;
    var writeOffset = 0;
    var totalMessageLength = 8 + int32Length + headerBuf.length + int32Length + body.length;
    var messageBuf = new Buffer(totalMessageLength);
    packetMagicBytes.copy(messageBuf,writeOffset);
    writeOffset += packetMagicBytes.length;

    messageBuf.writeUInt32LE(headerBuf.length, writeOffset);
    writeOffset += int32Length;

    headerBuf.copy(messageBuf, writeOffset);
    writeOffset += headerBuf.length;
    
    messageBuf.writeUInt32LE(body.length, writeOffset);
    writeOffset += int32Length;

    body.copy(messageBuf, writeOffset);
    
    this.sendBroadcast(messageBuf);
  }
  
  sendSteamMessage(messageType, message) {
  

  }
}

function create(opts) {
  return new Listener(opts);
}

module.exports = {
  create: create
};
