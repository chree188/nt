"use strict";

var WordItem = function(text) {
  if (text) {
    var obj = JSON.parse(text);
    this.key = obj.key;
    this.value = obj.value;
    this.prev_key = obj.prev_key
    this.next_key = obj.next_key
  } else {
    this.key = "";
    this.value = "";
    this.prev_key = "";
    this.next_key = "";
  }
};

WordItem.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

var WordCloud = function () {
  LocalContractStorage.defineMapProperty(this, "repo", {
    parse: function (text) {
      return new WordItem(text);
    },
    stringify: function (o) {
      return o.toString();
    }
  });
};

WordCloud.prototype = {
  init: function () {
    var initItem = new WordItem()
      initItem.key = "0000"
      initItem.value = ""
      initItem.prev_key = ""
      initItem.next_key = ""
      this.repo.put("0000", initItem)
      LocalContractStorage.put("tail", "0000")
  },
  get: function (key) {
    key = key.trim();
    if ( key === "" ) {
      throw new Error("empty key")
    }
    return this.repo.get(key);
  },
  getplain: function(key) {
    if ( key === "" || key.trim() === "") {
      throw new Error("empty key")
    }
    key = key.trim();
    return LocalContractStorage.get(key);
  },
  append: function (key, value, prev_key) {
    if (key === "" || key.trim() === ""){
      throw new Error("empty key");
    }
    var wordItem = this.repo.get(key);
    var preWordItem = this.repo.get(prev_key)
    if (wordItem){
      throw new Error("content has been occupied");
    }
    if(!preWordItem) {
      throw new Error("no prev key");
    }
    wordItem = new WordItem();
    wordItem.key = key;
    wordItem.value = value;
    wordItem.prev_key = prev_key
    preWordItem.next_key = key
    this.repo.put(key, wordItem);
    this.repo.put(prev_key, preWordItem)
    LocalContractStorage.put("tail", key)
  },
  listall: function () {
    var ret = {}
    var head = this.repo.get("0000");
    if(head === null || head === undefined) {
      throw new Error("no such key")
    }
    var next_key = head.next_key
    while(next_key != "") {
      var item = this.repo.get(next_key)
      if(item === null || item === undefined) return ret
      var wordArry = item.value.split("@")
      for(var i = 0; i < wordArry.length; i++) {
        if(wordArry[i] in ret) {
          ret[wordArry[i]] += 1
        } else {
          ret[wordArry[i]] = 1
        }
      }
      next_key = item.next_key
    }
    return ret
  }
};
module.exports = WordCloud;