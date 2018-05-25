"use strict";

var GAME = function() {};

GAME.prototype = {
  init: function() {
    LocalContractStorage.put("items", []);
  },

  save: function(value) {
    value = value.trim();
    if (value === "") {
      throw new Error("empty key / value");
    }
    var items = LocalContractStorage.get("items");
    LocalContractStorage.put("items", items.concat([value]));
  },

  getAll: function() {
    var items = LocalContractStorage.get("items");
    return items;
  },

  getNumber: function() {
    var items = LocalContractStorage.get("items");
    return items.length;
  }
};

module.exports = GAME;
