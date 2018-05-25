"use strict";

var DictItem = function(text) {
  if (text) {
    var obj = JSON.parse(text);
    this.name = obj.name;
    this.score = obj.score;
  } else {
    this.name = "";
    this.score = 0; //
  }
};

DictItem.prototype = {
  toString: function() {
    return JSON.stringify(this);
  }
};

var SuperDictionary = function() {
  LocalContractStorage.defineMapProperty(this, "players", {
    parse: function(text) {
      return new DictItem(text);
    },
    stringify: function(o) {
      return o.toString();
    }
  });
};

SuperDictionary.prototype = {
  init: function() {
    // todo
  },
  pay: function() {
    var from = Blockchain.transaction.from;
    var dictItem = new DictItem();
    dictItem.name = from;
    dictItem.score = 0;
    this.players.put(from, dictItem);
  },
  get: function(name) {
    name = name.trim();
    if (name === "") {
      throw new Error("empty name")
    }
    return this.players.get(name);
  },
  updateSocre: function(score) {
    var from = Blockchain.transaction.from;
    var player = this.get(form);
    player.score = score;
  }
};
module.exports = SuperDictionary;