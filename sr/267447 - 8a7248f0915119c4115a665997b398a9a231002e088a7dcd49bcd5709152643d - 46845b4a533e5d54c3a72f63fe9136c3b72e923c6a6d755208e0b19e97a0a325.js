"use strict";

var VoteItem = function (text) {
  if (text) {
    var obj = JSON.parse(text);
    this.key = obj.key;
    this.value = obj.value;
    this.text = obj.text;
    this.count = obj.count;
    this.time = obj.time;
  } else {
    this.key = "";
    this.text = "";
    this.value = "";
    this.count = "";
    this.time = "";
  }
};

VoteItem.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

var StarVote = function () {
  LocalContractStorage.defineMapProperty(this, "starVoteKey");
  LocalContractStorage.defineProperty(this, "size");
  LocalContractStorage.defineMapProperty(this, "starVote", {
    parse: function (text) {
      return new VoteItem(text);
    },
    stringify: function (o) {
      return o.toString();
    }
  });
};

StarVote.prototype = {
  init: function () {
    // todo
    this.size = 0;
  },

  save: function (key, value,time) {

    key = key.trim();
    value = value.trim();
    if (key === "" || value === "") {
      throw new Error("empty key / value");
    }

    var from = Blockchain.transaction.from;
    var voteItem = this
      .starVote
      .get(key);
    if (voteItem) {
      throw new Error("value has been occupied");
    }

    voteItem = new VoteItem();
    voteItem.text = from;
    voteItem.key = key;
    voteItem.value = value;
    voteItem.count = 0;
    voteItem.time = time;
    var index = this.size;
  
    this.starVoteKey.set(index,key);
    this.starVote.set(key, voteItem);
    this.size = index + 1;
    return this.size
  },

  get: function (key) {
    key = key.trim();
    if (key === "") {
      throw new Error("empty key")
    }
    return this.starVote.get(key);
  },
  getAll: function (limit,offset){
    limit = parseInt(limit);
    offset = parseInt(offset);
    var number = offset * (limit+1);
    if(number > this.size){
      number = this.size;
    }
    var list = [];
    for(var i=limit;i<number;i++){
      var key = this.starVoteKey.get(i);
      var object = this.starVote.get(key);
      list.push(object)
    }
    // return list;
    return list
    //return {"data":"success","content":this.starVote};
  }
};
module.exports = StarVote;