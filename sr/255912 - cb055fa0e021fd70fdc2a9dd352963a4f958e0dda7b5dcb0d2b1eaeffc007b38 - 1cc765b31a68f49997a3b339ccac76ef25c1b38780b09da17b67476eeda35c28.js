"use strict";

var SwearContent = function(text) {
  if (text) {
    var obj = JSON.parse(text);
    this.content = obj.content;
    this.timestamp = obj.timestamp;
  } else {
    this.content = "";
    this.timestamp = "";
  }
}

var SwearContract = function() {
  LocalContractStorage.defineMapProperty(this, "userSwearContentMap", {
    parse: function(text) {
      return JSON.parse(text);
    },
    stringify: function(c) {
      return JSON.stringify(c);
    }
  })
};

SwearContract.prototype = {
  init: function() {

  },
  get: function() {
    var from = Blockchain.transaction.from;
    return this.userSwearContentMap.get(from);
  },

  save: function(content, timestamp) {
    content = content.trim();
    timestamp = timestamp.trim();
    var from = Blockchain.transaction.from;
    var swearContentArr = []
    // console.log("------11------");
    // console.log(this.userSwearContentMap.get(from));
    if (this.userSwearContentMap.get(from)) {
      // console.log("------if----");
      swearContentArr = this.userSwearContentMap.get(from);
    } else {
      // console.log("------else----");
      swearContentArr = []
    }
    var swearContent = new SwearContent();
    swearContent.content = content;
    swearContent.timestamp = timestamp;
    // console.log("-------swearContent-------");
    // console.log(swearContent);
    swearContentArr.push(swearContent)
    // console.log("------after push--------");
    // console.log(swearContentArr);

    this.userSwearContentMap.set(from, swearContentArr)

    return swearContentArr
  }
};

module.exports = SwearContract;
