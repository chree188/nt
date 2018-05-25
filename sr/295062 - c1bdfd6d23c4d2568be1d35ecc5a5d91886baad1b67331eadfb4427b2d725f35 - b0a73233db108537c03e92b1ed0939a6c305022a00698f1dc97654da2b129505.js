"use strict";

var IouItem = function(res) {
  if(res) {
    var obj = JSON.parse(res)
    this.no = obj.no
    this.name = obj.name
    this.des = obj.des
    this.amt = obj.amt
    this.borrower = obj.borrower
  } else {
    this.no = ""
    this.name = ""
    this.des = ""
    this.amt = ""
    this.borrower = ""
  }
};

IouItem.prototype = {
  toString: function() {
    return JSON.stringify(this)
  }
}

var NasIou = function() {
  LocalContractStorage.defineMapProperty(this, "repo", {
    parse: function (res) {
      return new IouItem(res)
    },
    stringify: function (o) {
      return o.toString()
    }
  }); 
}

NasIou.prototype = {
  init: function() {},

  save: function(no, name, des, amt) {
    no = no.trim()
    name = name.trim()
    des = des.trim()
    amt = amt.trim()
    var from = Blockchain.transaction.from;
    var iouItem = this.repo.get(no);
    
    if(iouItem) {
      throw new Error("iou has been borrowed");
    }

    iouItem = new IouItem();
    iouItem.no = no;
    iouItem.name = name;
    iouItem.des = des;
    iouItem.amt = amt;
    iouItem.borrower = from;

    this.repo.put(no, iouItem);

  },

  get: function(no) {
    no = no.trim();
    if ( no === "" ) {
      //return this.repo.get();
      throw new Error("empty no")
    }

    return this.repo.get(no);
  }
}

module.exports = NasIou;