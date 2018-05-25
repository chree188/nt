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
  get: function(from) {
    if (!from) {
      throw new Error("params can not be undefined")
    }
    from = from.trim()
    if (from === "") {
      throw new Error("Empty value is not allowed")
    }
    return this.userSwearContentMap.get(from);
  },

  save: function(content, timestamp) {
    if (!content || !timestamp) {
      throw new Error("params can not be undefined")
    }
    content = content.trim();
    timestamp = timestamp.trim();
    if (content === "" || timestamp === "") {
      throw new Error("Empty value is not allowed")
    }
    if (content.length >= 100 || timestamp.length >= 100) {
      throw new Error("Length should be less than 100")
    }
    var from = Blockchain.transaction.from;
    var swearContentArr = []
    if (this.userSwearContentMap.get(from)) {
      swearContentArr = this.userSwearContentMap.get(from);
    } else {
      swearContentArr = []
    }
    var swearContent = new SwearContent();
    swearContent.content = content;
    swearContent.timestamp = timestamp;
    swearContentArr.push(swearContent)
    this.userSwearContentMap.set(from, swearContentArr)
    return swearContentArr
  }
};

module.exports = SwearContract;
