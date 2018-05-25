"use strict";

var TelItem = function(text) {
  if (text) {
    var obj = JSON.parse(text);
    this.index = obj.index;
    this.tel = obj.tel;
    this.name = obj.name;
    this.author = obj.author;
  } else {
    this.index = "";
    this.tel = "";
    this.name = "";
    this.author = "";
  }
};

TelItem.prototype = {
  toString: function() {
    return JSON.stringify(this);
  }
};

var SuperTel = function() {

  LocalContractStorage.defineProperty(this, "indexCount", null);

  LocalContractStorage.defineMapProperty(this, "telmap", {
    parse: function(text) {
      return new TelItem(text);
    },
    stringify: function(o) {
      return o.toString();
    }
  });

  LocalContractStorage.defineMapProperty(this, "indexmap", {
    parse: function(text) {
      return new TelItem(text);
    },
    stringify: function(o) {
      return o.toString();
    }
  });
};

SuperTel.prototype = {
  init: function() {
    this.indexCount = 0;
  },

  save: function(key, value) {

    key = key.trim();
    value = value.trim();
    if (key === "" || value === "") {
      throw new Error("empty key or value");
    }
    if (value.length > 64 || key.length > 64) {
      throw new Error("key or value exceed limit length");
    }

    console.log("init: this.indexCount=" + this.indexCount);

    var count = new BigNumber(this.indexCount).plus(1);

    var from = Blockchain.transaction.from;
    var telItem = this.telmap.get(key);
    if (telItem) {
      throw new Error("value has been occupied");
    }

    telItem = new TelItem();
    telItem.index = count;
    telItem.tel = key;
    telItem.name = value;
    telItem.author = from;

    this.telmap.put(key, telItem);
    this.indexmap.put(count, telItem);

    this.indexCount = count;


  },

  get: function(key, isTel) {

		console.log("key:" + key + "isTel:"+isTel);

    key = key.trim();
    if (key === "") {
      throw new Error("empty key");
    }

    if (isTel) {
      return this.telmap.get(key);
    } else {

      var telItems = [];
  	console.log("get: this.indexCount=" + this.indexCount);

      for (var i = 1; i <= this.indexCount; i++) {

        var telItem = this.indexmap.get(i);

					console.log("telItem=" + telItem);

					console.log("telItem.name.indexOf(key)=" + telItem.name.indexOf(key));


        if (telItem.name.indexOf(key) != -1) {
					 telItems.push(telItem);
				}

      }

      return telItems;
    }

  }
};
module.exports = SuperTel;
