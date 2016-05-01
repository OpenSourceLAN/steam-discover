"use strict";


class querybuffer {

  constructor(millisecondsBetweenResults, callback) {
    this.timeInterval = millisecondsBetweenResults;
    this.items = [];
    this.callback = callback;

    if (typeof this.timeInterval !== "number" || this.timeInterval <= 0 || typeof this.callback !== "function") {
       throw "invalid arguments";
    }
    var t = this;
    this.interval = setInterval(() => {t.interval_event(); }, this.timeInterval);
  }

  interval_event() {

    var items = this.items;
    this.items = [];
    this.callback(items);
  }

  addItem(item) {
    this.items.push(item);
  }

  disable() { clearTimeout(this.interval); }
}

module.exports = querybuffer;
