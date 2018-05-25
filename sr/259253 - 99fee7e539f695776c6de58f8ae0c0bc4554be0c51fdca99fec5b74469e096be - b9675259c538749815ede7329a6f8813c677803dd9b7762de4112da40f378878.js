'use strict';

var Bottle = function (text) {
  if (text) {
    var o = JSON.parse(text);
    this.from = o.from;
    this.txt = o.txt;
    this.readed = o.readed;
  }
};


Bottle.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};



var DriftingBottle = function(){
	LocalContractStorage.defineProperty(this, "playTimes");
  LocalContractStorage.defineProperty(this, "bottles");
  LocalContractStorage.defineProperty(this, "unReadBottles");

	
	LocalContractStorage.defineMapProperty(this, "sea", {
    parse: function (text) {
      return new Bottle(text);
    },
    stringify: function (o) {
      return o.toString();
    }
  });

  LocalContractStorage.defineMapProperty(this, "tokens", {
    parse: function (text) {
      return new Bottle(text);
    },
    stringify: function (o) {
      return o.toString();
    }
  });

}

DriftingBottle.prototype = {
  init: function () {
  	this.playTimes = 0;
  	this.bottles = 0;
    this.unReadBottles = 0;
    this.operateSize = 0;
  },

  
  throwBottle:function(text){
  	var from = Blockchain.transaction.from;

    this.playTimes += 1;
    this.unReadBottles += 1;

  	var bottle = new Bottle();
    bottle.txt = text;
    bottle.from = from.substr(0,10)+"**********"+from.substr(20);
    bottle.readed = 0;

    this.sea.put(this.bottles,bottle);
    this.bottles += 1;

  	return "success";
  },

  salvage:function(){
    this.playTimes += 1;

    var txHash = Blockchain.transaction.hash;
    var from = Blockchain.transaction.from;

    if(this.bottles == 0){
      throw new Error("no bottle in the sea yet!");
    }

    var idx = this._nextRandomNum();
    var b = this.sea.get(idx);

    this.tokens.put(txHash,b);

    if(b.readed == 0){
      b.readed = 1;
      this.unReadBottles -= 1;
      this.sea.put(idx,b);  
    }

    return "your token:"+txHash;
  },

  _nextRandomNum:function(){
    if(this.bottles == 0){
      return 0;
    }
    return Blockchain.transaction.timestamp % this.bottles;
  },

  _nextOperate:function(){
    return this.operateSize++;
  },

  gainBottle:function(token){
    return this.tokens.get(token);
  },

  getBottles:function(){
    return this.bottles;
  },

  getUnReadBottles:function(){
    return this.unReadBottles;
  },

  getPlayTimes:function(){
    return this.playTimes;
  },

 }

 module.exports = DriftingBottle;