'use strict';

var Record = function (text) {
  if (text) {
    var o = JSON.parse(text);
    this.idx = o.idx;
    this.md5 = o.md5;
    this.owner = o.owner;
    this.regTime = o.regTime;
    this.statement = o.statement;
  }
};

Record.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

var Copyright = function(){
	LocalContractStorage.defineProperty(this, "recordSize");
	LocalContractStorage.defineMapProperty(this, "copyrights", {
    parse: function (text) {
      return new Record(text);
    },
    stringify: function (o) {
      return o.toString();
    }
  });
}

Copyright.prototype = {
  init: function () {
  	this.recordSize = 0
  },

  look:function(md5){
  	for(var i = 0;i < this.recordSize;i++){
  		var rec = this.copyrights.get(i);
  		if(rec.md5 == md5) return rec;
  	}

  	return null;
  },

  occupy:function(md5,statement){
  	var rec = this.look(md5);
  	var from = Blockchain.transaction.from;

  	if(rec != null){
  		throw new Error("this md5 has registed!");
  	}

  	var item = new Record();
  	item.idx = this.recordSize;
  	item.md5 = md5;
  	item.owner = from;
  	item.regTime = Blockchain.transaction.timestamp;
  	item.statement = statement;

  	this.copyrights.put(this.recordSize,item);
  	this.recordSize += 1;

  	return "success";

  },

 }

 module.exports = Copyright;
