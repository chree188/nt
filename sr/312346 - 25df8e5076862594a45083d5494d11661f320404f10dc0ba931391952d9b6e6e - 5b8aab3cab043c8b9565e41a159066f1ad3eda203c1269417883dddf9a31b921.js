"use strict"

var Player = function (infoText) {
  if (infoText) {
    var info = JSON.parse(infoText)
    this.player = info.player
    this.nickName = info.nickName
    this.playTime = info.playTime
    this.playInfo = info.playInfo
  } else {
    this.player = ""
    this.nickName = ""
    this.playTime = ""
    this.playInfo = {}
  }
}

Player.prototype = {
  toString: function () {
    return JSON.stringify(this)
  }
}

var PlayerContract = function () {
  LocalContractStorage.defineMapProperty(this, "player", {
    parse: function (infoText) {
      return new Player(infoText)
    },
    stringify: function (o) {
      return o.toString()
    }
  })
}

PlayerContract.prototype = {
  init: function () {

  },

  save: function (nickName, playTime) {
    var from = Blockchain.transaction.from
    var user = this.player.get(from)
    // console.log(`do update`)
    var player = new Player()
    player.player = from
    player.nickName = nickName
    player.playTime = playTime
    player.playInfo = {}
    this.player.put(from, player);
  },

  get: function () {
    var from = Blockchain.transaction.from
    if (!from) {
      throw new Error("playerName is empty")
    }
    return this.player.get(from)
  }
}

module.exports = PlayerContract