"use strict";

var Player = function(text) {
  if (text) {
    var obj = JSON.parse(text);
    this.name = obj.name;
    this.score = obj.score;
  } else {
    this.name = "";
    this.score = 0; //
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
};

//俄罗斯方块
Tetris.prototype = {
  init: function() {
    // todo
  },
  pay: function() {
    var from = Blockchain.transaction.from;
    var player = new Player();
    player.name = from;
    player.score = 0;
    this.players.put(from, player);
  },
  get: function(name) {
    name = name.trim();
    if (name === "") {
      throw new Error("empty name")
    }
    return this.players.get(name);
  },
  score: function(score) {
    var from = Blockchain.transaction.from;
    var player = new Player();
    player.name = from;
    player.score = score;
    this.players.put(from, player);
  }
};
module.exports = Tetris;