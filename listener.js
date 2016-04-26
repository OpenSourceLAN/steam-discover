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
    events = require("events"),
    BufferAppender = require("./BufferAppender.js");

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

    if (headerContent.msg_type == messageTypes.ERemoteClientBroadcastMsg.k_ERemoteClientBroadcastMsgStatus) {
      var body_data = m.slice(offset, offset + bodyLength);

      this.parseBody(body_data, bodyLength);

    }
    else 
    {
       // Useful for debugging - type 0 is a discovery packet from another client
       //if (headerContent.msg_type === 0) {
       //  var body_data = m.slice(offset, offset + bodyLength);
       //  var discoveryPacket = messageTypes.CMsgRemoteClientBroadcastDiscovery.decode(body_data);
       //}
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

    var body = messageTypes.CMsgRemoteClientBroadcastDiscovery.encode({
      seq_num: seqNum++
    });
    this.sendSteamMessage(0, body);
  }

  sendSteamMessage(messageType, body) {
    var headerBuf = messageTypes.CMsgRemoteClientBroadcastHeader.encode({
      client_id: Math.ceil(Math.random() * 100000000),
      msg_type: messageType
    });

    var int32Length = 4;
    var writeOffset = 0;
    var totalMessageLength = 8 + int32Length + headerBuf.length + int32Length + body.length;
    var messageBuf = new BufferAppender(totalMessageLength);

    messageBuf.appendBuffer(packetMagicBytes);
    messageBuf.appendUInt32LE(headerBuf.length);
    messageBuf.appendBuffer(headerBuf);
    messageBuf.appendUInt32LE(body.length);
    messageBuf.appendBuffer(body);

    this.sendBroadcast(messageBuf.buffer);
  }
}

function create(opts) {
  return new Listener(opts);
}


module.exports = {
  create: create
};
