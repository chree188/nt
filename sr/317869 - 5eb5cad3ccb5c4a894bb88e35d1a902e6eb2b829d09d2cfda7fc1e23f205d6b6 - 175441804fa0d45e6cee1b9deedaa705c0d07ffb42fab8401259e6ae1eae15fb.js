'use strict';

var Record = function (text) {
  if (text) {
    var o = JSON.parse(text);
    this.idx = o.idx;
    this.owner = o.owner;
    this.addTime = o.addTime;
    this.title = o.title;
    this.content = o.content;
  }
};

Record.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

var StorageContract = function(){
	LocalContractStorage.defineProperty(this, "totalSize");
	LocalContractStorage.defineMapProperty(this, "records", {
    parse: function (text) {
      return new Record(text);
    },
    stringify: function (o) {
      return o.toString();
    }
  });
}

StorageContract.prototype = {
  init: function () {
  	this.totalSize = 0;
  },

  add:function(title,content){
  	var from = Blockchain.transaction.from;
  	var ts = Blockchain.transaction.timestamp;

  	var rec = new Record();
  	rec.idx = this.totalSize;
  	rec.owner = from;
  	rec.addTime = ts;
  	rec.title = title;
  	rec.content = content;

  	this.records.put(this.totalSize,rec);
  	this.totalSize++;

  	return rec;
  },

  read:function(idx){
  	return this.records.get(idx);
  },

  list:function(){
  	var list = [];
    for(var i = 0;i < this.totalSize; i++){
      list.push(this.read(i));
    }
    return list;
  },

  descList:function(){
  	var list = [];
  	for(var i = this.totalSize-1;i >= 0; i--){
  		list.push(this.read(i));
  	}
  	return list;
  },

  getTotal:function(){
  	return this.totalSize;
  },
 }

 module.exports = StorageContract;