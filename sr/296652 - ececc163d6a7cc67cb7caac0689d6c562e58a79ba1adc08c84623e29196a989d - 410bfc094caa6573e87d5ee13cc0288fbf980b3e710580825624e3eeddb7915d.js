"use strict";

var ImusicItem = function(res) {
  if(res) {
    var obj = JSON.parse(res)
    this.no = obj.no
    this.name = obj.name
    this.des = obj.des
    this.md5 = obj.md5
    this.borrower = obj.borrower
  } else {
    this.no = ""
    this.name = ""
    this.des = ""
    this.md5 = ""
    this.borrower = ""
  }
};

ImusicItem.prototype = {
  toString: function() {
    return JSON.stringify(this)
  }
}

var NasImusic = function() {
  LocalContractStorage.defineMapProperty(this, "repo", {
    parse: function (res) {
      return new ImusicItem(res)
    },
    stringify: function (o) {
      return o.toString()
    }
  }); 
}

NasImusic.prototype = {
  init: function() {},

  save: function(no, name, des, md5) {
    no = no.trim()
    name = name.trim()
    des = des.trim()
    md5 = md5.trim()
    var from = Blockchain.transaction.from;
    var imusicItem = this.repo.get(no);
    
    if(imusicItem) {
      throw new Error("imusic has been borrowed");
    }

    imusicItem = new ImusicItem();
    imusicItem.no = no;
    imusicItem.name = name;
    imusicItem.des = des;
    imusicItem.md5 = md5;
    imusicItem.borrower = from;

    this.repo.put(no, imusicItem);

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

module.exports = NasImusic;