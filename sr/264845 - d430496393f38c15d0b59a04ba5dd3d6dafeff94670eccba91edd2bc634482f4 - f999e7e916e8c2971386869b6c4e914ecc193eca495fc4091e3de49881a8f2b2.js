'use strict';

var Account = function (text) {
  if (text) {
    var o = JSON.parse(text);
    this.idx = o.idx;
    this.address = o.address;
    this.md5 = o.md5;
    this.nickName = o.nickName;
  }
};

Account.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

var TransLog = function (text) {
  if (text) {
    var o = JSON.parse(text);
    this.idx = o.idx;
    this.from = o.from;
    this.to = o.to;
    this.payMuch = new BigNumber(o.payMuch);
    this.tx = o.tx;
    this.payTime = o.payTime;
  }
};

TransLog.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

var Anonymous = function(){
  LocalContractStorage.defineProperty(this, "transLogSize");
	LocalContractStorage.defineProperty(this, "accountSize");
	LocalContractStorage.defineMapProperty(this, "accounts", {
    parse: function (text) {
      return new Account(text);
    },
    stringify: function (o) {
      return o.toString();
    }
  });
    LocalContractStorage.defineMapProperty(this, "logs", {
    parse: function (text) {
      return new TransLog(text);
    },
    stringify: function (o) {
      return o.toString();
    }
  });
}

Anonymous.prototype = {
  init: function () {
    this.transLogSize = 0;
  	this.accountSize = 0;
  },

  listLog:function(md5){
    var list = [];
  	for(var i = 0;i < this.transLogSize;i++){
  		var log = this.logs.get(i);
      if(log.to == md5){
        list.push(log);
      }
  	}
  	return list;
  },

  occupy:function(md5,address,nickName){
  	var ac = this._getAccount(md5);
    if(ac != null){
      throw new Error("this account has been registed!");
    }

    var item = new Account();
    item.idx = this.accountSize;
    item.md5 = md5;
    item.address = address;
    item.nickName = nickName;

    this.accounts.put(item.idx,item);
    this.accountSize += 1;

    return "success";
  },

  trans:function(md5){
    var ac = this._getAccount(md5);
    if(ac == null){
      throw new Error("account not exist!");
    }

    var much = Blockchain.transaction.value;
    var ts = Blockchain.transaction.timestamp;
    var tx = Blockchain.transaction.hash;

    Blockchain.transfer(ac.address, much);

    var from = Blockchain.transaction.from;
    var log = new TransLog();
    log.idx = this.transLogSize;
    log.from = from;
    log.to  = md5;
    log.payMuch = new BigNumber(much);
    log.payTime = ts;
    log.tx = tx;

    this.logs.put(log.idx,log);
    this.transLogSize += 1;
    return "success";
  },

  _getAccount:function(md5){
    for(var i = 0; i < this.accountSize ;i++){
      var ac = this.accounts.get(i);
      if(ac.md5 == md5) return ac;
    }
    return null;
  },

  listAccout:function(){
    var list = [];
    for(var i = 0; i < this.accountSize ; i++){
      var item = new Account();
      var rc =this.accounts.get(i);
      item.md5 = rc.md5;
      item.nickName = rc.nickName;

      list.push(item);
    }
    return list;
  },

 }

 module.exports = Anonymous;
