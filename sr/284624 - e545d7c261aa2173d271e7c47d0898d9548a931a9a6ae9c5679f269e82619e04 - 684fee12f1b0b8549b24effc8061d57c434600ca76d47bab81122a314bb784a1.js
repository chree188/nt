"use strict";

var Player = function(text) {
  if (text) {
    var obj = JSON.parse(text);
    this.name = obj.name;
    this.score = obj.score;
    this.message = obj.message;
  } else {
    this.name = "";
    this.score = 0;
    this.message = '';
  }
};

Player.prototype = {
  toString: function() {
    return JSON.stringify(this);
  }
};

var Tetris = function() {
  LocalContractStorage.defineMapProperty(this, "players", {
    parse: function(text) {
      return new Player(text);
    },
    stringify: function(o) {
      return o.toString();
    }
  });

  LocalContractStorage.defineMapProperty(this, "indexMap");
};

//Ã¤Â¿ÂÃ§Â½ÂÃ¦ÂÂ¯Ã¦ÂÂ¹Ã¥ÂÂ
Tetris.prototype = {
  init: function() {
    this.size = 0;
  },
  pay: function() {
    var from = Blockchain.transaction.from;
    var player = new Player();
    player.name = from;
    player.score = 0;
    player.message = '';
    this.players.put(from, player);
    this.indexMap.set(this.size, from);
    this.size += 1;
  },
  get: function() {
    var from = Blockchain.transaction.from;
    return this.players.get(from);
  },
  getList: function() {
    var result = [],
      length = this.size > 5 ? 5 : this.size;

    for (var i = 0; i < length; i++) {
      var key = this.indexMap.get(i);
      var player = this.players.get(key);
      result.push(player)
    }

    return result;
  },
  score: function(score, message) {
    var from = Blockchain.transaction.from;
    var player = new Player();
    player.name = from;
    player.score = score;
    player.message = message;
    this.players.put(from, player);
  }
};
module.exports = Tetris;