"use strict";

var ContentItem = function(text) {
  if (text) {
    var obj = JSON.parse(text);
    this.key = obj.key;
    this.type = obj.type;
    this.value = obj.value;
    this.addr = obj.addr
    this.prev_key = obj.prev_key
    this.next_key = obj.next_key
  } else {
    this.key = "";
    this.type = "";
    this.value = "";
    this.addr = "";
    this.prev_key = "";
    this.next_key = "";
  }
};

ContentItem.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

var ContentRecord = function () {
  LocalContractStorage.defineMapProperty(this, "repo", {
    parse: function (text) {
      return new ContentItem(text);
    },
    stringify: function (o) {
      return o.toString();
    }
  });
};

ContentRecord.prototype = {
  init: function () {
    var contentItem = new ContentItem()
    contentItem.key = "0000"
    contentItem.value = "0000"
    contentItem.prev_key = ""
    contentItem.next_key = ""
    contentItem.addr = ""
    this.repo.put("0000", contentItem)
    LocalContractStorage.put("TAIL", "0000")
  },

  append: function (key, type, value, prev_key) {
    key = key.trim();
    if (key === ""){
      throw new Error("empty key");
    }
    var from = Blockchain.transaction.from;

    var contentItem = this.repo.get(key);
    var preContentItem = this.repo.get(prev_key)
    if (contentItem){
      throw new Error("content has been occupied");
    }
    if(!preContentItem) {
      throw new Error("no prev key");
    }
    contentItem = new ContentItem();
    contentItem.key = key;
    contentItem.value = value;
    contentItem.type = type;
    contentItem.addr = from
    contentItem.prev_key = prev_key
    preContentItem.next_key = key
    this.repo.put(key, contentItem);
    this.repo.put(prev_key, preContentItem)
    LocalContractStorage.put("TAIL", key)
  },
  get: function (key) {
    key = key.trim();
    if ( key === "" ) {
      throw new Error("empty key")
    }
    return LocalContractStorage.get("TAIL")
  },
  listall: function (key) {
    if ( key === "" || key.trim() === "" ) {
      throw new Error("empty key")
    }
    var ret = []
    var head = this.repo.get(key);
    if(head === null || head === undefined) {
      throw new Error("no such key")
    }
    var next_key = head.next_key
    while(next_key != "") {
      var item = this.repo.get(next_key)
      if(item === null || item === undefined) return ret
      ret.push(item)
      next_key = item.next_key
    }
    return ret
  },
  del: function(key) {
    if ( key === "" || key.trim() === "") {
      throw new Error("empty key")
    }
    if ( key === "0000" || key.trim() === "0000") {
      throw new Error("not allowed")
    }
    var head = this.repo.get(key);
    if(head === null || head === undefined) {
      throw new Error("no such key")
    }
    if(Blockchain.transaction.from != "n1azaiw6pFjhm5RbEosjfuEj3wBLji4oWxz" && head.addr != Blockchain.transaction.from) {
      throw new Error("you are not allowed to delete this adv")
    }
    var preItem = this.repo.get(head.prev_key)
    var nextItem = this.repo.get(head.next_key)
    if(nextItem != null && nextItem != undefined) {
      preItem.next_key = nextItem.key
      nextItem.prev_key = preItem.key
      this.repo.put(preItem.key, preItem)
      this.repo.put(nextItem.key, nextItem)
    } else {
      preItem.next_key = ""
      this.repo.put(preItem.key, preItem)
      LocalContractStorage.put("TAIL", preItem.key)
    }

  }
};
module.exports = ContentRecord;