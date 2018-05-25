"use strict";

var Wish = function(text) {
  if (text) {
    var obj = JSON.parse(text);
    this.name = obj.name;
    this.content = obj.content;
    this.from = obj.from;
    this.time = obj.time;

  } else {
    this.name = "";
    this.content = "";
    this.from = "";
    this.time = "";

  }
};

Wish.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

var WishContract = function () {
  LocalContractStorage.defineMapProperty(this, "repo", {
    parse: function (text) {
      return new Wish(text);
    },
    stringify: function (o) {
      return o.toString();
    }
  });
};

WishContract.prototype = {
  init: function () {

  },

  save: function (name, content) {

    name = name.trim();
    content = content.trim();
    if (name === "" || content === ""){
      throw new Error("empty name / content");
    }

    var wish = this.repo.get(name);

    if (wish){
      content = wish.content+","+content;
    }

    wish = new Wish();
    wish.name = name;
    wish.content = content;
    wish.from = Blockchain.transaction.from;
    wish.time = Blockchain.transaction.timestamp;

    this.repo.put(name, wish);
  },

  get: function (key) {
    key = key.trim();
    if ( key === "" ) {
      throw new Error("empty key")
    }
    return this.repo.get(key);
  }
};
module.exports = WishContract;