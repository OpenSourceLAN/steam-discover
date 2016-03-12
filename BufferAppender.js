"use strict";

class BufferAppender {
  constructor(length) {
    this.buffer = new Buffer(length);
    this.offset = 0;
  }
  appendUInt32LE(val) {
    this.buffer.writeUInt32LE(val, this.offset);
    this.offset += 4;
  }
  appendBuffer(val) {
    val.copy(this.buffer, this.offset);
    this.offset += val.length;
  }
}

module.exports = BufferAppender;
