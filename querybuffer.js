"use strict";


class querybuffer {

  constructor(millisecondsBetweenResults, callback) {
    this.interval = millisecondsBetweenResults;
    this.items = [];
    this.enabled = true;
    this.callback = callback;
    
    if (typeof this.interval !== "number" || this.interval <= 0 || typeof this.callback !== "function") {
       throw "invalid arguments";
    }
var t = this;
    setTimeout(() => {t.interval_event(); }, this.interval);
  }
 
  interval_event() {
    if (this.enabled) {
      setTimeout(this.interval_event.bind(this), this.interval);
    }

    var items = this.items;
    this.items = [];
    this.callback(items);
  }

  addItem(item) {
    this.items.push(item);
  }

  disable() { this.enabled = false; }
}

module.exports = querybuffer;







