"use strict";

var Record = function(text) {
  if (text) {
    var obj = JSON.parse(text)
    this.address = obj.address
    this.score = obj.score
  }
};

Record.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

var Result = function(text) {
    if (text) {
        var obj = JSON.parse(text)
        this.record = obj.record
        this.myRecord = obj.myRecord
    }
};

Result.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var JumpRecord = function () {
  LocalContractStorage.defineProperty(this,"record",{
      parse: function (text) {
          return new Record(text);
      },
      stringify: function (o) {
          return o.toString();
      }
  });
  LocalContractStorage.defineMapProperty(this,
      "myRecord", {
  parse: function (text) {
    return new Record(text);
  },
  stringify: function (o) {
    return o.toString();
  }
  });
};

JumpRecord.prototype = {
  init: function () {
      var r = new Record();
      r.score = 0;
      this.record = r;
  },

  sendScore: function(score){
    var address = Blockchain.transaction.from;
    score = new Number(score);
    if(score > this.record.score){
      var record = new Record();
      record.address = address;
      record.score = score;
      this.record = record;
    }
    var my = this.myRecord.get(address);
    if(my==null||score > my.score){
      my = new Record();
      my.score = score;
      this.myRecord.put(address,my)
    }
  },

  getScore: function(){
    var address = Blockchain.transaction.from;
    var ret = new Result();
    ret.record = this.record;
    var my = this.myRecord.get(address);
    if(my==null){
        my = new Record()
        my.score = 0
    }
    ret.myRecord = my;
    return ret;
  },

  takeout: function (amount) {
      Blockchain.transfer("n1ZaeY53Ho4cdmGxj4XyHVLVbFP8hn4dUFi",amount);
  },
};
module.exports = JumpRecord;